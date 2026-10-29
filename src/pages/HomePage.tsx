/**
 * GhostMemory AI - Homepage & Landing View
 * Atmospheric Halloween & Remembrance presentation with Cloudflare Workers AI.
 */

import React from 'react';
import {
  Sparkles,
  Ghost,
  ShieldCheck,
  BookOpen,
  Feather,
  Cloud,
  ArrowRight,
  Flame,
  HardDrive,
  Download,
  Server,
} from 'lucide-react';
import { NavTab } from '../components/Navbar.tsx';
import { CandleFlame } from '../components/CandleFlame.tsx';

interface HomePageProps {
  onSelectTab: (tab: NavTab) => void;
  isAiConnected: boolean | null;
  configuredModel: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTab,
  isAiConnected,
  configuredModel,
}) => {
  const shortModel = configuredModel.replace('@cf/google/', '');

  return (
    <div className="relative z-10 space-y-24 pb-20">
      {/* =========================================================================
          HERO SECTION (Split-Screen Hero with 1 dominant visual anchor)
         ========================================================================= */}
      <section className="pt-10 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Typographic Hierarchy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Quiet kicker text - no pill enclosing */}
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wider uppercase">
                <span>Hacktoberfest Open-Source AI Challenge</span>
                <span aria-hidden="true">·</span>
                <span>Week 4: Ghost in the Machine</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif-title text-4xl sm:text-6xl lg:text-7xl font-bold text-[#f5f0e6] leading-[1.08] tracking-tight">
                Some Stories <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                  Never Die.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
                Give your memories a voice. Turn forgotten moments into stories that live forever,
                crafted through open-weight Gemma models powered by Cloudflare Workers AI on Netlify.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onSelectTab('story')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 cursor-pointer"
                >
                  <Ghost className="w-4 h-4 text-zinc-950" />
                  <span>Summon a Story</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTab('remember')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-amber-200 bg-zinc-900/80 hover:bg-zinc-800 border border-amber-500/30 hover:border-amber-500/50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <CandleFlame size="sm" />
                  <span>Preserve a Memory</span>
                </button>
              </div>

              {/* Cloud AI Assurance */}
              <div className="pt-2 flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <span>Cloudflare Workers AI</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Open-Weight Gemma</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-300">{shortModel}</span>
              </div>
            </div>

            {/* Right Column: Moonlit Haunted Manor & Candlelight Illustration */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden parchment-gold-border bg-gradient-to-b from-[#131520] to-[#0a0b12] p-8 aspect-square flex flex-col justify-between shadow-2xl">
                {/* Glowing Moon in Night Sky */}
                <div className="absolute top-6 right-8 w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300/40 shadow-[0_0_50px_rgba(251,191,36,0.35)]" />
                <div className="absolute top-8 right-10 w-20 h-20 rounded-full bg-[#131520] opacity-15" />

                {/* Floating Mist & Tree Silhouettes via SVG */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle gothic manor silhouette */}
                  <path
                    d="M120 280L150 200L180 280H220V170L240 140L260 170V280H310L330 220L350 280V370H50V280H120Z"
                    fill="#08090d"
                  />
                  {/* Victorian Spire */}
                  <path d="M235 140L240 70L245 140H235Z" fill="#08090d" />
                  {/* Amber Candlelit Windows */}
                  <rect x="145" y="225" width="10" height="18" rx="5" fill="#f59e0b" className="candle-glow-flame" />
                  <rect x="235" y="195" width="10" height="20" rx="5" fill="#f59e0b" className="candle-glow-flame" />
                  <rect x="270" y="240" width="8" height="16" rx="4" fill="#fbbf24" className="candle-glow-flame" />
                  <rect x="80" y="300" width="12" height="22" rx="6" fill="#f59e0b" className="candle-glow-flame" />

                  {/* Gnarled willow branches */}
                  <path
                    d="M380 400C360 320 340 280 320 250C300 220 270 210 250 220"
                    stroke="#08090d"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M320 250C330 230 360 210 390 220"
                    stroke="#08090d"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 400C40 320 70 270 90 240C110 210 140 200 160 210"
                    stroke="#08090d"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Swirling mist layers */}
                  <path
                    d="M0 350C100 330 200 370 300 340C350 325 400 345 400 360V400H0V350Z"
                    fill="url(#mistGradient)"
                    opacity="0.4"
                  />
                  <defs>
                    <linearGradient id="mistGradient" x1="0" y1="330" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="1" stopColor="#08090d" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Top card text */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Serverless Atelier</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    <span>Cloudflare Workers AI</span>
                  </div>
                </div>

                {/* Bottom card message */}
                <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-amber-500/20 text-xs text-zinc-300 space-y-1">
                  <p className="font-serif-title text-base text-amber-100 italic">
                    “The veil between memory and myth is thinnest in the dark.”
                  </p>
                  <p className="text-zinc-400 text-[11px]">
                    Open-weight AI models deployed serverless on Netlify.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Metric & Proof Row Below Hero Split */}
          <div className="mt-14 pt-8 border-t border-amber-500/15 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                Serverless
              </span>
              <p className="text-xs text-zinc-400">Netlify Deployment</p>
              <p className="text-[11px] text-zinc-500">Zero terminal or local daemon required</p>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                Gemma
              </span>
              <p className="text-xs text-zinc-400">Open-Weight Architecture</p>
              <p className="text-[11px] text-zinc-500">Google DeepMind model on Workers AI</p>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                3 Modes
              </span>
              <p className="text-xs text-zinc-400">Creative Storytelling</p>
              <p className="text-[11px] text-zinc-500">Ghost stories, tributes & diaries</p>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                Browser
              </span>
              <p className="text-xs text-zinc-400">Story Preservation</p>
              <p className="text-[11px] text-zinc-500">Saved locally in your browser storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE CARDS SECTION
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
            Atmospheric Storytelling Suite
          </h2>
          <p className="text-sm text-zinc-400">
            Crafted for Halloween lovers, memorial keepers, and open-source AI enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Ghost Story Studio */}
          <div
            onClick={() => onSelectTab('story')}
            className="group relative rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between hover:bg-[#141724] transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Ghost className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                Ghost Story Generator
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Conjure original paranormal mysteries, haunted houses, forgotten souls, and gothic folklore.
                Control narrative tone, length, setting, and characters.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-amber-400">
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Memory Keeper */}
          <div
            onClick={() => onSelectTab('remember')}
            className="group relative rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between hover:bg-[#141724] transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                <CandleFlame size="md" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                Memory Keeper
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Transform personal anecdotes and traditions into dignified remembrance letters.
                Honors life without supernatural spirit-summoning pretenses.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-purple-300">
              <span>Preserve a Memory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Diary Reimaginer */}
          <div
            onClick={() => onSelectTab('reimagine')}
            className="group relative rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between hover:bg-[#141724] transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                Diary Reimaginer
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Paste personal thoughts or journal fragments and transform them into gothic prose,
                nocturnal reflections, or mysterious atmospheric narratives.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-amber-400">
              <span>Reimagine Journal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Cloudflare Workers AI */}
          <div
            onClick={() => onSelectTab('status')}
            className="group relative rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between hover:bg-[#141724] transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                Cloudflare Workers AI
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Open-weight Gemma models executed on Cloudflare's serverless AI edge.
                No local servers, no terminal installation, and no hardware barriers.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-emerald-400">
              <span>Cloud AI Setup</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Offline-Capable Viewing */}
          <div
            onClick={() => onSelectTab('library')}
            className="group relative rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between hover:bg-[#141724] transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                Local Story Storage
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Read, search, and export your previously saved stories directly from browser memory
                even without an active internet connection.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-blue-400">
              <span>Saved Stories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Personal Story Library */}
          <div
            onClick={() => onSelectTab('library')}
            className="group relative rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between hover:bg-[#141724] transition-all cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                Personal Story Library
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Filter by genre, sort by date, open clean reading parchment views, and download formatted
                plain-text (.txt) archives for printing or safekeeping.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-amber-400">
              <span>View Archives</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (Human Editorial Numbering)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0c0e16] border border-amber-500/20 shadow-xl">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
              The Journey of a Memory
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
              How GhostMemory AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span className="font-serif-title text-3xl font-bold text-amber-400">01.</span>
              <h3 className="text-base font-semibold text-zinc-100">Choose a Mode</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Select Ghost Story Studio for spooky supernatural fiction, Memory Keeper for tribute letters,
                or Diary Reimaginer for stylized journal prose.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-serif-title text-3xl font-bold text-amber-400">02.</span>
              <h3 className="text-base font-semibold text-zinc-100">Provide Your Premise</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Enter your story premise, characters, and atmosphere, or record a genuine family memory
                and traditions to be honored.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-serif-title text-3xl font-bold text-amber-400">03.</span>
              <h3 className="text-base font-semibold text-zinc-100">Cloudflare Edge Inference</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                The prompt is passed to Netlify serverless functions and executed by open-weight Gemma
                on Cloudflare Workers AI edge GPUs, with zero terminal setup.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-serif-title text-3xl font-bold text-amber-400">04.</span>
              <h3 className="text-base font-semibold text-zinc-100">Preserve & Share</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Read your story in candlelit parchment view, save it to your local browser collection,
                or export it as a clean .txt file to keep forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OPEN INNOVATION & ETHICS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Cloud className="w-4 h-4" />
              <span>Hacktoberfest Open AI Principle</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
              Why Open-Weight AI Matters
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Open-weight models like Google Gemma liberate creators from closed proprietary silos.
              By deploying Gemma on serverless Cloudflare Workers AI, anyone can run state-of-the-art
              open AI without maintaining dedicated servers or running local terminal commands.
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Your generated stories and remembrance letters are preserved directly in your browser's
              LocalStorage, giving you immediate control over your creative archive.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectTab('status')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <span>View Cloudflare Model Status & Netlify Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[#090b12] border border-amber-500/20 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>Cloudflare Workers AI Status</span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {isAiConnected ? 'Online' : 'Configuration Required'}
                </span>
              </div>

              <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-2">
                <div className="text-zinc-500">// Netlify Serverless Function Endpoint</div>
                <div className="text-amber-300">POST /.netlify/functions/generate-story</div>
                <div className="text-zinc-500">// Inference Provider & Model</div>
                <div className="text-emerald-400">
                  @cf/google/gemma-4-26b-a4b-it via Cloudflare Workers AI
                </div>
              </div>

              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Free Cloud Deployment</span>
                <span className="text-amber-300/80">Netlify + GitHub</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
