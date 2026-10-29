/**
 * Cloud AI & Model Status Page
 * Live prober for Cloudflare Workers AI + Gemma open-weight inference,
 * Netlify serverless deployment guide without terminal, and open AI curriculum.
 */

import React, { useState } from 'react';
import {
  Cloud,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Sliders,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  Key,
  Globe,
  UploadCloud,
} from 'lucide-react';
import { HealthCheckResponse, CloudflareClientConfig } from '../types/index.ts';
import {
  getClientCloudflareConfig,
  saveClientCloudflareConfig,
  DEFAULT_MODEL,
} from '../services/api.ts';

interface ModelStatusPageProps {
  health: HealthCheckResponse | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AVAILABLE_GEMMA_MODELS = [
  {
    id: '@cf/google/gemma-4-26b-a4b-it',
    name: 'Gemma 4 (26B A4B Instruct)',
    desc: 'Flagship open-weight model with 256K context, deep gothic tone, and superior literary coherence.',
    recommended: true,
  },
  {
    id: '@cf/google/gemma-7b-it-lora',
    name: 'Gemma 7B Instruct',
    desc: 'Balanced open model with 4,096 context, ideal for brisk supernatural pacing.',
    recommended: false,
  },
  {
    id: '@cf/google/gemma-2b-it-lora',
    name: 'Gemma 2B Instruct',
    desc: 'Ultra-lightweight model with 8,192 context, quick low-latency completions.',
    recommended: false,
  },
];

export const ModelStatusPage: React.FC<ModelStatusPageProps> = ({
  health,
  isLoadingHealth,
  onRefreshHealth,
  showToast,
}) => {
  const [config, setConfig] = useState<CloudflareClientConfig>(getClientCloudflareConfig());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    saveClientCloudflareConfig(config);
    showToast('Saved custom Cloudflare parameters for this browser session', 'success');
    setTimeout(() => {
      setIsSavingConfig(false);
      onRefreshHealth();
    }, 400);
  };

  const getStatusBadge = () => {
    if (!health) {
      return {
        label: 'Checking status...',
        color: 'text-zinc-400 bg-zinc-800 border-zinc-700',
        dot: 'bg-zinc-500',
      };
    }
    if (health.status === 'healthy') {
      return {
        label: 'Active & Verified',
        color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    if (health.status === 'unconfigured') {
      return {
        label: 'Credentials Needed',
        color: 'text-amber-300 bg-amber-950/40 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    }
    if (health.status === 'auth_error') {
      return {
        label: 'Auth Failed',
        color: 'text-rose-300 bg-rose-950/40 border-rose-500/30',
        dot: 'bg-rose-400',
      };
    }
    if (health.status === 'rate_limited') {
      return {
        label: 'Rate Limited',
        color: 'text-amber-300 bg-amber-950/40 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    }
    return {
      label: 'Connection Error',
      color: 'text-rose-300 bg-rose-950/40 border-rose-500/30',
      dot: 'bg-rose-400',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Cloud className="w-3.5 h-3.5" />
            <span>Serverless AI & Deployment Console</span>
            <span aria-hidden="true">·</span>
            <span>Cloudflare Workers AI · Gemma</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
            Cloud AI & Model Status
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            GhostMemory AI is deployed serverless on Netlify, powered by Google DeepMind's open-weight Gemma
            running on Cloudflare Workers AI edge GPUs.
          </p>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRefreshHealth}
          disabled={isLoadingHealth}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 hover:border-amber-500/60 text-xs font-medium text-amber-200 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
          <span>{isLoadingHealth ? 'Probing Cloudflare...' : 'Probe Model Health'}</span>
        </button>
      </div>

      {/* =========================================================================
          LIVE MODEL STATUS PANEL
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Real Status Card */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0e1017] parchment-gold-border p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-zinc-100">
                Cloudflare Workers AI Live Probe
              </h2>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${statusBadge.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </div>
          </div>

          {/* Metric Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Netlify Functions */}
            <div className="bg-[#08090d] border border-zinc-850 p-4 rounded-xl space-y-1">
              <span className="text-xs text-zinc-500">Netlify Function Endpoint</span>
              <div className="text-xs font-mono text-emerald-400 truncate">
                /.netlify/functions/health
              </div>
            </div>

            {/* Inference Provider */}
            <div className="bg-[#08090d] border border-zinc-850 p-4 rounded-xl space-y-1">
              <span className="text-xs text-zinc-500">Inference Engine</span>
              <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-medium">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloudflare Workers AI</span>
              </div>
            </div>

            {/* Configured Model */}
            <div className="bg-[#08090d] border border-zinc-850 p-4 rounded-xl space-y-1 sm:col-span-2">
              <span className="text-xs text-zinc-500">Configured Open-Weight Model</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300">
                  {health?.configuredModel || config.model}
                </span>
                {health?.latencyMs !== undefined && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    Latency: {health.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostics Alert if unconfigured or error */}
          {health?.error && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Configuration Status:</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{health.error}</p>
              {health.troubleshooting && (
                <div className="bg-black/60 p-3 rounded font-mono text-amber-300 text-[11px] leading-relaxed">
                  {health.troubleshooting}
                </div>
              )}
            </div>
          )}

          {/* Available Gemma Model Catalog Selector */}
          <div className="space-y-3 pt-2 border-t border-zinc-850">
            <span className="text-xs font-medium text-zinc-300 block">
              Cloudflare Workers AI Gemma Catalog:
            </span>
            <div className="space-y-2">
              {AVAILABLE_GEMMA_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setConfig({ ...config, model: m.id });
                    showToast(`Selected ${m.name}. Click "Save Parameters" to apply.`, 'info');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer flex flex-col gap-1 ${
                    config.model === m.id
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-100'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{m.name}</span>
                    {m.recommended && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-amber-300/80">{m.id}</span>
                  <p className="text-[11px] text-zinc-400">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Panel for Quick Browser Testing */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0e1017] parchment-gold-border p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-zinc-100">
              Client Credential Overrides
            </h2>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            For production on Netlify, credentials are read from server-side environment variables.
            You may also test with your personal Cloudflare API token directly in this browser session:
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label htmlFor="cfg-acc" className="block text-xs font-medium text-zinc-300 mb-1">
                Cloudflare Account ID
              </label>
              <input
                id="cfg-acc"
                type="text"
                value={config.accountId}
                onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                placeholder="e.g. 7c32bf8e1049..."
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cfg-tok" className="block text-xs font-medium text-zinc-300 mb-1">
                Cloudflare API Token
              </label>
              <input
                id="cfg-tok"
                type="password"
                value={config.apiToken}
                onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                placeholder="Workers AI token with Read/Run permissions"
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="cfg-mod" className="block text-xs font-medium text-zinc-300 mb-1">
                Cloudflare Model Identifier
              </label>
              <input
                id="cfg-mod"
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="@cf/google/gemma-4-26b-a4b-it"
                className="w-full bg-[#08090d] border border-zinc-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Save Parameters & Probe
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-2">
            <span className="font-semibold text-zinc-300 block">Security Note:</span>
            <p className="leading-relaxed">
              Tokens entered here are stored in your browser's private session and forwarded via secure headers to the Netlify function.
              They are never exposed to other visitors.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NO-TERMINAL NETLIFY & GITHUB DEPLOYMENT GUIDE
         ========================================================================= */}
      <section className="rounded-3xl bg-[#0c0e16] border border-amber-500/20 p-8 sm:p-10 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <UploadCloud className="w-4 h-4" />
            <span>Zero-Terminal Deployment Guide</span>
          </div>
          <h2 className="font-serif-title text-3xl font-bold text-[#f5f0e6]">
            How to Deploy on Netlify in 3 Minutes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            You do not need to install terminal packages, manage servers, or run local daemons.
            Deploy directly using the GitHub and Netlify web dashboards:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#08090d] border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif-title text-2xl font-bold text-amber-400">
                Step 1
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-300 hover:underline inline-flex items-center gap-1"
              >
                <span>github.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Push Repository to GitHub
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create a new repository on GitHub (e.g. <code>ghostmemory-ai</code>) and push this codebase.
              Netlify will listen for updates from your main branch.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#08090d] border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif-title text-2xl font-bold text-amber-400">
                Step 2
              </span>
              <a
                href="https://app.netlify.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-300 hover:underline inline-flex items-center gap-1"
              >
                <span>netlify.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Import into Netlify
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Log into your Netlify dashboard. Click <strong>Add new site &gt; Import an existing project</strong>,
              connect your GitHub account, and select your <code>ghostmemory-ai</code> repository.
            </p>
            <div className="bg-black/70 p-2.5 rounded-lg font-mono text-[11px] text-zinc-300 space-y-1">
              <div>Build command: <span className="text-emerald-400">npm run build</span></div>
              <div>Publish directory: <span className="text-emerald-400">dist</span></div>
              <div>Functions directory: <span className="text-emerald-400">netlify/functions</span></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#08090d] border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif-title text-2xl font-bold text-amber-400">
                Step 3
              </span>
              <span className="text-xs text-amber-300/80 font-mono">Environment</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Add Cloudflare Variables
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              In Netlify, open <strong>Site configuration &gt; Environment variables</strong> and add:
            </p>
            <div className="bg-black/70 p-2.5 rounded-lg font-mono text-[11px] text-amber-300 space-y-1 select-all">
              <div>CLOUDFLARE_ACCOUNT_ID</div>
              <div>CLOUDFLARE_API_TOKEN</div>
              <div>CLOUDFLARE_AI_MODEL</div>
            </div>
            <p className="text-[11px] text-zinc-400">
              Click <strong>Deploy site</strong>. Your website is live worldwide with free serverless AI!
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OPEN INNOVATION CURRICULUM
         ========================================================================= */}
      <section className="space-y-6">
        <div className="text-left space-y-2">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            Open-Source AI Challenge Week 4
          </span>
          <h2 className="font-serif-title text-3xl font-bold text-[#f5f0e6]">
            Serverless Open-Weight AI Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#0f111a] parchment-gold-border p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-amber-100">
              Democratizing Open Weights on the Edge
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Not everyone has a high-end GPU or 32GB of RAM to run large models locally. By pairing Google's
              open-weight Gemma architecture with Cloudflare Workers AI and Netlify, developers can provide
              instant, high-performance open AI storytelling to any visitor on any smartphone or browser.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0f111a] parchment-gold-border p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-amber-100">
              Open Weights vs. Closed APIs
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Unlike proprietary hosted models that can modify prices, alter system prompts, or retire APIs unexpectedly,
              Gemma's weights are published and reproducible. Cloudflare Workers AI executes these exact weights on a global
              fleet of GPUs, ensuring consistent storytelling quality and adherence to open AI principles.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0f111a] parchment-gold-border p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-amber-100">
              Transparent Privacy & Local Storage
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              GhostMemory AI preserves your completed stories, letters, and reimaginings directly in your browser's
              local storage. Netlify serverless functions serve as an ephemeral gateway, passing prompts to Cloudflare
              for inference without maintaining persistent user logs on a backend database.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0f111a] parchment-gold-border p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-amber-100">
              The "Ghost in the Machine" Concept
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Honoring memories and spinning ghost stories by candlelight is one of humanity's oldest traditions.
              This challenge entry demonstrates that modern AI can honor that storytelling tradition without
              locking creators into restrictive walled gardens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
