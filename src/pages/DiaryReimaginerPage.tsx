/**
 * Diary Reimaginer: Transmutes personal journal entries into gothic prose,
 * mysterious tales, poetic reflections, or ghost narratives using Cloudflare Workers AI.
 */

import React, { useState } from 'react';
import {
  Feather,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  AlertCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Cloud,
} from 'lucide-react';
import { ReimagineStyle, ReimaginePayload, SavedItem } from '../types/index.ts';
import { reimagineDiaryEntry } from '../services/api.ts';
import { saveStoryItem, downloadStoryAsTxt } from '../services/storage.ts';
import { CandleFlame } from '../components/CandleFlame.tsx';

interface DiaryReimaginerPageProps {
  isAiConnected: boolean | null;
  configuredModel: string;
  onStorySaved: (item: SavedItem) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateStatus: () => void;
}

const STYLES: { label: ReimagineStyle; desc: string }[] = [
  {
    label: 'Gothic Prose',
    desc: 'Victorian gothic tone, rich vocabulary, dramatic weather, and shadowy atmosphere.',
  },
  {
    label: 'Mysterious Short Story',
    desc: 'Suspenseful narrative where ordinary daily moments hold an eerie secret.',
  },
  {
    label: 'Poetic Reflection',
    desc: 'Lyrical meditation on transience, autumn light, and the passage of time.',
  },
  {
    label: 'Fictional Ghost Narrative',
    desc: 'Fictionalizes the entry with a spectral presence watching gently in the background.',
  },
];

const SAMPLE_ENTRIES = [
  {
    title: 'Rainy Tuesday Evening',
    text: 'Spent the evening alone at the old kitchen table while rain tapped against the glass. The radiator was clanking and making strange clicking noises. Made tea and listened to the radio until late, feeling like the house was unusually quiet after everyone moved away.',
    style: 'Gothic Prose' as ReimagineStyle,
  },
  {
    title: 'Finding the Attic Key',
    text: 'Cleaning out the hall drawer this morning and found a heavy iron key with no label. Tried it on the cellar door and the backyard shed, but neither worked. Left it on the mantelpiece. Could have sworn I heard a door latch click upstairs later this afternoon.',
    style: 'Mysterious Short Story' as ReimagineStyle,
  },
];

export const DiaryReimaginerPage: React.FC<DiaryReimaginerPageProps> = ({
  isAiConnected,
  configuredModel,
  onStorySaved,
  showToast,
  onNavigateStatus,
}) => {
  const [originalText, setOriginalText] = useState('');
  const [targetStyle, setTargetStyle] = useState<ReimagineStyle>('Gothic Prose');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [transformedText, setTransformedText] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [modelUsed, setModelUsed] = useState<string>(configuredModel);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const applySample = (sample: (typeof SAMPLE_ENTRIES)[0]) => {
    setOriginalText(sample.text);
    setTargetStyle(sample.style);
    showToast(`Loaded journal entry sample: "${sample.title}"`, 'info');
  };

  const handleTransform = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!originalText.trim()) {
      showToast('Please paste or write a journal entry to reimagine.', 'error');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setTransformedText(null);
    setIsSaved(false);

    try {
      const payload: ReimaginePayload = {
        originalText: originalText.trim(),
        targetStyle,
      };

      const res = await reimagineDiaryEntry(payload);

      if (res.success && res.content) {
        setTransformedText(res.content);
        setDurationMs(res.durationMs || null);
        setModelUsed(res.model || configuredModel);
        showToast('Journal entry successfully reimagined!', 'success');
      } else {
        setErrorMsg(res.error || 'Failed to reimagine diary entry.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      showToast('Inference error. Check Cloudflare credentials in Settings.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setOriginalText('');
    setTransformedText(null);
    setErrorMsg(null);
    setIsSaved(false);
    showToast('Reimaginer cleared', 'info');
  };

  const handleCopy = () => {
    if (!transformedText) return;
    navigator.clipboard.writeText(transformedText);
    setCopied(true);
    showToast('Transformed prose copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!transformedText) return;
    const titleSnippet = originalText.slice(0, 32).trim() + '...';
    const saved = saveStoryItem({
      type: 'diary_reimagined',
      title: `Reimagined: ${titleSnippet}`,
      content: transformedText,
      metadata: {
        originalText,
        targetStyle,
        modelUsed: `${modelUsed} (Cloudflare Workers AI)`,
      },
    });
    setIsSaved(true);
    onStorySaved(saved);
    showToast('Saved to your private story library in browser storage', 'success');
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Feather className="w-3.5 h-3.5" />
            <span>Literary Transmutation</span>
            <span aria-hidden="true">·</span>
            <span>Cloudflare Workers AI · Gemma</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
            Diary Reimaginer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Elevate a mundane journal entry or personal paragraph into atmospheric gothic prose,
            a mysterious short story, or a poetic reflection while preserving your original voice.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Fields</span>
          </button>
        </div>
      </div>

      {/* Style Selector Grid */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-amber-200/90">
          Select Target Literary Style:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STYLES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setTargetStyle(item.label)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                targetStyle === item.label
                  ? 'bg-amber-500/15 border-amber-500 text-amber-100 shadow-sm'
                  : 'bg-[#0e1017] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <div className="font-semibold text-xs text-amber-200 mb-1">
                {item.label}
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Split Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Original Diary Entry */}
        <div className="rounded-2xl bg-[#0e1017] parchment-gold-border p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-200">
                Original Diary Entry
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              {originalText.length} characters
            </span>
          </div>

          <textarea
            rows={10}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Type or paste your raw journal entry here... e.g. 'Walked through the garden at dusk. The leaves were already dry...'"
            className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl p-4 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed font-sans"
          />

          {/* Quick sample buttons */}
          <div className="pt-1">
            <span className="block text-[11px] text-zinc-400 mb-1.5">
              Try a sample journal entry:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_ENTRIES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-200 transition-colors cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleTransform}
            disabled={isGenerating || !originalText.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <CandleFlame size="sm" />
                <span>Reimagining via Cloudflare Workers AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Reimagine into {targetStyle}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Side: Reimagined Prose Output */}
        <div className="rounded-2xl parchment-reader p-6 space-y-4 shadow-xl min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CandleFlame size="sm" />
                <span className="text-xs font-semibold text-amber-200">
                  {targetStyle} Narrative
                </span>
                {durationMs && (
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ({(durationMs / 1000).toFixed(1)}s)
                  </span>
                )}
              </div>

              {transformedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {isGenerating && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <CandleFlame size="md" />
                <p className="font-serif text-lg text-amber-100">
                  Transmuting words into atmospheric prose...
                </p>
                <p className="text-xs text-zinc-400">
                  Executing Gemma model on Cloudflare Workers AI edge
                </p>
              </div>
            )}

            {!isGenerating && errorMsg && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-300 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Reimagining Failed</span>
                </div>
                <p className="text-zinc-300">{errorMsg}</p>
                <button
                  onClick={onNavigateStatus}
                  className="text-amber-300 underline cursor-pointer pt-1"
                >
                  Configure Cloudflare Credentials
                </button>
              </div>
            )}

            {!isGenerating && !errorMsg && transformedText && (
              <div className="font-serif text-zinc-200 text-base sm:text-lg leading-relaxed whitespace-pre-line tracking-wide">
                {transformedText}
              </div>
            )}

            {!isGenerating && !errorMsg && !transformedText && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
                <Feather className="w-8 h-8 text-zinc-700" />
                <p className="text-xs sm:text-sm text-zinc-400">
                  Your transformed narrative will appear here.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Select a style and click “Reimagine” to begin.
                </p>
              </div>
            )}
          </div>

          {/* Storage & Privacy disclaimer */}
          <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500">
            Inference processed via Cloudflare Workers AI. Your saved entries remain stored in your browser's local memory.
          </div>
        </div>
      </div>
    </div>
  );
};
