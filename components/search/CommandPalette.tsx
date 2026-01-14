'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { geocodeAddress, type GeocodingResult } from '@/lib/mapbox';
import type { SearchResult } from '@/types';

// Popular Seattle neighborhoods for quick navigation
const NEIGHBORHOODS: {
  name: string;
  bounds: [number, number, number, number];
}[] = [
  { name: 'Capitol Hill', bounds: [-122.328, 47.613, -122.305, 47.632] },
  { name: 'Ballard', bounds: [-122.408, 47.66, -122.37, 47.694] },
  { name: 'Fremont', bounds: [-122.365, 47.643, -122.34, 47.663] },
  { name: 'Queen Anne', bounds: [-122.373, 47.62, -122.34, 47.65] },
  { name: 'Wallingford', bounds: [-122.345, 47.648, -122.32, 47.665] },
  { name: 'University District', bounds: [-122.324, 47.65, -122.29, 47.67] },
  { name: 'South Lake Union', bounds: [-122.348, 47.618, -122.328, 47.635] },
  { name: 'Downtown', bounds: [-122.35, 47.595, -122.325, 47.618] },
  { name: 'West Seattle', bounds: [-122.41, 47.53, -122.35, 47.58] },
  { name: 'Beacon Hill', bounds: [-122.32, 47.555, -122.295, 47.585] },
  { name: 'Columbia City', bounds: [-122.295, 47.555, -122.275, 47.575] },
  { name: 'Greenwood', bounds: [-122.365, 47.69, -122.345, 47.71] },
];

// Quick actions for the command palette
const QUICK_ACTIONS = [
  { id: 'toggle-transit', label: 'Toggle Transit Layer', icon: 'transit', shortcut: 'T' },
  { id: 'toggle-theme', label: 'Toggle Dark Mode', icon: 'theme', shortcut: 'D' },
];

interface CommandPaletteProps {
  onSelect: (result: SearchResult) => void;
  onAction?: (actionId: string) => void;
}

export function CommandPalette({ onSelect, onAction }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter neighborhoods based on query
  const filteredNeighborhoods = query.trim()
    ? NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(query.toLowerCase()))
    : NEIGHBORHOODS;

  // Filter actions based on query
  const filteredActions = query.trim()
    ? QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : QUICK_ACTIONS;

  // Calculate total items for keyboard navigation
  const allItems = useMemo<
    Array<
      | { type: 'action'; data: (typeof QUICK_ACTIONS)[0] }
      | { type: 'neighborhood'; data: (typeof NEIGHBORHOODS)[0] }
      | { type: 'result'; data: GeocodingResult }
    >
  >(
    () => [
      ...filteredActions.map((a) => ({ type: 'action' as const, data: a })),
      ...filteredNeighborhoods.map((n) => ({ type: 'neighborhood' as const, data: n })),
      ...results.map((r) => ({ type: 'result' as const, data: r })),
    ],
    [filteredActions, filteredNeighborhoods, results]
  );

  // Open/close handlers
  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    inputRef.current?.blur();
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open();
          // Focus input when opening via keyboard shortcut
          // Use setTimeout(0) to run after state update but still synchronously enough for browsers
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, open, close]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    // Delay to prevent immediate close on open click
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await geocodeAddress(value);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  }, []);

  // Handle item selection
  const handleSelectItem = useCallback(
    (item: (typeof allItems)[0]) => {
      if (item.type === 'action') {
        onAction?.(item.data.id);
        close();
      } else if (item.type === 'neighborhood') {
        onSelect({
          id: `neighborhood-${item.data.name}`,
          name: item.data.name,
          type: 'neighborhood',
          center: [
            (item.data.bounds[0] + item.data.bounds[2]) / 2,
            (item.data.bounds[1] + item.data.bounds[3]) / 2,
          ],
          bbox: item.data.bounds,
        });
        close();
      } else {
        onSelect({
          id: item.data.id,
          name: item.data.name,
          type: item.data.type,
          center: item.data.center,
          bbox: item.data.bbox,
        });
        close();
      }
    },
    [onSelect, onAction, close]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (allItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (allItems[selectedIndex]) {
            handleSelectItem(allItems[selectedIndex]);
          }
          break;
      }
    },
    [allItems, selectedIndex, handleSelectItem]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Backdrop with blur - only visible when open */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/40 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={close}
        aria-hidden="true"
      />

      {/* Search container - always visible, positioned at top center */}
      <div
        ref={containerRef}
        className="
          fixed left-1/2 -translate-x-1/2 z-50
          w-full max-w-md px-4
          transition-all duration-300 ease-out
        "
        style={{
          top: 'max(1rem, env(safe-area-inset-top, 0px))',
        }}
      >
        <div
          className={`
            relative
            bg-[rgb(var(--panel-bg))]
            border border-[rgb(var(--border-color))]
            rounded-xl
            overflow-hidden
            transition-all duration-300 ease-out
            ${isOpen ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'}
          `}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3">
            <SearchIcon
              className={`
                w-5 h-5 flex-shrink-0
                transition-colors duration-200
                ${isOpen ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-tertiary))]'}
              `}
            />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !isOpen && open()}
              placeholder={
                isOpen ? 'Search places, neighborhoods, or commands...' : 'Search Seattle...'
              }
              className="
                flex-1 bg-transparent border-0 ring-0 !outline-none
                text-sm text-[rgb(var(--text-primary))]
                placeholder:text-[rgb(var(--text-tertiary))]
              "
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {isLoading && (
              <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
            )}
            <div className="w-8 h-6 flex items-center justify-end">
              {query && isOpen ? (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="p-1 hover:bg-[rgb(var(--secondary-bg))] rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-[rgb(var(--text-tertiary))]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <kbd
                  className={`
                    hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 
                    text-xs font-medium text-[rgb(var(--text-tertiary))] 
                    bg-[rgb(var(--secondary-bg))] rounded 
                    border border-[rgb(var(--border-color))]
                    transition-opacity duration-200
                    ${isOpen ? 'opacity-0' : 'opacity-100'}
                  `}
                >
                  <span className="text-sm">⌘</span>K
                </kbd>
              )}
            </div>
          </div>

          {/* Results - only visible when open */}
          <div
            className={`
              overflow-hidden
              transition-all duration-300 ease-out
              ${isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="border-t border-[rgb(var(--border-color))]" />
            <div
              ref={listRef}
              className="overflow-y-auto max-h-[calc(60vh-60px)] overscroll-contain [scrollbar-gutter:stable]"
            >
              {/* Quick Actions */}
              {filteredActions.length > 0 && (
                <ResultSection title="Actions">
                  {filteredActions.map((action, idx) => {
                    const globalIdx = idx;
                    return (
                      <ResultItem
                        key={action.id}
                        selected={selectedIndex === globalIdx}
                        onClick={() => handleSelectItem({ type: 'action', data: action })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <ActionIcon type={action.icon} />
                        <span className="flex-1">{action.label}</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-medium text-[rgb(var(--text-tertiary))] bg-[rgb(var(--secondary-bg))] rounded border border-[rgb(var(--border-color))]">
                          {action.shortcut}
                        </kbd>
                      </ResultItem>
                    );
                  })}
                </ResultSection>
              )}

              {/* Neighborhoods */}
              {filteredNeighborhoods.length > 0 && (
                <ResultSection title="Neighborhoods">
                  {filteredNeighborhoods.map((neighborhood, idx) => {
                    const globalIdx = filteredActions.length + idx;
                    return (
                      <ResultItem
                        key={neighborhood.name}
                        selected={selectedIndex === globalIdx}
                        onClick={() =>
                          handleSelectItem({ type: 'neighborhood', data: neighborhood })
                        }
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <NeighborhoodIcon />
                        <span className="flex-1">{neighborhood.name}</span>
                        <ArrowIcon />
                      </ResultItem>
                    );
                  })}
                </ResultSection>
              )}

              {/* Search Results */}
              {results.length > 0 && (
                <ResultSection title="Places">
                  {results.map((result, idx) => {
                    const globalIdx = filteredActions.length + filteredNeighborhoods.length + idx;
                    return (
                      <ResultItem
                        key={result.id}
                        selected={selectedIndex === globalIdx}
                        onClick={() => handleSelectItem({ type: 'result', data: result })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <PlaceIcon type={result.type} />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{result.name}</div>
                          <div className="text-xs text-[rgb(var(--text-tertiary))] capitalize">
                            {result.type}
                          </div>
                        </div>
                        <ArrowIcon />
                      </ResultItem>
                    );
                  })}
                </ResultSection>
              )}

              {/* Empty state when searching */}
              {query.trim() &&
                !isLoading &&
                results.length === 0 &&
                filteredNeighborhoods.length === 0 &&
                filteredActions.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-[rgb(var(--text-secondary))]">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                )}
            </div>

            {/* Footer - hidden on mobile since keyboard hints aren't useful */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-[rgb(var(--border-color))] text-xs text-[rgb(var(--text-tertiary))] bg-[rgb(var(--secondary-bg))/50]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-[rgb(var(--panel-bg))] rounded border border-[rgb(var(--border-color))]">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 bg-[rgb(var(--panel-bg))] rounded border border-[rgb(var(--border-color))]">
                    ↓
                  </kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[rgb(var(--panel-bg))] rounded border border-[rgb(var(--border-color))]">
                    ↵
                  </kbd>
                  <span className="ml-1">Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[rgb(var(--panel-bg))] rounded border border-[rgb(var(--border-color))]">
                    esc
                  </kbd>
                  <span className="ml-1">Close</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="px-4 py-1.5 text-xs font-medium text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultItem({
  children,
  selected,
  onClick,
  onMouseEnter,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      data-selected={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5
        text-sm text-left text-[rgb(var(--text-primary))]
        transition-colors duration-75
        ${selected ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]' : 'hover:bg-[rgb(var(--secondary-bg))]'}
      `}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Icons
// ============================================================================

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ActionIcon({ type }: { type: string }) {
  if (type === 'transit') {
    return (
      <svg
        className="w-4 h-4 text-[rgb(var(--text-secondary))]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    );
  }
  if (type === 'theme') {
    return (
      <svg
        className="w-4 h-4 text-[rgb(var(--text-secondary))]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  return null;
}

function NeighborhoodIcon() {
  return (
    <svg
      className="w-4 h-4 text-[rgb(var(--text-secondary))]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function PlaceIcon({ type }: { type: GeocodingResult['type'] }) {
  if (type === 'address') {
    return (
      <svg
        className="w-4 h-4 text-[rgb(var(--text-secondary))]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  return (
    <svg
      className="w-4 h-4 text-[rgb(var(--text-secondary))]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4 text-[rgb(var(--text-tertiary))]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
