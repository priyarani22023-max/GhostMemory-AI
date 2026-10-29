/**
 * Netlify Function: POST /.netlify/functions/remember
 * Composes a respectful memorial tribute or remembrance letter using Cloudflare Workers AI.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { cloudflareAiService, DEFAULT_GEMMA_MODEL } from '../../src/server/cloudflareAiService.ts';
import { RememberPayload, RemembranceStyle } from '../../src/types/index.ts';

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, content: '', error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    let body: RememberPayload;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, content: '', error: 'Invalid JSON request body.' }),
      };
    }

    if (!body.memories || typeof body.memories !== 'string' || !body.memories.trim()) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          content: '',
          error: 'Please describe at least one cherished memory.',
        }),
      };
    }

    if (body.memories.trim().length > 5000) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          content: '',
          error: 'Memories text is too long. Please keep it under 5,000 characters.',
        }),
      };
    }

    const validStyles: RemembranceStyle[] = [
      'Gentle Letter',
      'Poetic Tribute',
      'Short Remembrance',
      'Memory Story',
    ];

    const validatedPayload: RememberPayload = {
      memories: body.memories.trim(),
      title: typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 200) : 'In Loving Memory',
      recipientName: typeof body.recipientName === 'string' ? body.recipientName.trim().slice(0, 200) : undefined,
      lifeMoments: typeof body.lifeMoments === 'string' ? body.lifeMoments.trim().slice(0, 2000) : undefined,
      favorites: typeof body.favorites === 'string' ? body.favorites.trim().slice(0, 2000) : undefined,
      style: validStyles.includes(body.style as RemembranceStyle)
        ? (body.style as RemembranceStyle)
        : 'Gentle Letter',
      model: typeof body.model === 'string' ? body.model.trim() : undefined,
    };

    const headers = event.headers || {};
    const overrideAccountId = getHeader(headers, 'x-cloudflare-account-id');
    const overrideApiToken = getHeader(headers, 'x-cloudflare-api-token');
    const overrideModel = validatedPayload.model || getHeader(headers, 'x-cloudflare-ai-model');

    const result = await cloudflareAiService.generateRemembrance(validatedPayload, {
      accountId: overrideAccountId,
      apiToken: overrideApiToken,
      model: overrideModel,
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };
  } catch (err: unknown) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        content: '',
        model: DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: err instanceof Error ? err.message : 'Internal remembrance letter error',
      }),
    };
  }
};
