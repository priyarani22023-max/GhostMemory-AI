/**
 * GhostMemory AI Footer
 */

import React from 'react';
import { Ghost, Cloud, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { NavTab } from './Navbar.tsx';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="relative border-t border-amber-500/15 bg-[#07080b] pt-12 pb-8 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Ghost className="w-5 h-5 text-amber-400" />
              <span className="font-display font-bold text-lg text-amber-100 tracking-wide">
                GhostMemory AI
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Where Memories Never Die. An atmospheric storytelling and remembrance experience built for
              the Hacktoberfest Open-Source AI Challenge Week 4: “Ghost in the Machine”.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-amber-300/80">
              <span className="inline-flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloudflare Workers AI · Gemma</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Browser LocalStorage Persistence</span>
              </span>
            </div>
          </div>

          {/* Story Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
              Story Studios
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('story')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Ghost Story Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('remember')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Memory Keeper & Tributes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('reimagine')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Diary Reimaginer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('library')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  My Saved Stories
                </button>
              </li>
            </ul>
          </div>

          {/* Cloud AI & Netlify */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-200/90">
              Deployment & AI
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('status')}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                >
                  Model Status & Netlify Setup
                </button>
              </li>
              <li>
                <a
                  href="https://developers.cloudflare.com/workers-ai/models/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Cloudflare Workers AI Catalog</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/gemma"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>About Google Gemma</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.netlify.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Deploy on Netlify</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} GhostMemory AI · Built with Gemma & Cloudflare Workers AI on Netlify.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>Inference processed by Cloudflare Workers AI</span>
            <span aria-hidden="true">·</span>
            <span>Saved stories stored in Browser LocalStorage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
