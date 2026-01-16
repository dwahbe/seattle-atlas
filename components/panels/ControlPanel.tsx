'use client';

import { FilterChips } from '@/components/controls/FilterChips';
import { Legend } from '@/components/controls/Legend';
import { PanelSearch } from '@/components/search';
import { Switch, ThemeToggle } from '@/components/ui';
import type { LayerConfig, FilterState, SearchResult } from '@/types';
import Link from 'next/link';

const DATA_FRESHNESS = 'Jan 2025';

// Define base layer options (mutually exclusive)
const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];

// Transit layers that should be combined into a single toggle
const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops', 'light_rail'];

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
  onSearchSelect: (result: SearchResult) => void;
}

export function ControlPanel({
  layers,
  activeLayers,
  filters,
  onBaseLayerChange,
  onTransitToggle,
  onBikeToggle,
  onFilterChange,
  onSearchSelect,
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
      {/* Panel */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-80 z-10
          bg-[rgb(var(--panel-bg))] 
          border-r border-[rgb(var(--border-color))]
          shadow-lg
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex-none p-4 border-b border-[rgb(var(--border-color))]">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/" className="group">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                  Seattle Atlas
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap border bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]">
                  Beta
                </span>
              </div>
            </Link>
          </div>
          {/* Search */}
          <PanelSearch onSelect={onSearchSelect} variant="desktop" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          {/* Layers */}
          <div className="px-4 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
              Layers
            </h2>
            <div className="space-y-1">
              {/* Zoning Toggle */}
              <div className="flex items-center gap-3 py-1 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[rgb(var(--text-primary))]">Zoning</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))] truncate">
                    What can be built
                  </div>
                </div>
                <Switch
                  checked={activeBaseLayer !== null}
                  onChange={() => onBaseLayerChange(activeBaseLayer ? null : 'zoning')}
                />
              </div>
              {/* Transit Toggle */}
              <div className="flex items-center gap-3 py-1 rounded-lg">
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
              <div className="flex items-center gap-3 py-1 rounded-lg">
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

          {/* Zoning Filters */}
          {activeBaseLayerConfig?.filters && activeBaseLayerConfig.filters.length > 0 && (
            <div className="px-4 py-4">
              <FilterChips
                filters={activeBaseLayerConfig.filters}
                values={(filters[activeBaseLayerConfig.id] as Record<string, string[]>) || {}}
                onChange={(filterId, values) =>
                  onFilterChange(activeBaseLayerConfig.id, filterId, values)
                }
              />
            </div>
          )}

          {/* Legend */}
          <div className="px-4 py-4 border-t border-[rgb(var(--border-color))]">
            <Legend layers={layers} activeLayers={activeLayers} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-[rgb(var(--border-color))] bg-[rgb(var(--secondary-bg))]">
          <div className="flex flex-col gap-3">
            {/* Zoning Mode Toggle - only show when zoning is enabled */}
            {activeBaseLayer && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">
                  Zoning View
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-full bg-[rgb(var(--secondary-hover))]">
                  <button
                    onClick={() => onBaseLayerChange('zoning')}
                    className={`
                      touch-target-inline px-2.5 py-1 text-xs font-medium rounded-full transition-all
                      ${
                        activeBaseLayer === 'zoning'
                          ? 'bg-[rgb(var(--panel-bg))] text-[rgb(var(--text-primary))] shadow-sm'
                          : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                      }
                    `}
                  >
                    Simplified
                  </button>
                  <button
                    onClick={() => onBaseLayerChange('zoning_detailed')}
                    className={`
                      touch-target-inline px-2.5 py-1 text-xs font-medium rounded-full transition-all
                      ${
                        activeBaseLayer === 'zoning_detailed'
                          ? 'bg-[rgb(var(--panel-bg))] text-[rgb(var(--text-primary))] shadow-sm'
                          : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                      }
                    `}
                  >
                    Technical
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <ThemeToggle />
              <p className="text-xs text-[rgb(var(--text-tertiary))]">Data: {DATA_FRESHNESS}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
