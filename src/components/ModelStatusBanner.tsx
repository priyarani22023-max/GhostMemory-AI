/**
 * ModelStatusBanner
 * Appears when Cloudflare Workers AI credentials need setup,
 * providing real diagnostics and quick access to Netlify configuration guide.
 */

import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink, Sliders } from 'lucide-react';

interface ModelStatusBannerProps {
  isAiConnected: boolean | null;
  modelAvailable: boolean;
  configuredModel: string;
  onRefreshHealth: () => void;
  onNavigateStatus: () => void;
}

export const ModelStatusBanner: React.FC<ModelStatusBannerProps> = ({
  isAiConnected,
  modelAvailable,
  configuredModel,
  onRefreshHealth,
  onNavigateStatus,
}) => {
  // If connected and verified, no warning banner needed
  if (isAiConnected === true && modelAvailable) {
    return null;
  }

  return (
    <div className="bg-[#12141f] border-b border-amber-500/30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold text-amber-200">
              {isAiConnected === false
                ? 'Cloudflare Workers AI Setup Required'
                : 'Verifying Cloudflare Model'}
              :
            </span>{' '}
            <span className="text-zinc-300">
              {isAiConnected === false
                ? `Set CLOUDFLARE_ACCOUNT_ID & CLOUDFLARE_API_TOKEN in Netlify or enter them in Settings.`
                : `Checking connectivity for model "${configuredModel}" on Cloudflare edge.`}
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={onNavigateStatus}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Credentials</span>
          </button>

          <button
            onClick={onRefreshHealth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
