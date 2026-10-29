/**
 * GhostMemory AI — Where Memories Never Die
 * Hacktoberfest Open-Source AI Challenge Week 4: "Ghost in the Machine"
 * Cloudflare Workers AI + Netlify Serverless Architecture
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AtmosphericBackground } from './components/AtmosphericBackground.tsx';
import { ModelStatusBanner } from './components/ModelStatusBanner.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { StoryStudioPage } from './pages/StoryStudioPage.tsx';
import { MemoryKeeperPage } from './pages/MemoryKeeperPage.tsx';
import { DiaryReimaginerPage } from './pages/DiaryReimaginerPage.tsx';
import { StoryLibraryPage } from './pages/StoryLibraryPage.tsx';
import { ModelStatusPage } from './pages/ModelStatusPage.tsx';
import {
  checkBackendHealth,
  getClientCloudflareConfig,
  DEFAULT_MODEL,
} from './services/api.ts';
import {
  getSavedStories,
  seedSampleItemsIfEmpty,
} from './services/storage.ts';
import { HealthCheckResponse, SavedItem } from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Notification Dispatcher
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = 'toast_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch live health status from Netlify / API backend
  const fetchHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    try {
      const res = await checkBackendHealth();
      setHealth(res);
    } catch (err: unknown) {
      setHealth({
        status: 'error',
        provider: 'Cloudflare Workers AI',
        configuredModel: getClientCloudflareConfig().model || DEFAULT_MODEL,
        modelAvailable: false,
        isConfigured: false,
        error: 'Unable to reach health check function.',
        troubleshooting: 'Check Netlify function status.',
      });
    } finally {
      setIsLoadingHealth(false);
    }
  }, []);

  // Initial setup: seed sample stories and test health
  useEffect(() => {
    seedSampleItemsIfEmpty();
    setSavedItems(getSavedStories());
    fetchHealth();
  }, [fetchHealth]);

  // Refresh saved items from storage
  const handleRefreshStories = useCallback(() => {
    setSavedItems(getSavedStories());
  }, []);

  const handleStorySaved = useCallback((item: SavedItem) => {
    setSavedItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
  }, []);

  const configuredModel = health?.configuredModel || getClientCloudflareConfig().model || DEFAULT_MODEL;
  const isAiConnected = health ? health.status === 'healthy' : null;
  const modelAvailable = health?.modelAvailable ?? false;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07080b] text-[#f4ede2] selection:bg-amber-900/50 selection:text-amber-200">
      {/* Interactive Atmospheric Canvas & Lighting */}
      <AtmosphericBackground />

      {/* Top Bar Navigation (3-Zone Contract) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isAiConnected={isAiConnected}
        configuredModel={configuredModel}
      />

      {/* Cloud Model Diagnostic Banner (visible if Cloudflare credentials are unconfigured) */}
      <ModelStatusBanner
        isAiConnected={isAiConnected}
        modelAvailable={modelAvailable}
        configuredModel={configuredModel}
        onRefreshHealth={fetchHealth}
        onNavigateStatus={() => setCurrentTab('status')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onSelectTab={setCurrentTab}
            isAiConnected={isAiConnected}
            configuredModel={configuredModel}
          />
        )}

        {currentTab === 'story' && (
          <StoryStudioPage
            isAiConnected={isAiConnected}
            configuredModel={configuredModel}
            onStorySaved={handleStorySaved}
            showToast={showToast}
            onNavigateStatus={() => setCurrentTab('status')}
          />
        )}

        {currentTab === 'remember' && (
          <MemoryKeeperPage
            isAiConnected={isAiConnected}
            configuredModel={configuredModel}
            onMemorySaved={handleStorySaved}
            showToast={showToast}
            onNavigateStatus={() => setCurrentTab('status')}
          />
        )}

        {currentTab === 'reimagine' && (
          <DiaryReimaginerPage
            isAiConnected={isAiConnected}
            configuredModel={configuredModel}
            onStorySaved={handleStorySaved}
            showToast={showToast}
            onNavigateStatus={() => setCurrentTab('status')}
          />
        )}

        {currentTab === 'library' && (
          <StoryLibraryPage
            items={savedItems}
            onItemsChange={handleRefreshStories}
            showToast={showToast}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'status' && (
          <ModelStatusPage
            health={health}
            isLoadingHealth={isLoadingHealth}
            onRefreshHealth={fetchHealth}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer with Hacktoberfest information & privacy disclosures */}
      <Footer onSelectTab={setCurrentTab} />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
