/**
 * Browser LocalStorage Service for GhostMemory AI
 * Stores stories, remembrance letters, and transformed diary entries locally in the user's browser.
 */

import { ItemType, SavedItem } from '../types/index.ts';

const STORAGE_KEY = 'ghostmemory_saved_stories_v1';

export function getSavedStories(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedItem[];
  } catch (err) {
    console.error('Failed to parse saved stories from localStorage:', err);
    return [];
  }
}

export function saveStoryItem(item: Omit<SavedItem, 'id' | 'createdAt'>): SavedItem {
  const existing = getSavedStories();
  const newItem: SavedItem = {
    ...item,
    id: 'gm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write story to localStorage:', err);
  }
  return newItem;
}

export function deleteStoryItem(id: string): boolean {
  const existing = getSavedStories();
  const filtered = existing.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete story item:', err);
    return false;
  }
}

export function downloadStoryAsTxt(item: SavedItem): void {
  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const typeHeader =
    item.type === 'ghost_story'
      ? 'GHOST STORY ARCHIVE'
      : item.type === 'remembrance_letter'
      ? 'REMEMBRANCE LETTER & MEMORIAL TRIBUTE'
      : 'DIARY REIMAGINED NARRATIVE';

  const metadataLines: string[] = [];
  if (item.metadata?.storyType) metadataLines.push(`Genre: ${item.metadata.storyType}`);
  if (item.metadata?.tone) metadataLines.push(`Tone: ${item.metadata.tone}`);
  if (item.metadata?.recipientName) metadataLines.push(`In Memory of: ${item.metadata.recipientName}`);
  if (item.metadata?.targetStyle) metadataLines.push(`Literary Style: ${item.metadata.targetStyle}`);
  if (item.metadata?.modelUsed) metadataLines.push(`Model: ${item.metadata.modelUsed}`);

  const fileContent = `===================================================================
 GHOSTMEMORY AI — WHERE MEMORIES NEVER DIE
 ${typeHeader}
===================================================================

Title: ${item.title}
Date Preserved: ${formattedDate}
${metadataLines.join('\n')}

-------------------------------------------------------------------
CONTENT
-------------------------------------------------------------------

${item.content}

-------------------------------------------------------------------
Preserved via GhostMemory AI · Hacktoberfest Open-Source AI Challenge
Inference: Cloudflare Workers AI (Serverless Cloud Inference)
Privacy Notice: Story stored in browser LocalStorage. Prompts processed via Cloudflare Workers AI.
===================================================================
`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFilename = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .substring(0, 40);
  link.download = `${safeFilename || 'ghostmemory'}_${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Seeds sample atmospheric stories on first launch so the library has immediately interactive content.
 */
export function seedSampleItemsIfEmpty(): void {
  const current = getSavedStories();
  if (current.length > 0) return;

  const samples: SavedItem[] = [
    {
      id: 'sample_ghost_1',
      type: 'ghost_story',
      title: 'The Clockmaker of Harrowgate Lane',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      content: `# The Clockmaker of Harrowgate Lane

The grandfather clock in the vestibule had not ticked since the winter frost of 1888. Its brass pendulum hung motionless, suspended like a pendulum over an empty grave.

Yet every evening, precisely at twelve past midnight, the chimes would stir.

Elias sat by the hearth with a stub of tallow candle, watching the dust motes drift across the velvet wallpaper. The sound was not of metal striking bell, but of dry knuckles tapping on polished cherrywood.

"Master Elias," a breath whispered through the keyhole, carried on a gust that smelled faintly of old spruce and cedar oil. "A gear has slipped in the gears of remembrance."

When he raised his candle, he saw no figure—only two indentations on the faded oriental rug where someone stood in worn leather boots, keeping vigil while the world slept.`,
      metadata: {
        storyType: 'Haunted House',
        tone: 'Gothic',
        length: 'Short',
        modelUsed: '@cf/google/gemma-4-26b-a4b-it (Cloudflare Workers AI)',
      },
    },
    {
      id: 'sample_remember_1',
      type: 'remembrance_letter',
      title: 'A Letter for Abuelo Mateo and the Marigolds',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      content: `Dearest Abuelo Mateo,

The autumn winds have turned crisp again, and the kitchen smells of toasted cinnamon and orange zest—just as it did every October morning when you would hum boleros while rolling out pan dulce.

I still keep your brass pocket knife on my desk, beside the faded photograph from the Veracruz coast. Whenever doubt creeps into my thoughts, I remember your hands: soil-stained from tending the marigold patch, patient as the tides, always pointing out the first star in the twilight sky.

You taught us that a person is never truly gone so long as their laughter echoes in the recipes they passed down and the stories we whisper by candlelight. Tonight, we laid out the bright orange petals leading from the doorway to the altar.

May peace surround your memory, as your warmth still surrounds our home.

With everlasting love and gratitude.`,
      metadata: {
        recipientName: 'Abuelo Mateo',
        style: 'Gentle Letter',
        modelUsed: '@cf/google/gemma-4-26b-a4b-it (Cloudflare Workers AI)',
      },
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch (err) {
    console.error('Failed to seed sample stories:', err);
  }
}
