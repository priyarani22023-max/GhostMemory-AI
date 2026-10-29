/**
 * Cloudflare Workers AI Service for GhostMemory AI
 * Connects to open-weight Gemma models (e.g., @cf/google/gemma-4-26b-a4b-it)
 * via Cloudflare Workers AI REST API.
 */

import {
  GenerateStoryPayload,
  GenerationResponse,
  HealthCheckResponse,
  ReimaginePayload,
  RememberPayload,
} from '../types/index.ts';

export const DEFAULT_GEMMA_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const TIMEOUT_MS = 60000; // 60 seconds timeout for cloud inference

export interface CloudflareCredentials {
  accountId?: string;
  apiToken?: string;
  model?: string;
}

interface CloudflareAiResponse {
  result?: {
    response?: string;
    [key: string]: unknown;
  };
  success?: boolean;
  errors?: Array<{ code: number; message: string }>;
  messages?: string[];
}

export class CloudflareAiService {
  private resolveConfig(overrides?: CloudflareCredentials): {
    accountId: string;
    apiToken: string;
    model: string;
  } {
    const accountId = (overrides?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const apiToken = (overrides?.apiToken || process.env.CLOUDFLARE_API_TOKEN || '').trim();
    const model = (overrides?.model || process.env.CLOUDFLARE_AI_MODEL || DEFAULT_GEMMA_MODEL).trim();

    return { accountId, apiToken, model };
  }

  /**
   * Health Check: Verifies Cloudflare credentials and tests actual model connectivity.
   */
  async checkHealth(overrides?: CloudflareCredentials): Promise<HealthCheckResponse> {
    const { accountId, apiToken, model } = this.resolveConfig(overrides);

    if (!accountId || !apiToken) {
      return {
        status: 'unconfigured',
        provider: 'Cloudflare Workers AI',
        configuredModel: model,
        modelAvailable: false,
        isConfigured: false,
        error: 'Cloudflare Workers AI credentials are not configured.',
        troubleshooting:
          'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your Netlify Dashboard (Site configuration > Environment variables) or provide them in the Model Status settings tab.',
      };
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a health probe.' },
            { role: 'user', content: 'Reply with: ready' },
          ],
          max_tokens: 4,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (res.status === 401 || res.status === 403) {
        return {
          status: 'auth_error',
          provider: 'Cloudflare Workers AI',
          configuredModel: model,
          modelAvailable: false,
          isConfigured: true,
          latencyMs,
          error: 'Authentication failed. Invalid Cloudflare API token or insufficient permissions.',
          troubleshooting:
            'Ensure your token has "Workers AI: Read" and "Workers AI: Edit" permissions in the Cloudflare Dashboard.',
        };
      }

      if (res.status === 404) {
        return {
          status: 'model_or_account_not_found',
          provider: 'Cloudflare Workers AI',
          configuredModel: model,
          modelAvailable: false,
          isConfigured: true,
          latencyMs,
          error: `Account ID or model identifier "${model}" was not found on Cloudflare.`,
          troubleshooting:
            'Check your CLOUDFLARE_ACCOUNT_ID and verify the model identifier is active in Cloudflare Workers AI catalog.',
        };
      }

      if (res.status === 429) {
        return {
          status: 'rate_limited',
          provider: 'Cloudflare Workers AI',
          configuredModel: model,
          modelAvailable: false,
          isConfigured: true,
          latencyMs,
          error: 'Cloudflare Workers AI rate limit or quota exceeded.',
          troubleshooting:
            'The Cloudflare free quota limit has been hit. Please wait a moment or upgrade to Workers Paid.',
        };
      }

      if (!res.ok) {
        const errorText = await res.text();
        return {
          status: 'error',
          provider: 'Cloudflare Workers AI',
          configuredModel: model,
          modelAvailable: false,
          isConfigured: true,
          latencyMs,
          error: `Cloudflare returned HTTP ${res.status}: ${errorText.slice(0, 150)}`,
          troubleshooting: 'Review Cloudflare dashboard logs and verify network configuration.',
        };
      }

      const json = (await res.json()) as CloudflareAiResponse;
      if (json.success === false && json.errors && json.errors.length > 0) {
        return {
          status: 'error',
          provider: 'Cloudflare Workers AI',
          configuredModel: model,
          modelAvailable: false,
          isConfigured: true,
          latencyMs,
          error: json.errors.map((e) => e.message).join('; '),
        };
      }

      return {
        status: 'healthy',
        provider: 'Cloudflare Workers AI',
        configuredModel: model,
        modelAvailable: true,
        isConfigured: true,
        latencyMs,
        availableModels: [
          '@cf/google/gemma-4-26b-a4b-it',
          '@cf/google/gemma-7b-it-lora',
          '@cf/google/gemma-2b-it-lora',
        ],
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      return {
        status: 'error',
        provider: 'Cloudflare Workers AI',
        configuredModel: model,
        modelAvailable: false,
        isConfigured: true,
        error: isTimeout
          ? 'Cloudflare Workers AI health check timed out after 8s.'
          : `Failed to connect to Cloudflare: ${err instanceof Error ? err.message : String(err)}`,
        troubleshooting: 'Verify your internet connectivity and check Cloudflare Status (cloudflarestatus.com).',
      };
    }
  }

  /**
   * Internal execution helper calling Cloudflare Workers AI REST API
   */
  private async executeModel(
    systemPrompt: string,
    userPrompt: string,
    overrides?: CloudflareCredentials
  ): Promise<{ text: string; durationMs: number; model: string }> {
    const { accountId, apiToken, model } = this.resolveConfig(overrides);

    if (!accountId || !apiToken) {
      throw new Error(
        'Cloudflare Workers AI is not configured. Please add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Netlify Environment Variables.'
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 401 || response.status === 403) {
          throw new Error('Cloudflare API Token rejected. Please verify token permissions in Netlify.');
        }
        if (response.status === 404) {
          throw new Error(`Model "${model}" or account "${accountId}" was not found on Cloudflare Workers AI.`);
        }
        if (response.status === 429) {
          throw new Error('Cloudflare Workers AI rate limit or quota exceeded. Please wait a minute and retry.');
        }
        throw new Error(`Cloudflare Workers AI returned HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await response.json()) as CloudflareAiResponse;

      if (data.success === false && data.errors && data.errors.length > 0) {
        throw new Error(`Cloudflare error: ${data.errors.map((e) => e.message).join('; ')}`);
      }

      const generatedText = data.result?.response?.trim() || '';

      if (!generatedText) {
        throw new Error('Cloudflare Workers AI returned an empty response. Please verify the prompt parameters.');
      }

      return {
        text: generatedText,
        durationMs: Date.now() - startTime,
        model,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error(`Inference timed out after ${TIMEOUT_MS / 1000}s. Please retry with a shorter prompt.`);
        }
        throw err;
      }
      throw new Error(`Cloudflare Workers AI communication failed: ${String(err)}`);
    }
  }

  /**
   * Generates a spooky ghost story based on user parameters.
   */
  async generateStory(
    payload: GenerateStoryPayload,
    overrides?: CloudflareCredentials
  ): Promise<GenerationResponse> {
    if (!payload.prompt || !payload.prompt.trim()) {
      return {
        success: false,
        content: '',
        model: overrides?.model || DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: 'Please provide a story idea or prompt.',
      };
    }

    const lengthInstructions: Record<string, string> = {
      Short: 'Keep the story atmospheric and concise (around 300-450 words), delivering a sharp chill or lingering mystery.',
      Medium: 'Write a full, immersive narrative (around 600-850 words) with deliberate pacing, eerie buildup, and an unforgettable climax.',
      Long: 'Write an expansive gothic tale (around 900-1300 words) with rich scene-setting, character depth, sensory detail, and psychological suspense.',
    };

    const targetLength = lengthInstructions[payload.length] || lengthInstructions.Medium;

    const systemPrompt = `You are an acclaimed master of Gothic and supernatural storytelling in the tradition of Edgar Allan Poe, Shirley Jackson, and Guillermo del Toro.
Your mission is to write an original, richly atmospheric Halloween ghost story that will linger in the reader's memory.
Key guidelines:
1. Embrace the chosen tone (${payload.tone}) and genre sub-type (${payload.storyType}).
2. Weave in tactile, sensory elements: candlelight, cold drafts, decaying wallpaper, mist, hollow footsteps, or forgotten relics.
3. ${targetLength}
4. Never include conversational filler, greetings, or author notes (e.g. "Here is your story:").
5. Begin directly with the title and opening scene.`;

    const userPrompt = `Please write an original ghost story with the following elements:
- Story Title / Concept: ${payload.title ? payload.title : 'Atmospheric Ghost Story'}
- Core Idea / Premise: ${payload.prompt}
- Setting: ${payload.setting ? payload.setting : 'An evocative, haunted locale'}
- Characters: ${payload.characters ? payload.characters : 'Haunted souls and witnesses'}
- Sub-genre: ${payload.storyType}
- Tone: ${payload.tone}
- Desired Length: ${payload.length}

Format the output with an atmospheric Markdown title at the top (# Title) followed by the prose.`;

    try {
      const result = await this.executeModel(systemPrompt, userPrompt, overrides);
      return {
        success: true,
        content: result.text,
        model: result.model,
        provider: 'Cloudflare Workers AI',
        durationMs: result.durationMs,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        model: overrides?.model || DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: errorMsg,
        troubleshooting:
          'Ensure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are set in your Netlify Environment Variables.',
      };
    }
  }

  /**
   * Generates a respectful remembrance letter or memorial tribute.
   * Strictly adheres to ethical guidelines: NO supernatural necromancy claims,
   * focuses on celebrating real human memories, warmth, and enduring love.
   */
  async generateRemembrance(
    payload: RememberPayload,
    overrides?: CloudflareCredentials
  ): Promise<GenerationResponse> {
    if (!payload.memories || !payload.memories.trim()) {
      return {
        success: false,
        content: '',
        model: overrides?.model || DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: 'Please describe at least one cherished memory.',
      };
    }

    const styleGuide: Record<string, string> = {
      'Gentle Letter': 'Write in the form of an affectionate, intimate letter addressed from the author to the memory of their loved one, filled with quiet gratitude.',
      'Poetic Tribute': 'Write an evocative, lyric tribute with rhythmic prose, celestial metaphors of light and remembrance, and poignant beauty.',
      'Short Remembrance': 'Write a warm, concise eulogistic reflection suitable for sharing with family, keeping every word touching and heartfelt.',
      'Memory Story': 'Narrate the cherished moments as a vivid, heartwarming story that preserves how their laughter, presence, and habits felt in real life.',
    };

    const targetStyle = styleGuide[payload.style] || styleGuide['Gentle Letter'];

    const systemPrompt = `You are a sensitive, empathetic writer dedicated to the art of remembrance, memorial keepsakes, and honoring loved ones.
ETHICAL MANDATE:
- This is a creative, heartfelt remembrance tool inspired by Día de los Muertos and memorial traditions.
- NEVER pretend or claim to summon, channel, or speak from beyond the grave on behalf of the deceased person.
- Frame the text as an affectionate tribute created by the living to preserve and celebrate their memories.
- Treat every detail with immense dignity, tenderness, and warmth.
- Style requested: ${payload.style}. ${targetStyle}
- Do not add conversational disclaimers or greetings at the start; provide the polished remembrance text directly.`;

    const recipientLabel = payload.recipientName ? payload.recipientName : 'Cherished Soul';

    const userPrompt = `Please compose a remembrance tribute for ${recipientLabel}:
- Tribute Title: ${payload.title}
- Honoree Name / Nickname: ${payload.recipientName || 'My loved one'}
- Treasured Memories & Anecdotes: ${payload.memories}
- Significant Life Moments: ${payload.lifeMoments || 'Unspoken daily acts of kindness'}
- Favorite Traditions, Food, or Songs: ${payload.favorites || 'The simple rituals we shared'}
- Style: ${payload.style}

Craft a poignant, deeply comforting piece that celebrates their legacy and the light they left behind.`;

    try {
      const result = await this.executeModel(systemPrompt, userPrompt, overrides);
      return {
        success: true,
        content: result.text,
        model: result.model,
        provider: 'Cloudflare Workers AI',
        durationMs: result.durationMs,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        model: overrides?.model || DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: errorMsg,
        troubleshooting:
          'Check Cloudflare Workers AI configuration in your Netlify dashboard environment variables.',
      };
    }
  }

  /**
   * Reimagines personal diary entries into gothic prose or mysterious narratives.
   */
  async reimagineDiary(
    payload: ReimaginePayload,
    overrides?: CloudflareCredentials
  ): Promise<GenerationResponse> {
    if (!payload.originalText || !payload.originalText.trim()) {
      return {
        success: false,
        content: '',
        model: overrides?.model || DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: 'Please enter a diary entry or paragraph to reimagine.',
      };
    }

    const styleInstructions: Record<string, string> = {
      'Gothic Prose': 'Transform the text into Victorian gothic prose with rich vocabulary, stormy metaphors, archaic cadence, and atmospheric gloom.',
      'Mysterious Short Story': 'Turn the entry into an intriguing mystery where small mundane details carry uncanny significance and suspense.',
      'Poetic Reflection': 'Render the thoughts into lyrical, contemplative verse or poetic prose exploring time, transience, and memory.',
      'Fictional Ghost Narrative': 'Fictionalize the entry as if the diarist were encountering a gentle or eerie supernatural presence observing them.',
    };

    const targetInstruction = styleInstructions[payload.targetStyle] || styleInstructions['Gothic Prose'];

    const systemPrompt = `You are a master literary stylist.
Your task is to take a raw personal diary entry or passage and artistically reimagine it into ${payload.targetStyle}.
Key Rules:
1. Preserve the core emotional truth and intent of the writer's original thoughts.
2. ${targetInstruction}
3. Maintain high literary quality with evocative sensory descriptions.
4. Do not include introductory preamble or commentary; output the reimagined text directly.`;

    const userPrompt = `Please reimagine this diary entry into ${payload.targetStyle}:

--- ORIGINAL ENTRY ---
${payload.originalText}
--- END ORIGINAL ENTRY ---

Deliver the rewritten narrative with literary flair and atmosphere.`;

    try {
      const result = await this.executeModel(systemPrompt, userPrompt, overrides);
      return {
        success: true,
        content: result.text,
        model: result.model,
        provider: 'Cloudflare Workers AI',
        durationMs: result.durationMs,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        content: '',
        model: overrides?.model || DEFAULT_GEMMA_MODEL,
        provider: 'Cloudflare Workers AI',
        error: errorMsg,
        troubleshooting: 'Verify Cloudflare Workers AI credentials in Netlify settings.',
      };
    }
  }
}

export const cloudflareAiService = new CloudflareAiService();
