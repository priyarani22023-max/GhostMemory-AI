/**
 * Netlify Function: GET /.netlify/functions/health
 * Probes Cloudflare Workers AI credentials and model availability.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { cloudflareAiService, DEFAULT_GEMMA_MODEL } from '../../src/server/cloudflareAiService.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-cloudflare-account-id, x-cloudflare-api-token, x-cloudflare-ai-model',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

function getHeader(headers: Record<string, string | undefined>, name: string): string | undefined {
  const lowerName = name.toLowerCase();
  for (const [key, val] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName) return val;
  }
  return undefined;
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: 'error',
        error: 'Method Not Allowed. Use GET for health checks.',
      }),
    };
  }

  try {
    const headers = event.headers || {};
    const overrideAccountId = getHeader(headers, 'x-cloudflare-account-id');
    const overrideApiToken = getHeader(headers, 'x-cloudflare-api-token');
    const overrideModel = getHeader(headers, 'x-cloudflare-ai-model');

    const health = await cloudflareAiService.checkHealth({
      accountId: overrideAccountId,
      apiToken: overrideApiToken,
      model: overrideModel,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(health),
    };
  } catch (err: unknown) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: 'error',
        provider: 'Cloudflare Workers AI',
        configuredModel: DEFAULT_GEMMA_MODEL,
        modelAvailable: false,
        isConfigured: false,
        error: err instanceof Error ? err.message : 'Unknown server error during health check',
      }),
    };
  }
};
