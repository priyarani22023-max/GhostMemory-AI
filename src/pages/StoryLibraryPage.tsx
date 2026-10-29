/**
 * My Stories Library
 * Local browser archive of saved ghost stories, remembrance tributes, and reimagined diary entries.
 */

import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Download,
  Copy,
  Check,
  Ghost,
  Heart,
  Feather,
  BookOpen,
  Calendar,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { SavedItem, ItemType } from '../types/index.ts';
import { deleteStoryItem, downloadStoryAsTxt } from '../services/storage.ts';
import { CandleFlame } from '../components/CandleFlame.tsx';
import { NavTab } from '../components/Navbar.tsx';

interface StoryLibraryPageProps {
  items: SavedItem[];
  onItemsChange: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSelectTab: (tab: NavTab) => void;
}

export const StoryLibraryPage: React.FC<StoryLibraryPageProps> = ({
  items,
  onItemsChange,
  showToast,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | ItemType>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Modal / Reader State
  const [readingItem, setReadingItem] = useState<SavedItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<SavedItem | null>(null);

  // Filter and search logic
  const filteredItems = items
    .filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchContent = item.content.toLowerCase().includes(query);
      const matchRecipient = item.metadata?.recipientName?.toLowerCase().includes(query);
      return matchTitle || matchContent || matchRecipient;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const handleCopy = (item: SavedItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    showToast('Story copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: SavedItem) => {
    downloadStoryAsTxt(item);
    showToast(`Downloaded "${item.title}" as .txt`, 'success');
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const success = deleteStoryItem(itemToDelete.id);
    if (success) {
      if (readingItem?.id === itemToDelete.id) {
        setReadingItem(null);
      }
      setItemToDelete(null);
      onItemsChange();
      showToast('Story deleted from local library', 'info');
    } else {
      showToast('Failed to delete story item', 'error');
    }
  };

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'ghost_story':
        return <Ghost className="w-4 h-4 text-amber-400" />;
      case 'remembrance_letter':
        return <CandleFlame size="sm" />;
      case 'diary_reimagined':
        return <Feather className="w-4 h-4 text-purple-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTypeLabel = (type: ItemType) => {
    switch (type) {
      case 'ghost_story':
        return 'Ghost Story';
      case 'remembrance_letter':
        return 'Remembrance Tribute';
      case 'diary_reimagined':
        return 'Diary Reimagined';
      default:
        return 'Saved Item';
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Private Local Archive</span>
            <span aria-hidden="true">·</span>
            <span>Stored in Browser LocalStorage</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#f5f0e6]">
            My Stories & Remembrance Library
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Your collection of generated stories, remembrance letters, and transformed diary entries.
          </p>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#0f111a] border border-amber-500/20 px-3.5 py-2 rounded-xl">
          <span>Total Preserved:</span>
          <span className="font-mono text-amber-300 font-bold tabular-nums">
            {items.length}
          </span>
        </div>
      </div>

      {/* Storage Disclosure Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-200">Browser Storage & Cloud Inference Notice:</strong> Stories are preserved inside
          your browser's local storage (LocalStorage). Clearing your browser cookies or cache will erase saved records.
          AI generation is processed through Cloudflare Workers AI on Netlify. Export (.txt) any stories you wish to permanently preserve on disk.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keywords, or recipient..."
            className="w-full bg-[#0e1017] border border-zinc-800 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter segment */}
          <div className="flex items-center gap-1 p-1 bg-[#0e1017] border border-zinc-800 rounded-xl text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-amber-500/20 text-amber-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setSelectedType('ghost_story')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'ghost_story'
                  ? 'bg-amber-500/20 text-amber-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ghost Stories
            </button>
            <button
              onClick={() => setSelectedType('remembrance_letter')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'remembrance_letter'
                  ? 'bg-amber-500/20 text-amber-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tributes
            </button>
            <button
              onClick={() => setSelectedType('diary_reimagined')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'diary_reimagined'
                  ? 'bg-amber-500/20 text-amber-200 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Diaries
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
            className="bg-[#0e1017] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="alphabetical">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Grid of Stories */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#0f111a] parchment-gold-border p-6 flex flex-col justify-between space-y-4 hover:bg-[#141724] transition-all group shadow-lg"
            >
              <div className="space-y-3">
                {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5 font-medium text-amber-300">
                    {getTypeIcon(item.type)}
                    <span>{getTypeLabel(item.type)}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setReadingItem(item)}
                  className="font-serif-title text-xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-2"
                >
                  {item.title}
                </h3>

                {/* Snippet */}
                <p
                  onClick={() => setReadingItem(item)}
                  className="text-xs sm:text-sm text-zinc-400 line-clamp-4 leading-relaxed cursor-pointer font-serif italic"
                >
                  {item.content.replace(/^#\s+[^\n]+\n+/, '')}
                </p>
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <button
                  onClick={() => setReadingItem(item)}
                  className="font-medium text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                >
                  Read Full Text
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Copy story"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Download as .txt"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-amber-500/20 bg-[#0d0f17]/60 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif-title text-2xl font-bold text-amber-100">
              {searchQuery ? 'No Matching Stories' : 'Your Library is Quiet'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {searchQuery
                ? `No stories matched "${searchQuery}". Try a different keyword or reset filters.`
                : 'You have not saved any stories yet. Summon a supernatural tale or preserve a cherished memory to fill these shelves.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onSelectTab('story')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer"
            >
              <Ghost className="w-4 h-4" />
              <span>Summon a Story</span>
            </button>
            <button
              onClick={() => onSelectTab('remember')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-200 bg-zinc-900 border border-amber-500/30 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <CandleFlame size="sm" />
              <span>Preserve a Memory</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL READING LIGHTBOX / MODAL
         ========================================================================= */}
      {readingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setReadingItem(null)}
        >
          <div
            className="relative w-full max-w-3xl parchment-reader rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl my-8 border border-amber-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-amber-500/20 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                  {getTypeIcon(readingItem.type)}
                  <span>{getTypeLabel(readingItem.type)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-400">
                    {new Date(readingItem.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-amber-100">
                  {readingItem.title}
                </h2>
              </div>

              <button
                onClick={() => setReadingItem(null)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="prose prose-invert max-w-none text-zinc-200 font-serif text-base sm:text-lg leading-relaxed whitespace-pre-line tracking-wide max-h-[60vh] overflow-y-auto pr-2">
              {readingItem.content}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="text-[11px] text-zinc-500">
                {readingItem.metadata?.modelUsed || 'Open-weight Gemma via Ollama'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(readingItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                >
                  {copiedId === readingItem.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === readingItem.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownload(readingItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export TXT</span>
                </button>

                <button
                  onClick={() => setItemToDelete(readingItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#12141f] border border-rose-500/30 p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Delete Saved Story?
                </h3>
                <p className="text-xs text-zinc-400">
                  This action removes the story from browser storage.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-serif italic">
              "{itemToDelete.title}"
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
