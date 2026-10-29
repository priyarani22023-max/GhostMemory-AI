/**
 * Frontend API Service for GhostMemory AI
 * Communicates with Netlify Serverless Functions backed by Cloudflare Workers AI.
 * Includes defensive response validation to prevent unhandled HTML/DOCTYPE JSON parsing errors.
 */

import {
  GenerateStoryPayload,
  GenerationResponse,
  HealthCheckResponse,
  CloudflareClientConfig,
  ReimaginePayload,
  RememberPayload,
} from '../types/index.ts';

const SETTINGS_KEY = 'ghostmemory_cf_config_v2';
export const DEFAULT_MODEL = '@cf/google/gemma-4-26b-a4b-it';

export function getClientCloudflareConfig(): CloudflareClientConfig {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        accountId: parsed.accountId || '',
        apiToken: parsed.apiToken || '',
        model: parsed.model || DEFAULT_MODEL,
      };
    }
  } catch {
    // fallback
  }
  return {
    accountId: '',
    apiToken: '',
    model: DEFAULT_MODEL,
  };
}

export function saveClientCloudflareConfig(config: CloudflareClientConfig): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
}

function buildHeaders(): HeadersInit {
  const config = getClientCloudflareConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  };

  if (config.accountId && config.accountId.trim()) {
    headers['x-cloudflare-account-id'] = config.accountId.trim();
  }
  if (config.apiToken && config.apiToken.trim()) {
    headers['x-cloudflare-api-token'] = config.apiToken.trim();
  }
  if (config.model && config.model.trim()) {
    headers['x-cloudflare-ai-model'] = config.model.trim();
  }

  return headers;
}

/**
 * Defensive JSON fetcher that safely inspects Content-Type and response text,
 * preventing "Unexpected token '<', '<!doctype...' is not valid JSON" errors when
 * an endpoint returns an HTML 404 or SPA index.html fallback.
 */
async function safeFetchJson<T>(
  primaryUrl: string,
  options: RequestInit,
  fallbackUrl?: string
): Promise<{ data: T; status: number }> {
  let res: Response;
  let activeUrl = primaryUrl;

  try {
    res = await fetch(primaryUrl, options);
  } catch (netErr: unknown) {
    if (fallbackUrl) {
      try {
        activeUrl = fallbackUrl;
        res = await fetch(fallbackUrl, options);
      } catch {
        throw new Error(
          `Network connection failed when reaching ${primaryUrl}: ${
            netErr instanceof Error ? netErr.message : String(netErr)
          }`
        );
      }
    } else {
      throw new Error(
        `Network connection failed when reaching ${primaryUrl}: ${
          netErr instanceof Error ? netErr.message : String(netErr)
        }`
      );
    }
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text();
  const trimmed = rawText.trim();
  const isHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<HTML');

  // If primary returned HTML (e.g. 404 or SPA rewrite) and we have a fallback URL, try the fallback
  if (isHtml && fallbackUrl && activeUrl === primaryUrl) {
    try {
      activeUrl = fallbackUrl;
      const fallbackRes = await fetch(fallbackUrl, options);
      const fallbackContentType = (fallbackRes.headers.get('content-type') || '').toLowerCase();
      const fallbackText = await fallbackRes.text();
      const fallbackTrimmed = fallbackText.trim();

      const fallbackIsHtml =
        fallbackContentType.includes('text/html') ||
        fallbackTrimmed.startsWith('<!doctype') ||
        fallbackTrimmed.startsWith('<!DOCTYPE') ||
        fallbackTrimmed.startsWith('<html');

      if (!fallbackIsHtml && (fallbackTrimmed.startsWith('{') || fallbackTrimmed.startsWith('['))) {
        const parsed = JSON.parse(fallbackTrimmed) as T;
        return { data: parsed, status: fallbackRes.status };
      }
    } catch {
      // ignore fallback error and report primary diagnostic below
    }
  }

  // If still HTML, provide a clear actionable diagnostic instead of SyntaxError JSON parsing crash
  if (isHtml) {
    if (res.status === 404) {
      throw new Error(
        `Function endpoint ${activeUrl} returned 404 Not Found (HTML). If running in Google AI Studio preview or before deploying to Netlify, verify that serverless functions are compiled and Netlify redirects are configured in netlify.toml.`
      );
    }
    throw new Error(
      `Endpoint ${activeUrl} returned an HTML document (HTTP ${res.status}) instead of JSON. The Netlify serverless function may still be deploying or was intercepted by the single-page application fallback.`
    );
  }

  if (!trimmed) {
    throw new Error(`Endpoint ${activeUrl} returned an empty response (HTTP ${res.status}).`);
  }

  try {
    const parsed = JSON.parse(trimmed) as T;
    return { data: parsed, status: res.status };
  } catch (parseErr) {
    throw new Error(
      `Malformed JSON response from ${activeUrl} (HTTP ${res.status}): ${
        parseErr instanceof Error ? parseErr.message : String(parseErr)
      }. Response preview: ${trimmed.slice(0, 120)}`
    );
  }
}

/**
 * Fetch health status from Netlify serverless function (with /api/health fallback)
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const headers = buildHeaders();
  try {
    const { data } = await safeFetchJson<HealthCheckResponse>(
      '/.netlify/functions/health',
      { method: 'GET', headers },
      '/api/health'
    );
    return data;
  } catch (err: unknown) {
    return {
      status: 'error',
      provider: 'Cloudflare Workers AI',
      configuredModel: DEFAULT_MODEL,
      modelAvailable: false,
      isConfigured: false,
      error: err instanceof Error ? err.message : 'Unable to connect to health endpoint.',
      troubleshooting:
        'When testing in AI Studio or on Netlify, verify Netlify environment variables and function routing in netlify.toml.',
    };
  }
}

/**
 * Generate Ghost Story via Netlify function
 */
export async function generateGhostStory(
  payload: GenerateStoryPayload
): Promise<GenerationResponse> {
  const config = getClientCloudflareConfig();
  const headers = buildHeaders();

  const { data } = await safeFetchJson<GenerationResponse>(
    '/.netlify/functions/generate-story',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        model: payload.model || config.model || DEFAULT_MODEL,
      }),
    },
    '/api/generate-story'
  );

  return data;
}

/**
 * Generate Remembrance Tribute via Netlify function
 */
export async function generateRemembranceTribute(
  payload: RememberPayload
): Promise<GenerationResponse> {
  const config = getClientCloudflareConfig();
  const headers = buildHeaders();

  const { data } = await safeFetchJson<GenerationResponse>(
    '/.netlify/functions/remember',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        model: payload.model || config.model || DEFAULT_MODEL,
      }),
    },
    '/api/remember'
  );

  return data;
}

/**
 * Reimagine Diary Entry via Netlify function
 */
export async function reimagineDiaryEntry(
  payload: ReimaginePayload
): Promise<GenerationResponse> {
  const config = getClientCloudflareConfig();
  const headers = buildHeaders();

  const { data } = await safeFetchJson<GenerationResponse>(
    '/.netlify/functions/reimagine',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        model: payload.model || config.model || DEFAULT_MODEL,
      }),
    },
    '/api/reimagine'
  );

  return data;
}
