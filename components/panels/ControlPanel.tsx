'use client';

import { BaseLayerSelector } from '@/components/controls/BaseLayerSelector';
import { FilterChips } from '@/components/controls/FilterChips';
import { Legend } from '@/components/controls/Legend';
import { Switch, ThemeToggle } from '@/components/ui';
import type { LayerConfig, FilterState } from '@/types';
import Link from 'next/link';

// Define base layer options (mutually exclusive)
const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];
const BASE_LAYER_OPTIONS = [
  {
    id: 'zoning',
    label: 'Simplified',
    description: 'What can be built here',
  },
  {
    id: 'zoning_detailed',
    label: 'Technical',
    description: 'Official zoning codes',
  },
];

// Transit layers that should be combined into a single toggle
const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops'];

// Bike infrastructure layer
const BIKE_LAYER_ID = 'bike_facilities';

interface ControlPanelProps {
  layers: LayerConfig[];
  activeLayers: string[];
  filters: FilterState;
  onBaseLayerChange: (layerId: string | null) => void;
  onTransitToggle: (enabled: boolean) => void;
  onBikeToggle: (enabled: boolean) => void;
  onFilterChange: (layerId: string, filterId: string, values: string[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ControlPanel({
  layers,
  activeLayers,
  filters,
  onBaseLayerChange,
  onTransitToggle,
  onBikeToggle,
  onFilterChange,
  isCollapsed,
  onToggleCollapse,
}: ControlPanelProps) {
  // Determine which base layer is active (if any)
  const activeBaseLayer = BASE_LAYER_IDS.find((id) => activeLayers.includes(id)) || null;

  // Check if transit is enabled (any transit layer active)
  const isTransitActive = TRANSIT_LAYER_IDS.some((id) => activeLayers.includes(id));

  // Check if bike layer is enabled
  const isBikeActive = activeLayers.includes(BIKE_LAYER_ID);

  // Get base layers and their configs
  const baseLayers = layers.filter((l) => BASE_LAYER_IDS.includes(l.id));

  // Get the active base layer config (for filters)
  const activeBaseLayerConfig = baseLayers.find((l) => l.id === activeBaseLayer);

  return (
    <>
      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className={`
          absolute top-[68px] z-20 p-2 
          bg-[rgb(var(--panel-bg))] 
          border border-[rgb(var(--border-color))]
          rounded-r-md
          hover:bg-[rgb(var(--secondary-bg))]
          transition-all duration-300
          ${isCollapsed ? '-left-px' : 'left-[319px]'}
        `}
        aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        <svg
          className={`w-4 h-4 text-[rgb(var(--text-secondary))] transition-transform ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-80 z-10
          bg-[rgb(var(--panel-bg))] 
          border-r border-[rgb(var(--border-color))]
          shadow-lg
          transition-transform duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex-none p-4 border-b border-[rgb(var(--border-color))]">
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <h1 className="text-lg font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                Seattle Atlas
              </h1>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          {/* Base Layer Selector (Arc-style) */}
          <BaseLayerSelector
            options={BASE_LAYER_OPTIONS}
            activeBaseLayer={activeBaseLayer}
            onSelect={onBaseLayerChange}
          />

          {/* Filters for active base layer */}
          {activeBaseLayerConfig?.filters && activeBaseLayerConfig.filters.length > 0 && (
            <div className="px-4 pb-4">
              <FilterChips
                filters={activeBaseLayerConfig.filters}
                values={(filters[activeBaseLayerConfig.id] as Record<string, string[]>) || {}}
                onChange={(filterId, values) =>
                  onFilterChange(activeBaseLayerConfig.id, filterId, values)
                }
              />
            </div>
          )}

          <div className="h-px bg-[rgb(var(--border-color))]" />

          {/* Overlay Layers */}
          <div>
            <div className="px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
                Overlays
              </h2>
            </div>
            {/* Transit Toggle */}
            <div className="px-3 pb-3 space-y-1">
              <div className="flex items-center gap-3 p-2 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[rgb(var(--text-primary))]">Transit</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))] truncate">
                    Bus & lightrail routes
                  </div>
                </div>
                <Switch
                  checked={isTransitActive}
                  onChange={() => onTransitToggle(!isTransitActive)}
                />
              </div>
              {/* Bike Infrastructure Toggle */}
              <div className="flex items-center gap-3 p-2 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[rgb(var(--text-primary))]">
                    Bike Infrastructure
                  </div>
                  <div className="text-xs text-[rgb(var(--text-secondary))] truncate">
                    Bike lanes, trails & greenways
                  </div>
                </div>
                <Switch checked={isBikeActive} onChange={() => onBikeToggle(!isBikeActive)} />
              </div>
            </div>
          </div>
          <div className="h-px bg-[rgb(var(--border-color))]" />

          {/* Legend */}
          <div className="p-4">
            <Legend layers={layers} activeLayers={activeLayers} />
          </div>
          <div className="h-px bg-[rgb(var(--border-color))]" />
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-[rgb(var(--border-color))] bg-[rgb(var(--secondary-bg))]">
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 text-xs">
              <Link
                href="/about"
                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                About
              </Link>
            </div>
            <p className="text-xs text-[rgb(var(--text-tertiary))]">Zoning data: Jan 2025</p>
          </div>
        </div>
      </div>
    </>
  );
}
