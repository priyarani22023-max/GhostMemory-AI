/**
 * Netlify Function: POST /.netlify/functions/generate-story
 * Generates an atmospheric ghost story using open-weight Gemma via Cloudflare Workers AI.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { cloudflareAiService, DEFAULT_GEMMA_MODEL } from '../../src/server/cloudflareAiService.ts';
import {
  GenerateStoryPayload,
  StoryLength,
  StoryTone,
  StoryType,
} from '../../src/types/index.ts';

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
    let body: GenerateStoryPayload;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, content: '', error: 'Invalid JSON request body.' }),
      };
    }

    if (!body.prompt || typeof body.prompt !== 'string' || !body.prompt.trim()) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          content: '',
          error: 'Please provide a story premise or prompt.',
        }),
      };
    }

    if (body.prompt.trim().length > 5000) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: false,
          content: '',
          error: 'Story prompt is too long. Please keep it under 5,000 characters.',
        }),
      };
    }

    // Sanitize and validate options
    const validStoryTypes: StoryType[] = [
      'Haunted House',
      'Paranormal Mystery',
      'Forgotten Soul',
      'Haunted Forest',
      'Urban Legend',
      'Gothic Romance',
      'Custom',
    ];
    const validTones: StoryTone[] = [
      'Creepy',
      'Mysterious',
      'Emotional',
      'Gothic',
      'Wholesome',
    ];
    const validLengths: StoryLength[] = ['Short', 'Medium', 'Long'];

    const validatedPayload: GenerateStoryPayload = {
      prompt: body.prompt.trim(),
      storyType: validStoryTypes.includes(body.storyType as StoryType)
        ? (body.storyType as StoryType)
        : 'Haunted House',
      tone: validTones.includes(body.tone as StoryTone)
        ? (body.tone as StoryTone)
        : 'Creepy',
      length: validLengths.includes(body.length as StoryLength)
        ? (body.length as StoryLength)
        : 'Medium',
      title: typeof body.title === 'string' ? body.title.trim().slice(0, 200) : undefined,
      setting: typeof body.setting === 'string' ? body.setting.trim().slice(0, 300) : undefined,
      characters:
        typeof body.characters === 'string' ? body.characters.trim().slice(0, 300) : undefined,
      model: typeof body.model === 'string' ? body.model.trim() : undefined,
    };

    const headers = event.headers || {};
    const overrideAccountId = getHeader(headers, 'x-cloudflare-account-id');
    const overrideApiToken = getHeader(headers, 'x-cloudflare-api-token');
    const overrideModel = validatedPayload.model || getHeader(headers, 'x-cloudflare-ai-model');

    const result = await cloudflareAiService.generateStory(validatedPayload, {
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
        error: err instanceof Error ? err.message : 'Internal story generation error',
      }),
    };
  }
};
