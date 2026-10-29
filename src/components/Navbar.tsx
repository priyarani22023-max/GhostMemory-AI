/**
 * Top Bar Navigation complying with the 3-zone Top Bar Contract:
 * [Wordmark] — [Nav Links] — [1 Primary Action]
 */

import React, { useState } from 'react';
import { Ghost, Menu, X, Sparkles, Feather, Bookmark, Cloud } from 'lucide-react';
import { CandleFlame } from './CandleFlame.tsx';

export type NavTab = 'home' | 'story' | 'remember' | 'reimagine' | 'library' | 'status';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isAiConnected: boolean | null;
  configuredModel: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isAiConnected,
  configuredModel,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shortModel = configuredModel.replace('@cf/google/', '').replace('-it', '');

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#08090d]/85 border-b border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with subtle ghost & candle emblem */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left text-inherit cursor-pointer whitespace-nowrap shrink-0 group focus:outline-none"
            aria-label="GhostMemory AI Home"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-amber-500/30 group-hover:border-amber-500/60 transition-colors">
              <Ghost className="w-4 h-4 text-amber-300" />
              <div className="absolute -top-1 -right-1">
                <CandleFlame size="sm" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base tracking-wider text-amber-100 group-hover:text-amber-300 transition-colors">
                GhostMemory
              </span>
            </div>
          </button>

          {/* Zone 2: 5 single-line clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => handleNav('home')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentTab === 'home'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('story')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentTab === 'story'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Story
            </button>
            <button
              onClick={() => handleNav('remember')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentTab === 'remember'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Memory Keeper
            </button>
            <button
              onClick={() => handleNav('reimagine')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentTab === 'reimagine'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Diary Reimaginer
            </button>
            <button
              onClick={() => handleNav('library')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                currentTab === 'library'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              My Stories
            </button>
            <button
              onClick={() => handleNav('status')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'status'
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud AI & Model</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quiet connection text */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Quiet status metadata: unboxed text */}
            <button
              onClick={() => handleNav('status')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Click to check Cloudflare Workers AI model status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiConnected === true
                    ? 'bg-emerald-500'
                    : isAiConnected === false
                    ? 'bg-amber-500'
                    : 'bg-zinc-600'
                }`}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">
                {isAiConnected === true
                  ? `Cloudflare AI · ${shortModel}`
                  : isAiConnected === false
                  ? 'Cloudflare AI: Setup'
                  : 'Checking AI...'}
              </span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNav('story')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Summon Story</span>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0f17] border-b border-amber-500/20 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
              currentTab === 'home' ? 'bg-amber-500/10 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('story')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
              currentTab === 'story' ? 'bg-amber-500/10 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Create Story</span>
          </button>
          <button
            onClick={() => handleNav('remember')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
              currentTab === 'remember' ? 'bg-amber-500/10 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <CandleFlame size="sm" />
            <span>Memory Keeper</span>
          </button>
          <button
            onClick={() => handleNav('reimagine')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
              currentTab === 'reimagine' ? 'bg-amber-500/10 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Feather className="w-4 h-4 text-purple-400" />
            <span>Diary Reimaginer</span>
          </button>
          <button
            onClick={() => handleNav('library')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
              currentTab === 'library' ? 'bg-amber-500/10 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>My Stories</span>
          </button>
          <button
            onClick={() => handleNav('status')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
              currentTab === 'status' ? 'bg-amber-500/10 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Cloud className="w-4 h-4 text-amber-400" />
            <span>Cloud AI & Model Status</span>
          </button>

          <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 px-3 flex items-center justify-between">
            <span>Model: {shortModel}</span>
            <span>{isAiConnected ? 'Workers AI Online' : 'Credentials Needed'}</span>
          </div>
        </div>
      )}
    </header>
  );
};
