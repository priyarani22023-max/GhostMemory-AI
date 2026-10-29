/**
 * GhostMemory AI Type Definitions
 * Configured for Cloudflare Workers AI & Netlify Serverless Deployment.
 */

export type StoryType =
  | 'Haunted House'
  | 'Paranormal Mystery'
  | 'Forgotten Soul'
  | 'Haunted Forest'
  | 'Urban Legend'
  | 'Gothic Romance'
  | 'Custom';

export type StoryTone =
  | 'Creepy'
  | 'Mysterious'
  | 'Emotional'
  | 'Gothic'
  | 'Wholesome';

export type StoryLength = 'Short' | 'Medium' | 'Long';

export type RemembranceStyle =
  | 'Gentle Letter'
  | 'Poetic Tribute'
  | 'Short Remembrance'
  | 'Memory Story';

export type ReimagineStyle =
  | 'Gothic Prose'
  | 'Mysterious Short Story'
  | 'Poetic Reflection'
  | 'Fictional Ghost Narrative';

export type ItemType = 'ghost_story' | 'remembrance_letter' | 'diary_reimagined';

export interface GenerateStoryPayload {
  title?: string;
  prompt: string;
  storyType: StoryType;
  tone: StoryTone;
  length: StoryLength;
  setting?: string;
  characters?: string;
  model?: string;
}

export interface RememberPayload {
  title: string;
  recipientName?: string;
  memories: string;
  lifeMoments?: string;
  favorites?: string;
  style: RemembranceStyle;
  model?: string;
}

export interface ReimaginePayload {
  originalText: string;
  targetStyle: ReimagineStyle;
  model?: string;
}

export interface GenerationResponse {
  success: boolean;
  content: string;
  model: string;
  durationMs?: number;
  provider?: string;
  error?: string;
  troubleshooting?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unconfigured' | 'auth_error' | 'model_or_account_not_found' | 'rate_limited' | 'error';
  provider: string;
  configuredModel: string;
  modelAvailable: boolean;
  isConfigured: boolean;
  availableModels?: string[];
  latencyMs?: number;
  error?: string | null;
  troubleshooting?: string;
}

export interface SavedItem {
  id: string;
  type: ItemType;
  title: string;
  content: string;
  createdAt: string;
  summary?: string;
  metadata?: {
    prompt?: string;
    storyType?: string;
    tone?: string;
    length?: string;
    recipientName?: string;
    style?: string;
    originalText?: string;
    targetStyle?: string;
    modelUsed?: string;
  };
}

export interface CloudflareClientConfig {
  accountId?: string;
  apiToken?: string;
  model: string;
}
