/**
 * Story Creation Studio: Ghost Story Generator
 * Powered by open-weight Gemma via Cloudflare Workers AI and Netlify Functions.
 */

import React, { useState } from 'react';
import {
  Ghost,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Download,
  RotateCcw,
  AlertCircle,
  Clock,
  Cloud,
} from 'lucide-react';
import {
  StoryType,
  StoryTone,
  StoryLength,
  GenerateStoryPayload,
  SavedItem,
} from '../types/index.ts';
import { generateGhostStory } from '../services/api.ts';
import { saveStoryItem, downloadStoryAsTxt } from '../services/storage.ts';
import { CandleFlame } from '../components/CandleFlame.tsx';

interface StoryStudioPageProps {
  isAiConnected: boolean | null;
  configuredModel: string;
  onStorySaved: (item: SavedItem) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateStatus: () => void;
}

const STORY_TYPES: StoryType[] = [
  'Haunted House',
  'Paranormal Mystery',
  'Forgotten Soul',
  'Haunted Forest',
  'Urban Legend',
  'Gothic Romance',
  'Custom',
];

const STORY_TONES: StoryTone[] = [
  'Creepy',
  'Mysterious',
  'Emotional',
  'Gothic',
  'Wholesome',
];

const STORY_LENGTHS: StoryLength[] = ['Short', 'Medium', 'Long'];

const INSPIRATION_PROMPTS = [
  {
    title: 'The Clock of 13 Chimes',
    prompt: 'An antique grandfather clock inherited from a reclusive uncle strikes 13 times at midnight, opening a doorway in the parlor mirror.',
    type: 'Haunted House' as StoryType,
    tone: 'Gothic' as StoryTone,
  },
  {
    title: 'The Silent Radio Station',
    prompt: 'A nighttime radio host picks up a faint broadcast from a frequency that was decommissioned sixty years ago during a blizzard.',
    type: 'Paranormal Mystery' as StoryType,
    tone: 'Mysterious' as StoryTone,
  },
  {
    title: 'The Lantern on Fog Lake',
    prompt: 'A solitary fisherman spots an unmoored wooden rowboat drifting through midnight mist with a glowing brass lantern and no oarsman.',
    type: 'Forgotten Soul' as StoryType,
    tone: 'Emotional' as StoryTone,
  },
  {
    title: 'The Whispering Pines',
    prompt: 'Hikers discover an abandoned campsite where stone markers have been rearranged every morning into ancient constellation patterns.',
    type: 'Haunted Forest' as StoryType,
    tone: 'Creepy' as StoryTone,
  },
];

export const StoryStudioPage: React.FC<StoryStudioPageProps> = ({
  isAiConnected,
  configuredModel,
  onStorySaved,
  showToast,
  onNavigateStatus,
}) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [storyType, setStoryType] = useState<StoryType>('Haunted House');
  const [tone, setTone] = useState<StoryTone>('Gothic');
  const [length, setLength] = useState<StoryLength>('Medium');
  const [setting, setSetting] = useState('');
  const [characters, setCharacters] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [generatedDuration, setGeneratedDuration] = useState<number | null>(null);
  const [modelUsed, setModelUsed] = useState<string>(configuredModel);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [troubleshootingMsg, setTroubleshootingMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const applyInspiration = (item: (typeof INSPIRATION_PROMPTS)[0]) => {
    setTitle(item.title);
    setPrompt(item.prompt);
    setStoryType(item.type);
    setTone(item.tone);
    showToast(`Loaded inspiration: "${item.title}"`, 'info');
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      showToast('Please provide a story premise or select an inspiration prompt.', 'error');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setTroubleshootingMsg(null);
    setGeneratedStory(null);
    setIsSaved(false);

    try {
      const payload: GenerateStoryPayload = {
        title: title.trim() || undefined,
        prompt: prompt.trim(),
        storyType,
        tone,
        length,
        setting: setting.trim() || undefined,
        characters: characters.trim() || undefined,
      };

      const res = await generateGhostStory(payload);

      if (res.success && res.content) {
        setGeneratedStory(res.content);
        setGeneratedDuration(res.durationMs || null);
        setModelUsed(res.model || configuredModel);
        showToast('Story successfully conjured with open-weight Gemma!', 'success');
      } else {
        setErrorMsg(res.error || 'Failed to generate story.');
        setTroubleshootingMsg(
          res.troubleshooting ||
            'Verify that CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are configured in your Netlify dashboard.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setTroubleshootingMsg(
        'Check Netlify function status and ensure Cloudflare Workers AI credentials are valid.'
      );
      showToast('Story generation failed. Check cloud credentials.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedStory) return;
    navigator.clipboard.writeText(generatedStory);
    setCopied(true);
    showToast('Story copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!generatedStory) return;
    const finalTitle = title.trim() || 'Untitled Ghost Narrative';
    const saved = saveStoryItem({
      type: 'ghost_story',
      title: finalTitle,
      content: generatedStory,
      metadata: {
        prompt,
        storyType,
        tone,
        length,
        modelUsed: `${modelUsed} (Cloudflare Workers AI)`,
      },
    });
    setIsSaved(true);
    onStorySaved(saved);
    showToast('Saved to your private local library in browser memory', 'success');
  };

  const handleDownloadTxt = () => {
    if (!generatedStory) return;
    const item: SavedItem = {
      id: 'temp_' + Date.now(),
      type: 'ghost_story',
      title: title.trim() || 'Ghost Story',
      content: generatedStory,
      createdAt: new Date().toISOString(),
      metadata: {
        prompt,
        storyType,
        tone,
        length,
        modelUsed: `${modelUsed} (Cloudflare Workers AI)`,
      },
    };
    downloadStoryAsTxt(item);
    showToast('Downloaded formatted .txt file', 'success');
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Ghost className="w-3.5 h-3.5" />
            <span>Story Creation Studio</span>
            <span aria-hidden="true">·</span>
            <span>Cloudflare Workers AI · Gemma</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
            Ghost Story Generator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Summon supernatural narratives, gothic mysteries, and chilling encounters with open-weight Gemma running serverless.
          </p>
        </div>

        {/* Inference Indicator */}
        <div className="flex items-center gap-3 bg-[#0f111a] border border-amber-500/20 rounded-xl px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span
              className={`w-2 h-2 rounded-full ${
                isAiConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[160px]">
              {configuredModel.replace('@cf/google/', '')}
            </span>
          </div>
          <button
            onClick={onNavigateStatus}
            className="text-amber-400 hover:text-amber-300 transition-colors underline cursor-pointer text-[11px]"
          >
            Configure
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN: INPUT CONTROLS & FORM
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="rounded-2xl bg-[#0e1017] parchment-gold-border p-6 space-y-5 shadow-xl"
          >
            {/* Story Title */}
            <div>
              <label htmlFor="story-title" className="block text-xs font-medium text-amber-200/90 mb-1.5">
                Story Title <span className="text-zinc-500">(Optional)</span>
              </label>
              <input
                id="story-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Pendulum of Dunwich"
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Story Prompt / Core Idea */}
            <div>
              <label htmlFor="story-prompt" className="block text-xs font-medium text-amber-200/90 mb-1.5">
                Story Premise or Idea <span className="text-amber-400">*</span>
              </label>
              <textarea
                id="story-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your ghost story idea... What haunts this place? What memory refuses to sleep?"
                required
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl p-3.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Inspiration Sparks */}
            <div>
              <span className="block text-[11px] font-medium text-zinc-400 mb-2">
                Need an eerie spark? Click to populate:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATION_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyInspiration(item)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-200 transition-colors cursor-pointer text-left truncate max-w-[200px]"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Story Sub-genre & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="story-type" className="block text-xs font-medium text-amber-200/90 mb-1.5">
                  Story Type
                </label>
                <select
                  id="story-type"
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value as StoryType)}
                  className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none transition-colors cursor-pointer"
                >
                  {STORY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900 text-zinc-200">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="story-tone" className="block text-xs font-medium text-amber-200/90 mb-1.5">
                  Tone
                </label>
                <select
                  id="story-tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as StoryTone)}
                  className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-200 focus:outline-none transition-colors cursor-pointer"
                >
                  {STORY_TONES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900 text-zinc-200">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Length selector */}
            <div>
              <label className="block text-xs font-medium text-amber-200/90 mb-1.5">
                Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STORY_LENGTHS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      length === l
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-[#08090d] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Setting & Characters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="story-setting" className="block text-xs font-medium text-zinc-400 mb-1">
                  Setting <span className="text-zinc-600">(Optional)</span>
                </label>
                <input
                  id="story-setting"
                  type="text"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="e.g. Victorian lighthouse"
                  className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="story-characters" className="block text-xs font-medium text-zinc-400 mb-1">
                  Characters <span className="text-zinc-600">(Optional)</span>
                </label>
                <input
                  id="story-characters"
                  type="text"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="e.g. Clara, a clock restorer"
                  className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all cursor-pointer focus:outline-none"
            >
              {isGenerating ? (
                <>
                  <CandleFlame size="sm" />
                  <span>Summoning Narrative via Cloudflare Workers AI...</span>
                </>
              ) : (
                <>
                  <Ghost className="w-4 h-4" />
                  <span>Generate Ghost Story</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: STORY READER / OUTPUT / EMPTY STATE
           ========================================================================= */}
        <div className="lg:col-span-7">
          {/* Loading Animation State */}
          {isGenerating && (
            <div className="parchment-reader rounded-2xl p-10 min-h-[460px] flex flex-col items-center justify-center text-center space-y-4">
              <CandleFlame size="lg" />
              <div className="space-y-2 max-w-sm">
                <h3 className="font-serif-title text-2xl font-bold text-amber-200">
                  Conjuring Across the Cloud Edge
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your prompt is being executed by open-weight model{' '}
                  <span className="font-mono text-amber-300">{configuredModel}</span> on Cloudflare Workers AI.
                </p>
                <div className="pt-3 text-[11px] text-zinc-500 italic">
                  “Listening to the wind through the floorboards...”
                </div>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {!isGenerating && errorMsg && (
            <div className="rounded-2xl bg-zinc-900 border border-rose-500/30 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-rose-200">
                    Cloudflare Workers AI Error
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{errorMsg}</p>
                </div>
              </div>

              {troubleshootingMsg && (
                <div className="bg-black/60 rounded-xl p-3.5 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                  <span className="text-amber-400 font-semibold block">Troubleshooting Guide:</span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {troubleshootingMsg}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleGenerate()}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors cursor-pointer"
                >
                  Retry Generation
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

          {/* Completed Story Display */}
          {!isGenerating && !errorMsg && generatedStory && (
            <div className="parchment-reader rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Reader Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/20 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CandleFlame size="sm" />
                  <span className="font-mono text-amber-300 text-[11px]">
                    {modelUsed.replace('@cf/google/', '')}
                  </span>
                  {generatedDuration && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span className="tabular-nums font-mono">
                          {(generatedDuration / 1000).toFixed(1)}s
                        </span>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    title="Copy story"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToLibrary}
                    disabled={isSaved}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    title="Download as plain text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    title="Generate new variation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Prose Output */}
              <div className="prose prose-invert max-w-none text-zinc-200 font-serif text-base sm:text-lg leading-relaxed whitespace-pre-line tracking-wide">
                {generatedStory}
              </div>

              {/* Story Metadata Unboxed Footer */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>Genre: {storyType}</span>
                <span aria-hidden="true">·</span>
                <span>Tone: {tone}</span>
                <span aria-hidden="true">·</span>
                <span>Length: {length}</span>
                <span aria-hidden="true">·</span>
                <span>Inference: Cloudflare Workers AI</span>
              </div>
            </div>
          )}

          {/* Empty State before first generation */}
          {!isGenerating && !errorMsg && !generatedStory && (
            <div className="rounded-2xl border border-dashed border-amber-500/20 bg-[#0d0f17]/60 p-10 min-h-[460px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Ghost className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-serif-title text-2xl font-bold text-amber-100">
                  The Canvas Awaits
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Enter your story idea on the left and click “Generate Ghost Story”.
                  Gemma running on Cloudflare Workers AI will craft an original supernatural tale.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500">
                <span>Open-Weight AI</span>
                <span aria-hidden="true">·</span>
                <span>Serverless Cloud</span>
                <span aria-hidden="true">·</span>
                <span>Saves to your browser</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
