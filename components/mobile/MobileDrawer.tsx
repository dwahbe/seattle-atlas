'use client';

import { Drawer } from 'vaul';
import { useState, useEffect, useRef } from 'react';
import { FilterChips } from '@/components/controls/FilterChips';
import { Legend } from '@/components/controls/Legend';
import { Switch, ThemeToggle } from '@/components/ui';
import { useInspectData } from '@/hooks/useInspectData';
import {
  InspectHeader,
  ZoningSummary,
  WalkScoreSection,
  DevelopmentRules,
  ParcelInfo,
  PermitsSection,
  ProposalsSection,
  TransitInfo,
  RawProperties,
} from '@/components/inspect';
import type { LayerConfig, InspectedFeature, Proposal, FilterState } from '@/types';
import Link from 'next/link';

// Base layer configuration
const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];

// Transit layers combined into single toggle
const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops', 'light_rail'];

// Bike infrastructure layer
const BIKE_LAYER_ID = 'bike_facilities';

// Snap points for the drawer (peek, half, full)
const SNAP_POINT_PEEK = 0.15;
const SNAP_POINT_HALF = 0.5;
const SNAP_POINT_FULL = 0.92;
const SNAP_POINTS: (number | string)[] = [SNAP_POINT_PEEK, SNAP_POINT_HALF, SNAP_POINT_FULL];

interface MobileDrawerProps {
  // Layer controls
  layers: LayerConfig[];
  activeLayers: string[];
  filters: FilterState;
  onBaseLayerChange: (layerId: string | null) => void;
  onTransitToggle: (enabled: boolean) => void;
  onBikeToggle: (enabled: boolean) => void;
  onFilterChange: (layerId: string, filterId: string, values: string[]) => void;
  // Inspect
  inspectedFeature: InspectedFeature | null;
  proposals: Proposal[];
  onCloseInspect: () => void;
  layerConfigs: LayerConfig[];
  /** Exact address from search - displayed instead of reverse-geocoded location */
  searchedAddress?: string | null;
  /** Click point for more accurate reverse geocoding */
  clickPoint?: [number, number] | null;
}

export function MobileDrawer({
  layers,
  activeLayers,
  filters,
  onBaseLayerChange,
  onTransitToggle,
  onBikeToggle,
  onFilterChange,
  inspectedFeature,
  proposals,
  onCloseInspect,
  layerConfigs,
  searchedAddress,
  clickPoint,
}: MobileDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINT_HALF);

  // Use shared data fetching hook
  const data = useInspectData(inspectedFeature, layerConfigs, proposals, clickPoint);

  // Determine which base layer is active
  const activeBaseLayer = BASE_LAYER_IDS.find((id) => activeLayers.includes(id)) || null;

  // Check if transit is enabled (any transit layer active)
  const isTransitActive = TRANSIT_LAYER_IDS.some((id) => activeLayers.includes(id));

  // Check if bike layer is enabled
  const isBikeActive = activeLayers.includes(BIKE_LAYER_ID);

  // Get base layers for filter display
  const baseLayers = layers.filter((l) => BASE_LAYER_IDS.includes(l.id));
  const activeBaseLayerConfig = baseLayers.find((l) => l.id === activeBaseLayer);

  // Auto-expand when inspecting a feature
  const isInspecting = inspectedFeature !== null;
  const wasInspecting = useRef(false);

  // When starting to inspect, expand drawer to show content
  useEffect(() => {
    if (isInspecting && !wasInspecting.current) {
      // Transitioning to inspect mode - expand drawer
      setSnap(SNAP_POINT_HALF);
    }
    wasInspecting.current = isInspecting;
  }, [isInspecting]);

  return (
    <Drawer.Root
      open
      modal={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl bg-[rgb(var(--panel-bg))] border-t border-[rgb(var(--border-color))] shadow-2xl h-full">
          <Drawer.Title className="sr-only">Seattle Atlas Controls</Drawer.Title>
          {/* Drag handle */}
          <div className="flex-none pt-3 pb-2 px-4">
            <div
              className="mx-auto w-12 h-1.5 rounded-full bg-[rgb(var(--text-tertiary))]"
              aria-hidden="true"
            />
          </div>

          {/* Header */}
          <div className="flex-none px-4 pb-2">
            <div className="flex items-center justify-between">
              <Link href="/" className="group flex items-center min-h-[36px]">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                    Seattle Atlas
                  </h1>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap border bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]">
                    Beta
                  </span>
                </div>
              </Link>
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isInspecting && inspectedFeature ? (
              /* ============================================================
                 INSPECT MODE - Uses shared components with compact prop
                 ============================================================ */
              <div className="pb-[calc(2rem+env(safe-area-inset-bottom))]">
                {/* Header with back button */}
                <InspectHeader
                  zoneInfo={data.zoneInfo}
                  layerName={data.layerName}
                  location={data.location}
                  isZoning={data.isZoning}
                  onClose={onCloseInspect}
                  variant="mobile"
                  onBack={onCloseInspect}
                  searchedAddress={searchedAddress}
                />

                {/* Zoning Summary - compact */}
                {data.isZoning && data.zoneInfo && (
                  <ZoningSummary zoneInfo={data.zoneInfo} compact />
                )}

                {/* Walk Score - compact */}
                {data.isZoning && (
                  <WalkScoreSection
                    walkScore={data.walkScore}
                    isLoading={data.isLoadingWalkScore}
                    compact
                  />
                )}

                {/* Parcel Info - compact */}
                {data.isZoning && (
                  <ParcelInfo
                    parcelData={data.parcelData}
                    isLoading={data.isLoadingParcel}
                    compact
                  />
                )}

                {/* Transit Info */}
                {data.isTransit && (
                  <div className="p-4 border-b border-[rgb(var(--border-color))]">
                    <TransitInfo feature={inspectedFeature} compact />
                  </div>
                )}

                {/* Development Rules - compact (not collapsible on mobile) */}
                {data.isZoning && data.zoneInfo && (
                  <DevelopmentRules zoneInfo={data.zoneInfo} compact />
                )}

                {/* Raw Properties - for non-zoning */}
                {!data.isZoning && (
                  <div className="p-4 border-b border-[rgb(var(--border-color))]">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
                      Properties
                    </h3>
                    <RawProperties feature={inspectedFeature} compact />
                  </div>
                )}

                {/* Nearby Permits - compact */}
                {data.isZoning && (
                  <div className="px-4 pt-2 pb-3 border-b border-[rgb(var(--border-color))]">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-2">
                      Nearby Activity
                    </h3>
                    <PermitsSection
                      permits={data.permits}
                      isLoading={data.isLoadingPermits}
                      compact
                    />
                  </div>
                )}

                {/* Related Proposals - compact */}
                {data.relatedProposals.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
                      Related Proposals
                    </h3>
                    <ProposalsSection proposals={data.relatedProposals} compact />
                  </div>
                )}
              </div>
            ) : (
              /* ============================================================
                 CONTROLS MODE - Layer toggles and legend
                 ============================================================ */
              <div className="flex flex-col min-h-full">
                <div className="flex-1">
                  {/* Layers */}
                  <div className="border-b border-[rgb(var(--border-color))]">
                    <div className="px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
                        Layers
                      </h2>
                    </div>
                    <div className="px-3 pb-3 space-y-1">
                      {/* Zoning Toggle */}
                      <div className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[rgb(var(--text-primary))]">
                            Zoning
                          </div>
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
                      <div className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[rgb(var(--text-primary))]">
                            Transit
                          </div>
                          <div className="text-xs text-[rgb(var(--text-secondary))] truncate">
                            Bus & Lightrail Routes
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
                        <Switch
                          checked={isBikeActive}
                          onChange={() => onBikeToggle(!isBikeActive)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filters for active base layer */}
                  {activeBaseLayerConfig?.filters && activeBaseLayerConfig.filters.length > 0 && (
                    <div className="p-4 border-b border-[rgb(var(--border-color))]">
                      <FilterChips
                        filters={activeBaseLayerConfig.filters}
                        values={
                          (filters[activeBaseLayerConfig.id] as Record<string, string[]>) || {}
                        }
                        onChange={(filterId, values) =>
                          onFilterChange(activeBaseLayerConfig.id, filterId, values)
                        }
                      />
                    </div>
                  )}

                  {/* Legend */}
                  <div className="border-b border-[rgb(var(--border-color))]">
                    <div className="p-4">
                      <Legend layers={layers} activeLayers={activeLayers} />
                    </div>
                  </div>
                </div>

                {/* Footer with toggle */}
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-[rgb(var(--secondary-bg))] border-t border-[rgb(var(--border-color))]">
                  <div className="flex flex-col gap-3">
                    {/* Zoning Mode Toggle - only show when zoning is enabled */}
                    {activeBaseLayer && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">
                          Zoning View
                        </span>
                        <div className="flex items-center gap-1 p-0.5 rounded-full bg-[rgb(var(--panel-bg))]">
                          <button
                            onClick={() => onBaseLayerChange('zoning')}
                            className={`
                              px-2.5 py-1 text-xs font-medium rounded-full transition-all
                              ${
                                activeBaseLayer === 'zoning'
                                  ? 'bg-[rgb(var(--secondary-hover))] text-[rgb(var(--text-primary))] shadow-sm'
                                  : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                              }
                            `}
                          >
                            Simplified
                          </button>
                          <button
                            onClick={() => onBaseLayerChange('zoning_detailed')}
                            className={`
                              px-2.5 py-1 text-xs font-medium rounded-full transition-all
                              ${
                                activeBaseLayer === 'zoning_detailed'
                                  ? 'bg-[rgb(var(--secondary-hover))] text-[rgb(var(--text-primary))] shadow-sm'
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
                      <Link
                        href="/about"
                        className="text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                      >
                        About
                      </Link>
                      <span className="text-xs text-[rgb(var(--text-tertiary))]">
                        Data: Jan 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
