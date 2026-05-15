'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { geocodeAddress, type GeocodingResult } from '@/lib/mapbox';
import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useIsMounted } from '@/hooks';
import type { SearchResult } from '@/types';
import {
  IconChevronRight,
  IconLayoutGrid,
  IconMapPin,
  IconSearch,
  IconX,
} from '@tabler/icons-react';

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
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus trap: keep Tab cycling within the search overlay when open
  useFocusTrap(portalRef, isOpen);

  const isMobile = variant === 'mobile';
  const isVisible = isOpen || isClosing;
  const mounted = useIsMounted();

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

  // Open handler - captures position for portal. Does not reset query/results so
  // typing into the (still-focused) inline trigger after a close naturally
  // reopens the portal and preserves the keystrokes.
  const open = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
      setCollapsedHeight(rect.height);
    }
    setIsOpen(true);
    // On mobile the user's tap already focused the (persistent) inline input.
    // Re-focusing async would move focus off the tapped element and iOS Safari
    // would refuse to open the keyboard. Only steal focus on desktop.
    if (!isMobile) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isMobile]);

  const close = useCallback(() => {
    setIsClosing(true);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    // Wait for animation to complete before fully tearing down
    setTimeout(() => {
      setIsClosing(false);
    }, 150);
  }, []);

  // The always-open MobileDrawer mounts a Radix Dialog whose FocusScope is
  // "trapped" (vaul never forwards modal={false} to DialogPrimitive.Root, so
  // Radix defaults to modal). Radix adds document-level focusin/focusout
  // listeners that pull focus back into the drawer whenever focus lands
  // outside it:
  //   - focusin: target (the search input) isn't in the drawer -> refocus drawer
  //   - focusout: focus moving INTO the search fires focusout on the previously
  //     focused element (the drawer/body, outside the search subtree) with
  //     relatedTarget = the input -> Radix refocuses the drawer
  // Either path blurs the input before iOS Safari can open the keyboard.
  //
  // We install a single document capture-phase listener (runs before Radix's
  // bubble-phase document listeners) that isolates every search-related focus
  // event via stopImmediatePropagation, so neither Radix's trap nor React's
  // delegated onFocus ever sees it. Because that also suppresses the React
  // onFocus that would call open(), we take over "open on focus" here,
  // synchronously inside the user-gesture-driven focusin so iOS still raises
  // the keyboard. Re-subscribing when isVisible/open change keeps the handler
  // closures fresh without mutating refs during render.
  useEffect(() => {
    if (!isMobile) return;
    const inSearch = (n: EventTarget | null) =>
      n instanceof Node && !!triggerRef.current?.contains(n);
    const onFocusIn = (e: FocusEvent) => {
      if (!inSearch(e.target)) return;
      if (!isVisible) open();
      e.stopImmediatePropagation();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!inSearch(e.target) && !inSearch(e.relatedTarget)) return;
      e.stopImmediatePropagation();
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('focusout', onFocusOut, true);
    return () => {
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('focusout', onFocusOut, true);
    };
  }, [isMobile, isVisible, open]);

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
      } catch {
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
          bg-panel-bg
          border border-border
          ${isOpen ? 'rounded-t-lg border-b-transparent' : 'rounded-lg'}
          ${isMobile ? 'py-2.5' : 'py-2'}
        `}
      >
        <IconSearch className="w-4 h-4 shrink-0 text-text-secondary" stroke={2} />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            // If focus lingered on the (hidden) inline input after close, typing
            // should re-open the portal instead of silently updating state.
            if (!isOpen) open();
            handleSearch(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => !isVisible && open()}
          placeholder={isOpen ? 'Search Address or Neighborhood...' : 'Search Address...'}
          className={`
            flex-1 bg-transparent
            ${isMobile ? 'text-base' : 'text-sm'} text-text-primary
            placeholder:text-text-secondary
            [border:none] [outline:none] [box-shadow:none]
            focus:[border:none] focus:[outline:none] focus:[box-shadow:none]
          `}
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {isLoading && (
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}
        {isOpen && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="p-0.5 hover:bg-secondary-bg rounded transition-colors"
          >
            <IconX className="w-4 h-4 text-text-tertiary" stroke={2} />
          </button>
        )}
        {!isOpen && !isMobile && (
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-text-tertiary bg-secondary-bg rounded border border-border">
            <span className="text-sm">⌘</span>K
          </kbd>
        )}
        {isOpen && !isMobile && (
          <kbd className="px-1.5 py-0.5 text-xs font-medium text-text-tertiary bg-secondary-bg rounded border border-border">
            Esc
          </kbd>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          className={`
            bg-panel-bg
            border border-border border-t-0
            rounded-b-lg
            overflow-hidden
            animate-in slide-in-from-top-1 duration-150
            ${isMobile ? 'max-h-[40vh]' : 'max-h-[50vh]'}
          `}
        >
          {/* Screen reader announcement of result count */}
          <div className="sr-only" aria-live="assertive" role="status">
            {!isLoading &&
              query.trim() &&
              (filteredNeighborhoods.length + results.length > 0
                ? `${filteredNeighborhoods.length + results.length} results found`
                : `No results found for ${query}`)}
          </div>
          <div ref={listRef} className="overflow-y-auto max-h-[inherit] overscroll-contain">
            {/* Neighborhoods */}
            {filteredNeighborhoods.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
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
                        ${isSelected ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-secondary-bg'}
                      `}
                    >
                      <IconLayoutGrid className="w-4 h-4 shrink-0 opacity-60" stroke={2} />
                      <span className="flex-1">{neighborhood.name}</span>
                      <IconChevronRight className="w-4 h-4 opacity-40" stroke={2} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="py-1 border-t border-border">
                <div className="px-3 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
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
                        ${isSelected ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-secondary-bg'}
                      `}
                    >
                      <IconMapPin className="w-4 h-4 shrink-0 opacity-60" stroke={2} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{result.name}</div>
                        <div className="text-xs opacity-60 capitalize">{result.type}</div>
                      </div>
                      <IconChevronRight className="w-4 h-4 opacity-40" stroke={2} />
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
                <div className="px-4 py-8 text-center">
                  <IconSearch
                    className="w-8 h-8 mx-auto mb-2 text-text-tertiary"
                    stroke={1.5}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium text-text-secondary">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Try a different address or neighborhood name
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: backdrop + floating search rendered via portal when open/closing.
          Mobile intentionally skips the portal so the tapped <input> is never
          remounted — see open() for the iOS focus rationale. */}
      {!isMobile &&
        mounted &&
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
                animation: isClosing ? 'fadeOut 150ms ease-out forwards' : 'fadeIn 150ms ease-out',
                willChange: 'opacity',
                pointerEvents: 'auto',
              }}
            />
            {/* Floating search panel - above the backdrop, expands wider on desktop */}
            <div
              ref={portalRef}
              className="fixed z-50"
              style={
                {
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
                  pointerEvents: 'auto',
                } as React.CSSProperties
              }
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

      {/* Mobile backdrop - sits below the search container (z-20) but above the
          map so tapping outside dismisses, without ever covering the input. */}
      {isMobile && isVisible && (
        <div
          className="pointer-events-auto fixed inset-0 bg-black/30 backdrop-blur-[2px] z-10 transition-opacity duration-150"
          style={{ opacity: isClosing ? 0 : 1 }}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Inline trigger.
          Desktop: invisible when the portal is open (no transition to avoid double-vision).
          Mobile: always the single live search UI — the same <input> the user
          tapped stays mounted, so iOS keeps focus and opens the keyboard. */}
      <div
        ref={triggerRef}
        className={isMobile && isVisible ? 'relative z-20' : undefined}
        style={
          isMobile
            ? undefined
            : {
                opacity: isVisible ? 0 : 1,
                pointerEvents: isVisible ? 'none' : 'auto',
                height: isVisible && collapsedHeight ? collapsedHeight : undefined,
                overflow: isVisible ? 'hidden' : undefined,
              }
        }
      >
        {searchUI}
      </div>
    </>
  );
}
