'use client';

import { Legend } from '@/components/controls/Legend';
import { PanelSearch } from '@/components/search';
import { Switch, ThemeToggle } from '@/components/ui';
import type { LayerConfig, FilterState, SearchResult } from '@/types';
import {
  BASE_LAYER_IDS,
  TRANSIT_LAYER_IDS,
  BIKE_LAYER_ID,
  DATA_FRESHNESS,
  ZONING_FILTER_IDS,
} from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/seattle-zoning', label: 'Zoning Guide' },
];

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
  const pathname = usePathname();

  // Determine which base layer is active (if any)
  const activeBaseLayer = BASE_LAYER_IDS.find((id) => activeLayers.includes(id)) || null;

  // Check if transit is enabled (any transit layer active)
  const isTransitActive = TRANSIT_LAYER_IDS.some((id) => activeLayers.includes(id));

  // Check if bike layer is enabled
  const isBikeActive = activeLayers.includes(BIKE_LAYER_ID);

  // Flatten FilterState into the per-layer value-list shape the Legend expects.
  const legendActiveFilters: Record<string, string[]> = {};
  for (const [layerId, layerFilters] of Object.entries(filters)) {
    if (!layerFilters) continue;
    const values: string[] = [];
    for (const v of Object.values(layerFilters)) {
      if (Array.isArray(v)) values.push(...(v as string[]));
    }
    legendActiveFilters[layerId] = values;
  }

  // Toggle a deduplicated legend row's underlying values in the active zoning layer's filter.
  // If all values are already present, remove them; otherwise add the missing ones.
  const handleLegendToggle = (layerId: string, values: string[]) => {
    const filterId = ZONING_FILTER_IDS[layerId];
    if (!filterId) return;
    const current = (filters[layerId]?.[filterId] as string[] | undefined) || [];
    const allSelected = values.every((v) => current.includes(v));
    const next = allSelected
      ? current.filter((v) => !values.includes(v))
      : [...current, ...values.filter((v) => !current.includes(v))];
    onFilterChange(layerId, filterId, next);
  };

  const handleClearLegendFilters = () => {
    if (!activeBaseLayer) return;
    const filterId = ZONING_FILTER_IDS[activeBaseLayer];
    if (!filterId) return;
    onFilterChange(activeBaseLayer, filterId, []);
  };

  const isZoningActive = activeBaseLayer !== null && activeBaseLayer in ZONING_FILTER_IDS;

  return (
    <>
      {/* Panel */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-80 z-10
          bg-panel-bg
          shadow-lg
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex-none p-4 border-b border-border">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <Link href="/" className="group">
              <h1 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                Seattle Atlas
              </h1>
            </Link>
            <nav className="flex items-baseline gap-3 text-xs">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`transition-colors ${
                      isActive
                        ? 'text-accent font-medium'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          {/* Search */}
          <div data-tour="search">
            <PanelSearch onSelect={onSearchSelect} variant="desktop" />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          {/* Layers */}
          <div className="px-4 py-4" data-tour="layers">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
              Layers
            </h2>
            <div className="space-y-1">
              {/* Zoning Toggle */}
              <div className="flex items-center gap-3 py-1 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-text-primary">Zoning</div>
                  <div className="text-xs text-text-secondary truncate">What Can Be Built</div>
                </div>
                <Switch
                  checked={activeBaseLayer !== null}
                  onChange={() => onBaseLayerChange(activeBaseLayer ? null : 'zoning')}
                />
              </div>
              {/* Transit Toggle */}
              <div className="flex items-center gap-3 py-1 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-text-primary">Transit</div>
                  <div className="text-xs text-text-secondary truncate">
                    Bus & Light Rail Routes
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
                  <div className="font-medium text-sm text-text-primary">Bike Infrastructure</div>
                  <div className="text-xs text-text-secondary truncate">
                    Bike Lanes, Trails & Greenways
                  </div>
                </div>
                <Switch checked={isBikeActive} onChange={() => onBikeToggle(!isBikeActive)} />
              </div>
            </div>
          </div>

          {/* Legend — interactive for whichever zoning layer is active. */}
          <div className="pl-4 pr-6 py-4 -mr-2 border-t border-border">
            <Legend
              layers={layers}
              activeLayers={activeLayers}
              activeFilters={legendActiveFilters}
              interactiveLayerIds={isZoningActive && activeBaseLayer ? [activeBaseLayer] : []}
              onFilterToggle={isZoningActive ? handleLegendToggle : undefined}
              onClearFilters={isZoningActive ? handleClearLegendFilters : undefined}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-border bg-secondary-bg">
          <div className="flex flex-col gap-3">
            {/* Zoning Mode Toggle - only show when zoning is enabled */}
            {activeBaseLayer && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">Zoning View</span>
                <div className="flex items-center gap-1 p-0.5 rounded-full bg-secondary-hover">
                  <button
                    onClick={() => onBaseLayerChange('zoning')}
                    className={`
                      touch-target-inline px-2.5 py-1 text-xs font-medium rounded-full transition-all
                      ${
                        activeBaseLayer === 'zoning'
                          ? 'bg-panel-bg text-text-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
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
                          ? 'bg-panel-bg text-text-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
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
              <p className="text-xs text-text-tertiary">Data: {DATA_FRESHNESS}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
