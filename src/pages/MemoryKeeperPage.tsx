/**
 * Memory Keeper & Remembrance Page
 * Ethical, respectful remembrance letters & poetic tributes.
 * Inspired by Día de los Muertos and memorial traditions.
 */

import React, { useState } from 'react';
import {
  Heart,
  Feather,
  Copy,
  Check,
  Bookmark,
  Download,
  AlertTriangle,
  RotateCcw,
  Cloud,
  Clock,
} from 'lucide-react';
import { RemembranceStyle, RememberPayload, SavedItem } from '../types/index.ts';
import { generateRemembranceTribute } from '../services/api.ts';
import { saveStoryItem, downloadStoryAsTxt } from '../services/storage.ts';
import { CandleFlame } from '../components/CandleFlame.tsx';

interface MemoryKeeperPageProps {
  isAiConnected: boolean | null;
  configuredModel: string;
  onMemorySaved: (item: SavedItem) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateStatus: () => void;
}

const REMEMBRANCE_STYLES: { label: RemembranceStyle; description: string }[] = [
  {
    label: 'Gentle Letter',
    description: 'An intimate, affectionate letter addressed from your heart to their memory.',
  },
  {
    label: 'Poetic Tribute',
    description: 'Evocative lyrical lines celebrating light, legacy, and timeless beauty.',
  },
  {
    label: 'Short Remembrance',
    description: 'A warm, touching keepsake reflection ideal for family gatherings or altars.',
  },
  {
    label: 'Memory Story',
    description: 'A narrative capturing the warmth, habits, and laughter of a shared day.',
  },
];

const SAMPLE_MEMORIES = [
  {
    title: 'Autumn Evenings with Grandmother Elena',
    recipientName: 'Abuela Elena',
    memories: 'Knitting wool blankets by the iron stove, humming old lullabies, and always slipping cinnamon candy into our pockets.',
    lifeMoments: 'Her 80th birthday when four generations danced in the patio under strings of paper lanterns.',
    favorites: 'Mexican hot chocolate, cempasúchil flowers, and Pedro Infante songs.',
    style: 'Gentle Letter' as RemembranceStyle,
  },
  {
    title: 'In Memory of Barnaby, The Golden Retriever',
    recipientName: 'Barnaby',
    memories: 'Waiting patiently by the front gate at 5 PM every weekday, resting his chin on my knees during thunderstorms.',
    lifeMoments: 'The day we adopted him from the shelter in a thunderstorm and he slept on my jacket all the way home.',
    favorites: 'Tennis balls in the river, peanut butter spoons, and autumn leaf piles.',
    style: 'Poetic Tribute' as RemembranceStyle,
  },
];

export const MemoryKeeperPage: React.FC<MemoryKeeperPageProps> = ({
  isAiConnected,
  configuredModel,
  onMemorySaved,
  showToast,
  onNavigateStatus,
}) => {
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [memories, setMemories] = useState('');
  const [lifeMoments, setLifeMoments] = useState('');
  const [favorites, setFavorites] = useState('');
  const [style, setStyle] = useState<RemembranceStyle>('Gentle Letter');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [modelUsed, setModelUsed] = useState<string>(configuredModel);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const applySample = (sample: (typeof SAMPLE_MEMORIES)[0]) => {
    setTitle(sample.title);
    setRecipientName(sample.recipientName);
    setMemories(sample.memories);
    setLifeMoments(sample.lifeMoments);
    setFavorites(sample.favorites);
    setStyle(sample.style);
    showToast(`Loaded memory tribute example: "${sample.title}"`, 'info');
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a title for this remembrance tribute.', 'error');
      return;
    }
    if (!memories.trim()) {
      showToast('Please share at least one treasured memory.', 'error');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedLetter(null);
    setIsSaved(false);

    try {
      const payload: RememberPayload = {
        title: title.trim(),
        recipientName: recipientName.trim() || undefined,
        memories: memories.trim(),
        lifeMoments: lifeMoments.trim() || undefined,
        favorites: favorites.trim() || undefined,
        style,
      };

      const res = await generateRemembranceTribute(payload);

      if (res.success && res.content) {
        setGeneratedLetter(res.content);
        setDurationMs(res.durationMs || null);
        setModelUsed(res.model || configuredModel);
        showToast('Remembrance letter beautifully composed.', 'success');
      } else {
        setErrorMsg(res.error || 'Failed to compose remembrance tribute.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      showToast('Failed to connect to Cloudflare Workers AI.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    showToast('Tribute copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedLetter) return;
    const saved = saveStoryItem({
      type: 'remembrance_letter',
      title: title.trim() || 'Remembrance Letter',
      content: generatedLetter,
      metadata: {
        recipientName: recipientName.trim() || undefined,
        style,
        modelUsed: `${modelUsed} (Cloudflare Workers AI)`,
      },
    });
    setIsSaved(true);
    onMemorySaved(saved);
    showToast('Tribute saved in your browser storage', 'success');
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const item: SavedItem = {
      id: 'temp_rem_' + Date.now(),
      type: 'remembrance_letter',
      title: title.trim() || 'Remembrance Tribute',
      content: generatedLetter,
      createdAt: new Date().toISOString(),
      metadata: {
        recipientName,
        style,
        modelUsed: `${modelUsed} (Cloudflare Workers AI)`,
      },
    };
    downloadStoryAsTxt(item);
    showToast('Downloaded formatted .txt tribute', 'success');
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <CandleFlame size="sm" />
            <span>Remembrance Atelier</span>
            <span aria-hidden="true">·</span>
            <span>Inspired by Memorial Tradition & Día de los Muertos</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
            Memory Keeper
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Preserve the words, habits, and beloved moments of those who touched your life.
            A gentle literary tribute crafted with open-weight Gemma on Cloudflare Workers AI.
          </p>
        </div>

        {/* Inference Badge */}
        <div className="flex items-center gap-2 bg-[#0f111a] border border-amber-500/20 rounded-xl px-3.5 py-2 text-xs text-amber-200/90">
          <Cloud className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Cloudflare Workers AI · Gemma</span>
        </div>
      </div>

      {/* Ethical & Privacy Disclosure Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-100">
            Ethical Remembrance & Cloud Inference Notice:
          </p>
          <p className="text-zinc-300 leading-relaxed">
            GhostMemory AI creates thoughtful, dignified tributes and memorial letters written from your memory.
            We do not claim to contact, summon, or channel spirits of deceased individuals. Prompts are transmitted
            to Cloudflare Workers AI for open-weight model execution and completed tributes are stored in your browser's LocalStorage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN: MEMORY DETAILS FORM
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl bg-[#0e1017] parchment-gold-border p-6 space-y-5 shadow-xl"
          >
            {/* Tribute Title */}
            <div>
              <label htmlFor="mem-title" className="block text-xs font-medium text-amber-200/90 mb-1.5">
                Tribute Title <span className="text-amber-400">*</span>
              </label>
              <input
                id="mem-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A Letter for Grandfather Elias"
                required
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Recipient Name / Preferred Nickname */}
            <div>
              <label htmlFor="mem-recipient" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Person or Companion's Name / Nickname <span className="text-zinc-500">(Optional)</span>
              </label>
              <input
                id="mem-recipient"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Abuela Sofia, Uncle Thomas, or my cat Jasper"
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Favorite Memories */}
            <div>
              <label htmlFor="mem-memories" className="block text-xs font-medium text-amber-200/90 mb-1.5">
                Cherished Memories & Habits <span className="text-amber-400">*</span>
              </label>
              <textarea
                id="mem-memories"
                rows={4}
                value={memories}
                onChange={(e) => setMemories(e.target.value)}
                placeholder="Share moments that bring a smile: a funny habit, how their laugh sounded, Sunday mornings, sitting together by the porch..."
                required
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl p-3.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Sample Chips */}
            <div>
              <span className="block text-[11px] font-medium text-zinc-400 mb-2">
                Sample inspiration tributes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_MEMORIES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySample(s)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-200 transition-colors cursor-pointer text-left truncate max-w-[220px]"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Significant Life Moments */}
            <div>
              <label htmlFor="mem-moments" className="block text-xs font-medium text-zinc-400 mb-1">
                Significant Life Moments <span className="text-zinc-600">(Optional)</span>
              </label>
              <input
                id="mem-moments"
                type="text"
                value={lifeMoments}
                onChange={(e) => setLifeMoments(e.target.value)}
                placeholder="e.g. Their silver anniversary, our cross-country road trip"
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Favorites: Food, Music, Traditions */}
            <div>
              <label htmlFor="mem-favorites" className="block text-xs font-medium text-zinc-400 mb-1">
                Favorite Traditions, Music, or Foods <span className="text-zinc-600">(Optional)</span>
              </label>
              <input
                id="mem-favorites"
                type="text"
                value={favorites}
                onChange={(e) => setFavorites(e.target.value)}
                placeholder="e.g. Cinnamon tea, gardening marigolds, jazz records on Sundays"
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Writing Style */}
            <div>
              <label className="block text-xs font-medium text-amber-200/90 mb-2">
                Desired Tribute Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REMEMBRANCE_STYLES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setStyle(item.label)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      style === item.label
                        ? 'bg-amber-500/15 border-amber-500 text-amber-100'
                        : 'bg-[#08090d] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-amber-200 mb-1">
                      {item.label}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all cursor-pointer focus:outline-none"
            >
              {isGenerating ? (
                <>
                  <CandleFlame size="sm" />
                  <span>Composing Tribute with Gemma...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-zinc-950" />
                  <span>Preserve Remembrance Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: CANDLELIT PARCHMENT LETTER DISPLAY
           ========================================================================= */}
        <div className="lg:col-span-7">
          {/* Loading Animation State */}
          {isGenerating && (
            <div className="parchment-reader rounded-2xl p-10 min-h-[460px] flex flex-col items-center justify-center text-center space-y-4">
              <CandleFlame size="lg" />
              <div className="space-y-2 max-w-sm">
                <h3 className="font-serif-title text-2xl font-bold text-amber-200">
                  Lighting the Memorial Candle
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Weaving your treasured memories into a timeless letter using open-weight model{' '}
                  <span className="font-mono text-amber-300">{configuredModel}</span> on Cloudflare Workers AI.
                </p>
                <div className="pt-2 text-[11px] text-zinc-500 italic">
                  “Honoring the legacy of those we carry in our hearts.”
                </div>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {!isGenerating && errorMsg && (
            <div className="rounded-2xl bg-zinc-900 border border-rose-500/30 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-rose-200">
                    Remembrance Generation Error
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{errorMsg}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleGenerate()}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors cursor-pointer"
                >
                  Retry
                </button>
                <button
                  onClick={onNavigateStatus}
                  className="text-xs text-amber-300 hover:underline cursor-pointer"
                >
                  Configure Cloudflare Credentials
                </button>
              </div>
            </div>
          )}

          {/* Completed Remembrance Tribute */}
          {!isGenerating && !errorMsg && generatedLetter && (
            <div className="parchment-reader rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CandleFlame size="sm" />
                  <span className="font-semibold text-amber-200">{style}</span>
                  {durationMs && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span className="tabular-nums font-mono">
                          {(durationMs / 1000).toFixed(1)}s
                        </span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Preserved' : 'Save in Browser'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export TXT</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    title="Generate alternative tribute"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tribute Letter Content */}
              <div className="prose prose-invert max-w-none text-amber-50/95 font-serif text-base sm:text-lg leading-relaxed whitespace-pre-line tracking-wide">
                {generatedLetter}
              </div>

              {/* Tribute Footer Metadata */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {recipientName && (
                  <>
                    <span>Dedicated to: {recipientName}</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span>Format: {style}</span>
                <span aria-hidden="true">·</span>
                <span>Inference: Cloudflare Workers AI</span>
              </div>
            </div>
          )}

          {/* Empty State before first tribute */}
          {!isGenerating && !errorMsg && !generatedLetter && (
            <div className="rounded-2xl border border-dashed border-amber-500/20 bg-[#0d0f17]/60 p-10 min-h-[460px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CandleFlame size="md" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-serif-title text-2xl font-bold text-amber-100">
                  An Altar for Words & Memories
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Enter details of someone you love, an unforgettable companion, or a treasured chapter.
                  Click “Preserve Remembrance Letter” to craft an enduring keepsake.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500">
                <span>Dignified & Respectful</span>
                <span aria-hidden="true">·</span>
                <span>Preserved in your browser</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
