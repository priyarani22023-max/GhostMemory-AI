/**
 * Netlify Function: POST /.netlify/functions/reimagine
 * Reimagines diary entries into gothic prose or mysterious narratives using Cloudflare Workers AI.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { cloudflareAiService, DEFAULT_GEMMA_MODEL } from '../../src/server/cloudflareAiService.ts';
import { ReimaginePayload, ReimagineStyle } from '../../src/types/index.ts';

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
    let body: ReimaginePayload;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, content: '', error: 'Invalid JSON request body.' }),
      };
    }

    if (!body.originalText || typeof body.originalText !== 'string' || !body.originalText.trim()) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          content: '',
          error: 'Please provide original diary text to reimagine.',
        }),
      };
    }

    if (body.originalText.trim().length > 5000) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          content: '',
          error: 'Original text is too long. Please keep it under 5,000 characters.',
        }),
      };
    }

    const validStyles: ReimagineStyle[] = [
      'Gothic Prose',
      'Mysterious Short Story',
      'Poetic Reflection',
      'Fictional Ghost Narrative',
    ];

    const validatedPayload: ReimaginePayload = {
      originalText: body.originalText.trim(),
      targetStyle: validStyles.includes(body.targetStyle as ReimagineStyle)
        ? (body.targetStyle as ReimagineStyle)
        : 'Gothic Prose',
      model: typeof body.model === 'string' ? body.model.trim() : undefined,
    };

    const headers = event.headers || {};
    const overrideAccountId = getHeader(headers, 'x-cloudflare-account-id');
    const overrideApiToken = getHeader(headers, 'x-cloudflare-api-token');
    const overrideModel = validatedPayload.model || getHeader(headers, 'x-cloudflare-ai-model');

    const result = await cloudflareAiService.reimagineDiary(validatedPayload, {
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
        error: err instanceof Error ? err.message : 'Internal diary reimagining error',
      }),
    };
  }
};
