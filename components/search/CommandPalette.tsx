'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

interface PanelSearchProps {
  onSelect: (result: SearchResult) => void;
  variant?: 'desktop' | 'mobile';
}

/**
 * Inline search component that expands in place within a panel.
 * When open, renders via portal above the blurred backdrop.
 */
export function PanelSearch({ onSelect, variant = 'desktop' }: PanelSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = variant === 'mobile';
  const isVisible = isOpen || isClosing;

  // For portal rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter neighborhoods based on query
  const filteredNeighborhoods = query.trim()
    ? NEIGHBORHOODS.filter((n) => n.name.toLowerCase().includes(query.toLowerCase()))
    : NEIGHBORHOODS;

  // Calculate total items for keyboard navigation
  const allItems = useMemo<
    Array<
      | { type: 'neighborhood'; data: (typeof NEIGHBORHOODS)[0] }
      | { type: 'result'; data: GeocodingResult }
    >
  >(
    () => [
      ...filteredNeighborhoods.map((n) => ({ type: 'neighborhood' as const, data: n })),
      ...results.map((r) => ({ type: 'result' as const, data: r })),
    ],
    [filteredNeighborhoods, results]
  );

  // Open handler - captures position for portal
  const open = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(true);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);
    setIsOpen(false);
    // Wait for animation to complete before fully closing
    setTimeout(() => {
      setIsClosing(false);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setPosition(null);
    }, 150);
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
      if (item.type === 'neighborhood') {
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
      } else {
        onSelect({
          id: item.data.id,
          name: item.data.name,
          type: item.data.type,
          center: item.data.center,
          bbox: item.data.bbox,
        });
      }
      close();
    },
    [onSelect, close]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || allItems.length === 0) return;

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
    [isOpen, allItems, selectedIndex, handleSelectItem]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // The search UI (used both inline and in portal)
  const searchUI = (
    <div className={isOpen ? 'shadow-2xl rounded-lg' : ''}>
      {/* Search Input */}
      <div
        className={`
          flex items-center gap-2 px-3
          bg-[rgb(var(--panel-bg))]
          border border-[rgb(var(--border-color))]
          ${isOpen ? 'rounded-t-lg border-b-transparent' : 'rounded-lg'}
          ${isMobile ? 'py-2.5' : 'py-2'}
        `}
      >
        <svg
          className="w-4 h-4 shrink-0 text-[rgb(var(--text-secondary))]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => !isOpen && open()}
          placeholder={isOpen ? 'Search address or neighborhood...' : 'Search address...'}
          className="
            flex-1 bg-transparent
            text-sm text-[rgb(var(--text-primary))]
            placeholder:text-[rgb(var(--text-secondary))]
            [border:none] [outline:none] [box-shadow:none]
            focus:[border:none] focus:[outline:none] focus:[box-shadow:none]
          "
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {isLoading && (
          <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
        )}
        {isOpen && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="p-0.5 hover:bg-[rgb(var(--secondary-bg))] rounded transition-colors"
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
        )}
        {!isOpen && !isMobile && (
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-[rgb(var(--text-tertiary))] bg-[rgb(var(--secondary-bg))] rounded border border-[rgb(var(--border-color))]">
            <span className="text-sm">⌘</span>K
          </kbd>
        )}
        {isOpen && (
          <kbd className="px-1.5 py-0.5 text-xs font-medium text-[rgb(var(--text-tertiary))] bg-[rgb(var(--secondary-bg))] rounded border border-[rgb(var(--border-color))]">
            Esc
          </kbd>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          className={`
            bg-[rgb(var(--panel-bg))]
            border border-[rgb(var(--border-color))] border-t-0
            rounded-b-lg
            overflow-hidden
            animate-in slide-in-from-top-1 duration-150
            ${isMobile ? 'max-h-[40vh]' : 'max-h-[50vh]'}
          `}
        >
          <div
            ref={listRef}
            className="overflow-y-auto max-h-[inherit] overscroll-contain"
          >
            {/* Neighborhoods */}
            {filteredNeighborhoods.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
                  Neighborhoods
                </div>
                {filteredNeighborhoods.map((neighborhood, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={neighborhood.name}
                      data-selected={isSelected}
                      onClick={() => handleSelectItem({ type: 'neighborhood', data: neighborhood })}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2
                        text-sm text-left
                        transition-colors duration-75
                        ${isSelected ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--secondary-bg))]'}
                      `}
                    >
                      <svg
                        className="w-4 h-4 shrink-0 opacity-60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      <span className="flex-1">{neighborhood.name}</span>
                      <svg
                        className="w-4 h-4 opacity-40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="py-1 border-t border-[rgb(var(--border-color))]">
                <div className="px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
                  Places
                </div>
                {results.map((result, idx) => {
                  const globalIdx = filteredNeighborhoods.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <button
                      key={result.id}
                      data-selected={isSelected}
                      onClick={() => handleSelectItem({ type: 'result', data: result })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2
                        text-sm text-left
                        transition-colors duration-75
                        ${isSelected ? 'bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--secondary-bg))]'}
                      `}
                    >
                      <svg
                        className="w-4 h-4 shrink-0 opacity-60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{result.name}</div>
                        <div className="text-xs opacity-60 capitalize">{result.type}</div>
                      </div>
                      <svg
                        className="w-4 h-4 opacity-40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state when searching */}
            {query.trim() &&
              !isLoading &&
              results.length === 0 &&
              filteredNeighborhoods.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-[rgb(var(--text-secondary))]">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Backdrop + floating search - rendered via portal when open/closing */}
      {mounted &&
        isVisible &&
        position &&
        createPortal(
          <>
            {/* Backdrop with blur */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              onClick={close}
              aria-hidden="true"
              style={{
                animation: isClosing 
                  ? 'fadeOut 150ms ease-out forwards' 
                  : 'fadeIn 150ms ease-out',
                willChange: 'opacity',
              }}
            />
            {/* Floating search panel - above the backdrop, expands wider on desktop */}
            <div
              className="fixed z-50"
              style={{
                top: position.top,
                left: position.left,
                // Use CSS custom properties for width animation
                '--start-width': `${position.width}px`,
                '--end-width': `${isMobile ? position.width : Math.max(position.width, 420)}px`,
                width: isMobile ? position.width : Math.max(position.width, 420),
                animation: isClosing 
                  ? 'searchCollapse 150ms ease-out forwards' 
                  : 'searchExpand 150ms ease-out forwards',
                transformOrigin: 'top left',
                willChange: 'transform, opacity, width',
              } as React.CSSProperties}
            >
              {searchUI}
            </div>
            {/* Keyframes for animations */}
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
              }
              @keyframes searchExpand {
                from {
                  opacity: 0;
                  width: var(--start-width);
                  transform: translateY(-2px);
                }
                to {
                  opacity: 1;
                  width: var(--end-width);
                  transform: translateY(0);
                }
              }
              @keyframes searchCollapse {
                from {
                  opacity: 1;
                  width: var(--end-width);
                  transform: translateY(0);
                }
                to {
                  opacity: 0;
                  width: var(--start-width);
                  transform: translateY(-2px);
                }
              }
            `}</style>
          </>,
          document.body
        )}

      {/* Inline trigger - invisible when portal is open (no transition to avoid double-vision) */}
      <div
        ref={triggerRef}
        style={{ 
          opacity: isVisible ? 0 : 1,
          pointerEvents: isVisible ? 'none' : 'auto'
        }}
      >
        {searchUI}
      </div>
    </>
  );
}
