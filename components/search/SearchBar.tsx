'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { geocodeAddress, type GeocodingResult } from '@/lib/mapbox';
import type { SearchResult } from '@/types';

// Popular Seattle neighborhoods with their bounds for quick navigation
const NEIGHBORHOODS: {
  name: string;
  bounds: [number, number, number, number]; // [west, south, east, north]
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

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

export function SearchBar({
  onSelect,
  placeholder = 'Search addresses, neighborhoods...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setShowNeighborhoods(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await geocodeAddress(value);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Handle result selection
  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      onSelect({
        id: result.id,
        name: result.name,
        type: result.type,
        center: result.center,
        bbox: result.bbox,
      });
      setQuery(result.name);
      setIsOpen(false);
      setShowNeighborhoods(false);
      setResults([]);
      inputRef.current?.blur();
    },
    [onSelect]
  );

  // Handle neighborhood selection
  const handleNeighborhoodSelect = useCallback(
    (neighborhood: (typeof NEIGHBORHOODS)[0]) => {
      onSelect({
        id: `neighborhood-${neighborhood.name}`,
        name: neighborhood.name,
        type: 'neighborhood',
        center: [
          (neighborhood.bounds[0] + neighborhood.bounds[2]) / 2,
          (neighborhood.bounds[1] + neighborhood.bounds[3]) / 2,
        ],
        bbox: neighborhood.bounds,
      });
      setQuery(neighborhood.name);
      setIsOpen(false);
      setShowNeighborhoods(false);
      setResults([]);
      inputRef.current?.blur();
    },
    [onSelect]
  );

  // Handle focus - show neighborhoods if no query
  const handleFocus = useCallback(() => {
    if (!query.trim()) {
      setShowNeighborhoods(true);
      setIsOpen(true);
    } else if (results.length > 0) {
      setIsOpen(true);
    }
  }, [query, results.length]);

  // Calculate total items for keyboard nav
  const totalItems = showNeighborhoods ? NEIGHBORHOODS.length : results.length;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || totalItems === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            if (showNeighborhoods && NEIGHBORHOODS[selectedIndex]) {
              handleNeighborhoodSelect(NEIGHBORHOODS[selectedIndex]);
            } else if (results[selectedIndex]) {
              handleSelect(results[selectedIndex]);
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setShowNeighborhoods(false);
          inputRef.current?.blur();
          break;
      }
    },
    [
      isOpen,
      totalItems,
      selectedIndex,
      showNeighborhoods,
      handleNeighborhoodSelect,
      handleSelect,
      results,
    ]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNeighborhoods(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for result type
  const getTypeIcon = (type: GeocodingResult['type']) => {
    switch (type) {
      case 'address':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'neighborhood':
        return (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
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
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <svg
              className="w-5 h-5 text-[rgb(var(--text-secondary))] animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-[rgb(var(--text-secondary))]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-4 py-3
            bg-[rgb(var(--panel-bg))]
            border border-[rgb(var(--border-color))]
            rounded-lg
            text-sm text-[rgb(var(--text-primary))]
            placeholder:text-[rgb(var(--text-secondary))]
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent
            shadow-lg
          "
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                setShowNeighborhoods(false);
                inputRef.current?.focus();
              }}
              className="flex items-center"
            >
              <svg
                className="w-4 h-4 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-[rgb(var(--text-tertiary))] bg-[rgb(var(--secondary-bg))] border border-[rgb(var(--border-color))] rounded">
              <span className="text-sm">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Quick Neighborhoods dropdown */}
      {isOpen && showNeighborhoods && (
        <div className="absolute w-full mt-2 bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-4 py-2 border-b border-[rgb(var(--border-color))]">
            <span className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
              Jump to Neighborhood
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {NEIGHBORHOODS.map((neighborhood, index) => (
              <button
                key={neighborhood.name}
                onClick={() => handleNeighborhoodSelect(neighborhood)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  transition-colors
                  ${
                    selectedIndex === index
                      ? 'bg-[rgb(var(--secondary-bg))]'
                      : 'hover:bg-[rgb(var(--secondary-bg))]'
                  }
                `}
              >
                <span className="text-[rgb(var(--text-secondary))]">
                  {getTypeIcon('neighborhood')}
                </span>
                <span className="text-sm text-[rgb(var(--text-primary))]">{neighborhood.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && !showNeighborhoods && results.length > 0 && (
        <div className="absolute w-full mt-2 bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] rounded-lg shadow-lg overflow-hidden z-50">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                transition-colors
                ${
                  selectedIndex === index
                    ? 'bg-[rgb(var(--secondary-bg))]'
                    : 'hover:bg-[rgb(var(--secondary-bg))]'
                }
              `}
            >
              <span className="text-[rgb(var(--text-secondary))]">{getTypeIcon(result.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[rgb(var(--text-primary))] truncate">
                  {result.name}
                </div>
                <div className="text-xs text-[rgb(var(--text-secondary))] capitalize">
                  {result.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
