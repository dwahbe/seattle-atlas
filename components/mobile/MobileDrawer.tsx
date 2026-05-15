'use client';

import { Drawer } from 'vaul';
import { useState } from 'react';
import { Legend } from '@/components/controls/Legend';
import { BuildingGraphic, InstitutionGraphic, Switch, ThemeToggle } from '@/components/ui';
import { useInspectData } from '@/hooks/useInspectData';
import {
  InspectHeader,
  AllowedUses,
  WalkScoreSection,
  DevelopmentRules,
  ParcelInfo,
  ParkInfo,
  PermitsSection,
  ProposalsSection,
  TransitInfo,
  RawProperties,
  CollapsibleSection,
} from '@/components/inspect';
import type { LayerConfig, InspectedFeature, Proposal, FilterState } from '@/types';
import {
  BASE_LAYER_IDS,
  TRANSIT_LAYER_IDS,
  BIKE_LAYER_ID,
  ZONING_FILTER_IDS,
} from '@/lib/constants';
import Link from 'next/link';

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Calculate the max height for scrollable content based on current snap point
  // Header + drag handle is ~80px, subtract from visible drawer height
  const headerHeight = 80;
  const snapFraction = typeof snap === 'number' ? snap : SNAP_POINT_HALF;
  const scrollableMaxHeight = `calc(${snapFraction * 100}dvh - ${headerHeight}px - env(safe-area-inset-bottom))`;
  // At full height, let a downward pull from the top of the scroll area collapse the drawer.
  const isFullyExpanded = snap === SNAP_POINT_FULL;

  // Use shared data fetching hook
  const data = useInspectData(inspectedFeature, layerConfigs, proposals, clickPoint);

  // Determine which base layer is active
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

  // Auto-expand when inspecting a feature.
  // Uses the "setState during render" pattern from React docs:
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const isInspecting = inspectedFeature !== null;
  const [prevIsInspecting, setPrevIsInspecting] = useState(isInspecting);
  if (prevIsInspecting !== isInspecting) {
    setPrevIsInspecting(isInspecting);
    if (isInspecting) {
      // Transitioning to inspect mode — expand drawer to show content
      setSnap(SNAP_POINT_HALF);
    }
  }

  return (
    <Drawer.Root
      open
      modal={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      dismissible={false}
      scrollLockTimeout={0}
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl bg-panel-bg border-t border-border shadow-2xl h-full">
          <Drawer.Title className="sr-only">Seattle Atlas Controls</Drawer.Title>
          {/* Drag handle */}
          <div className="flex-none pt-3 pb-2 px-4">
            <div className="mx-auto w-12 h-1.5 rounded-full bg-text-tertiary" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="flex-none px-4 pb-3">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center min-h-[36px]">
                <h1 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                  Seattle Atlas
                </h1>
              </Link>
            </div>
          </div>

          {/* Scrollable content area - height calculated based on current snap point */}
          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: scrollableMaxHeight }}
            data-vaul-no-drag={isFullyExpanded ? undefined : ''}
            aria-live="polite"
          >
            {isInspecting && inspectedFeature ? (
              /* ============================================================
                 INSPECT MODE - Uses shared components with compact prop
                 ============================================================ */
              <div className="pb-[calc(2rem+env(safe-area-inset-bottom))]">
                {/* Header with back button */}
                <InspectHeader
                  zoneInfo={data.zoneInfo}
                  parkData={data.parkData}
                  layerName={data.layerName}
                  location={data.location}
                  isZoning={data.isZoning}
                  isPark={data.isPark}
                  onClose={onCloseInspect}
                  variant="mobile"
                  onBack={onCloseInspect}
                  searchedAddress={searchedAddress}
                  institution={inspectedFeature?.institution ?? null}
                  endAdornment={
                    inspectedFeature?.institution ? (
                      <InstitutionGraphic
                        variant="inline"
                        institution={inspectedFeature.institution}
                      />
                    ) : data.isZoning && data.zoneInfo ? (
                      <BuildingGraphic
                        variant="inline"
                        category={data.zoneInfo.category}
                        maxHeightFt={data.zoneInfo.maxHeightFt}
                        code={data.zoneInfo.code}
                        landmark={data.landmark}
                      />
                    ) : null
                  }
                />

                {/* Park Info - compact */}
                {data.isPark && data.parkData && <ParkInfo parkData={data.parkData} compact />}

                {/* Walk Score - compact */}
                {data.isZoning && (
                  <WalkScoreSection
                    walkScore={data.walkScore}
                    isLoading={data.isLoadingWalkScore}
                    compact
                  />
                )}

                {/* Allowed Uses - compact */}
                {data.isZoning && data.zoneInfo && <AllowedUses zoneInfo={data.zoneInfo} compact />}

                {/* Parcel Info - collapsible */}
                {data.isZoning && (data.isLoadingParcel || data.parcelData) && (
                  <CollapsibleSection
                    title="Property Details"
                    isExpanded={expandedSections.has('parcel')}
                    onToggle={() => toggleSection('parcel')}
                  >
                    <ParcelInfo
                      parcelData={data.parcelData}
                      isLoading={data.isLoadingParcel}
                      compact
                      headless
                    />
                  </CollapsibleSection>
                )}

                {/* Transit Info */}
                {data.isTransit && (
                  <div className="p-4 border-b border-border">
                    <TransitInfo feature={inspectedFeature} compact />
                  </div>
                )}

                {/* Development Rules - collapsible */}
                {data.isZoning && data.zoneInfo && (
                  <CollapsibleSection
                    title="Development Rules"
                    isExpanded={expandedSections.has('rules')}
                    onToggle={() => toggleSection('rules')}
                  >
                    <DevelopmentRules zoneInfo={data.zoneInfo} compact headless />
                  </CollapsibleSection>
                )}

                {/* Raw Properties - for non-zoning, non-park */}
                {!data.isZoning && !data.isPark && (
                  <div className="p-4 border-b border-border">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
                      Properties
                    </h3>
                    <RawProperties feature={inspectedFeature} compact />
                  </div>
                )}

                {/* Nearby Permits - collapsible */}
                {data.isZoning && (
                  <CollapsibleSection
                    title="Nearby Activity"
                    isExpanded={expandedSections.has('permits')}
                    onToggle={() => toggleSection('permits')}
                  >
                    <PermitsSection
                      permits={data.permits}
                      isLoading={data.isLoadingPermits}
                      compact
                    />
                  </CollapsibleSection>
                )}

                {/* Related Proposals - collapsible */}
                {data.relatedProposals.length > 0 && (
                  <CollapsibleSection
                    title="Related Proposals"
                    isExpanded={expandedSections.has('proposals')}
                    onToggle={() => toggleSection('proposals')}
                  >
                    <ProposalsSection proposals={data.relatedProposals} compact />
                  </CollapsibleSection>
                )}
              </div>
            ) : (
              /* ============================================================
                 CONTROLS MODE - Layer toggles and legend
                 ============================================================ */
              <div className="flex flex-col min-h-full">
                <div className="flex-1">
                  {/* Layers */}
                  <div className="p-4 border-b border-border">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
                      Layers
                    </h2>
                    <div className="space-y-1">
                      {/* Zoning Toggle */}
                      <div className="flex items-center gap-3 py-1 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-text-primary">Zoning</div>
                          <div className="text-xs text-text-secondary truncate">
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
                          <div className="font-medium text-sm text-text-primary">Transit</div>
                          <div className="text-xs text-text-secondary truncate">
                            Bus & Lightrail Routes
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
                          <div className="font-medium text-sm text-text-primary">
                            Bike Infrastructure
                          </div>
                          <div className="text-xs text-text-secondary truncate">
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

                  {/* Legend — interactive for whichever zoning layer is active. */}
                  <div className="border-b border-border">
                    <div className="p-4">
                      <Legend
                        layers={layers}
                        activeLayers={activeLayers}
                        activeFilters={legendActiveFilters}
                        interactiveLayerIds={
                          isZoningActive && activeBaseLayer ? [activeBaseLayer] : []
                        }
                        onFilterToggle={isZoningActive ? handleLegendToggle : undefined}
                        onClearFilters={isZoningActive ? handleClearLegendFilters : undefined}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with toggle */}
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-secondary-bg border-t border-border">
                  <div className="flex flex-col items-start gap-1.5">
                    {activeBaseLayer && (
                      <div className="flex w-full items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-text-secondary">Zoning View</span>
                        <ThemeToggle inline />
                      </div>
                    )}
                    {activeBaseLayer ? (
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
                    ) : (
                      <ThemeToggle inline />
                    )}
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
