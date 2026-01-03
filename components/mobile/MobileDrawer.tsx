'use client';

import { Drawer } from 'vaul';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { BaseLayerSelector } from '@/components/controls/BaseLayerSelector';
import { LayerGroup } from '@/components/controls/LayerGroup';
import { Legend } from '@/components/controls/Legend';
import { BuildingGraphic, Donut, Switch, ThemeToggle } from '@/components/ui';
import { getZoneInfo, getCategoryLabel, type ZoneInfo } from '@/lib/zoning-info';
import { getDisplayProperties, isZoningLayer, isTransitLayer } from '@/lib/property-display';
import { getRepresentativePoint } from '@/lib/spatial';
import { reverseGeocode } from '@/lib/mapbox';
import type {
  LayerConfig,
  LayerGroup as LayerGroupType,
  InspectedFeature,
  Proposal,
  WalkScoreData,
  PermitsData,
} from '@/types';
import Link from 'next/link';

// Base layer configuration
const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];
const BASE_LAYER_OPTIONS = [
  { id: 'zoning', label: 'Simplified', description: 'What can be built here' },
  { id: 'zoning_detailed', label: 'Technical', description: 'Official zoning codes' },
];

// Transit layers combined into single toggle
const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops'];

// Snap points for the drawer (peek, half, full)
const SNAP_POINT_PEEK = 0.15;
const SNAP_POINT_HALF = 0.5;
const SNAP_POINT_FULL = 0.92;
const SNAP_POINTS: (number | string)[] = [SNAP_POINT_PEEK, SNAP_POINT_HALF, SNAP_POINT_FULL];

interface MobileDrawerProps {
  // Layer controls
  layers: LayerConfig[];
  layerGroups: LayerGroupType[];
  activeLayers: string[];
  onLayerToggle: (layerId: string) => void;
  onBaseLayerChange: (layerId: string | null) => void;
  onTransitToggle: (enabled: boolean) => void;
  // Inspect
  inspectedFeature: InspectedFeature | null;
  proposals: Proposal[];
  onCloseInspect: () => void;
  layerConfigs: LayerConfig[];
}

export function MobileDrawer({
  layers,
  layerGroups,
  activeLayers,
  onLayerToggle,
  onBaseLayerChange,
  onTransitToggle,
  inspectedFeature,
  proposals,
  onCloseInspect,
  layerConfigs,
}: MobileDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINT_HALF);
  const [walkScore, setWalkScore] = useState<WalkScoreData | null>(null);
  const [permits, setPermits] = useState<PermitsData | null>(null);
  const [location, setLocation] = useState<{ address: string; neighborhood?: string } | null>(null);
  const [isLoadingWalkScore, setIsLoadingWalkScore] = useState(false);
  const [isLoadingPermits, setIsLoadingPermits] = useState(false);

  // Determine which base layer is active
  const activeBaseLayer = BASE_LAYER_IDS.find((id) => activeLayers.includes(id)) || null;

  // Check if transit is enabled (any transit layer active)
  const isTransitActive = TRANSIT_LAYER_IDS.some((id) => activeLayers.includes(id));

  // Filter overlay layers (non-base layers, non-transit layers)
  const overlayLayerGroups = useMemo(
    () =>
      layerGroups
        .map((group) => ({
          ...group,
          layers: group.layers.filter(
            (layer) => !BASE_LAYER_IDS.includes(layer.id) && !TRANSIT_LAYER_IDS.includes(layer.id)
          ),
        }))
        .filter((group) => group.layers.length > 0),
    [layerGroups]
  );

  // Get layer name for inspect
  const getLayerName = useCallback(
    (layerId: string) => layerConfigs.find((l) => l.id === layerId)?.name || layerId,
    [layerConfigs]
  );

  // Get zone info if this is a zoning layer
  const zoneInfo = useMemo<ZoneInfo | null>(() => {
    if (!inspectedFeature || !isZoningLayer(inspectedFeature.layerId)) return null;
    const zoneCode = inspectedFeature.properties.ZONELUT as string;
    return getZoneInfo(zoneCode);
  }, [inspectedFeature]);

  // Get representative point for API calls
  const featurePoint = useMemo<[number, number] | null>(() => {
    if (!inspectedFeature?.geometry) return null;
    return getRepresentativePoint(inspectedFeature.geometry);
  }, [inspectedFeature?.geometry]);

  // Related proposals for inspected feature
  const relatedProposals = useMemo(
    () =>
      inspectedFeature ? proposals.filter((p) => p.layers.includes(inspectedFeature.layerId)) : [],
    [inspectedFeature, proposals]
  );

  // Fetch Walk Score when feature changes
  useEffect(() => {
    if (!featurePoint || !isZoningLayer(inspectedFeature?.layerId || '')) {
      setWalkScore(null);
      return;
    }

    const [lng, lat] = featurePoint;
    setIsLoadingWalkScore(true);

    fetch(`/api/walkscore?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => setWalkScore(data))
      .catch(() => setWalkScore(null))
      .finally(() => setIsLoadingWalkScore(false));
  }, [featurePoint, inspectedFeature?.layerId]);

  // Fetch permits when feature changes
  useEffect(() => {
    if (!featurePoint || !isZoningLayer(inspectedFeature?.layerId || '')) {
      setPermits(null);
      return;
    }

    const [lng, lat] = featurePoint;
    setIsLoadingPermits(true);

    fetch(`/api/permits?lat=${lat}&lng=${lng}&radius=300&limit=3`)
      .then((res) => res.json())
      .then((data) => setPermits(data))
      .catch(() => setPermits(null))
      .finally(() => setIsLoadingPermits(false));
  }, [featurePoint, inspectedFeature?.layerId]);

  // Fetch location (reverse geocode) when feature changes
  useEffect(() => {
    if (!featurePoint || !isZoningLayer(inspectedFeature?.layerId || '')) {
      setLocation(null);
      return;
    }

    const [lng, lat] = featurePoint;
    reverseGeocode(lng, lat)
      .then((result) => setLocation(result))
      .catch(() => setLocation(null));
  }, [featurePoint, inspectedFeature?.layerId]);

  // Auto-expand when inspecting a feature
  const isInspecting = inspectedFeature !== null;

  // When starting to inspect, expand to half. When closing, keep at half.
  useEffect(() => {
    if (isInspecting) {
      setSnap(SNAP_POINT_HALF);
    }
  }, [isInspecting]);
  const isZoning = inspectedFeature ? isZoningLayer(inspectedFeature.layerId) : false;
  const isTransit = inspectedFeature ? isTransitLayer(inspectedFeature.layerId) : false;

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
                <h1 className="text-base font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                  Seattle Atlas
                </h1>
              </Link>
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isInspecting && inspectedFeature ? (
              /* Inspect Mode */
              <div>
                {/* Back button */}
                <div className="px-4 pb-2">
                  <button
                    onClick={onCloseInspect}
                    className="flex items-center gap-1 text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors -ml-1 py-1"
                    aria-label="Back to layers"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Layers
                  </button>
                </div>

                {/* Inspect Header */}
                <div className="px-4 pb-3 border-b border-[rgb(var(--border-color))]">
                  <div className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
                    {isZoning && zoneInfo ? zoneInfo.name : getLayerName(inspectedFeature.layerId)}
                  </div>
                  <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-1.5">
                    {isZoning && location && (
                      <svg
                        className="w-4 h-4 shrink-0 text-[rgb(var(--text-secondary))]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    )}
                    {isZoning && location ? `Near ${location.address}` : 'Feature Details'}
                  </h2>
                </div>

                {/* Zoning Summary */}
                {isZoning && zoneInfo && (
                  <div className="px-4 pt-3 pb-2 border-b border-[rgb(var(--border-color))]">
                    {/* Building type graphic */}
                    <BuildingGraphic
                      category={zoneInfo.category}
                      maxHeightFt={zoneInfo.maxHeightFt}
                      code={zoneInfo.code}
                      className="mb-3"
                    />

                    {/* Quick stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[rgb(var(--secondary-bg))] rounded-lg p-2">
                        <div className="text-xs text-[rgb(var(--text-secondary))]">Max Height</div>
                        <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                          {zoneInfo.maxHeight}
                        </div>
                      </div>
                      {zoneInfo.aduAllowed > 0 ? (
                        <div className="bg-[rgb(var(--secondary-bg))] rounded-lg p-2">
                          <div className="text-xs text-[rgb(var(--text-secondary))]">ADUs</div>
                          <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                            {zoneInfo.aduAllowed} allowed
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[rgb(var(--secondary-bg))] rounded-lg p-2">
                          <div className="text-xs text-[rgb(var(--text-secondary))]">Category</div>
                          <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                            {getCategoryLabel(zoneInfo.category)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Walk Score */}
                {(isLoadingWalkScore || walkScore) && (
                  <div className="px-4 py-3 border-b border-[rgb(var(--border-color))]">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
                      Walk Score
                    </h3>
                    {isLoadingWalkScore ? (
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                        <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                        Loading scores...
                      </div>
                    ) : walkScore && !walkScore.error ? (
                      <div>
                        <div className="flex justify-around">
                          {walkScore.walkscore !== null && (
                            <Donut
                              value={walkScore.walkscore}
                              max={100}
                              size={56}
                              strokeWidth={5}
                              label="Walk"
                              title={`Walk Score: ${walkScore.walkscore}`}
                            />
                          )}
                          {walkScore.transit_score !== null && (
                            <Donut
                              value={walkScore.transit_score}
                              max={100}
                              size={56}
                              strokeWidth={5}
                              label="Transit"
                              title={`Transit Score: ${walkScore.transit_score}`}
                            />
                          )}
                          {walkScore.bike_score !== null && (
                            <Donut
                              value={walkScore.bike_score}
                              max={100}
                              size={56}
                              strokeWidth={5}
                              label="Bike"
                              title={`Bike Score: ${walkScore.bike_score}`}
                            />
                          )}
                        </div>
                        <a
                          href={walkScore.more_info_link || 'https://www.walkscore.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
                        >
                          Scores by Walk Score®
                        </a>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Transit Info */}
                {isTransit && (
                  <div className="p-4 border-b border-[rgb(var(--border-color))]">
                    <TransitInfo feature={inspectedFeature} />
                  </div>
                )}

                {/* Development Rules (Zoning only) */}
                {isZoning && zoneInfo && (
                  <div className="px-4 pt-2 pb-3 border-b border-[rgb(var(--border-color))]">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-2">
                      Development Rules
                    </h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-[rgb(var(--text-secondary))] flex items-center gap-1">
                          Zone Code
                          <InfoTooltip text="Official zoning designation from Seattle Municipal Code." />
                        </dt>
                        <dd className="font-medium text-[rgb(var(--text-primary))]">
                          {zoneInfo.code}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[rgb(var(--text-secondary))] flex items-center gap-1">
                          Lot Coverage
                          <InfoTooltip text="Max % of lot that can be covered by buildings." />
                        </dt>
                        <dd className="font-medium text-[rgb(var(--text-primary))]">
                          {zoneInfo.lotCoverage}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[rgb(var(--text-secondary))] flex items-center gap-1">
                          FAR
                          <InfoTooltip text="Floor Area Ratio: total floor area ÷ lot size. FAR 1.0 = floor area equal to lot." />
                        </dt>
                        <dd className="font-medium text-[rgb(var(--text-primary))]">
                          {zoneInfo.far}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[rgb(var(--text-secondary))]">Code</dt>
                        <dd>
                          <a
                            href={zoneInfo.smcLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[rgb(var(--accent))] font-medium"
                          >
                            SMC {zoneInfo.smcSection} →
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Raw Properties (non-zoning) */}
                {!isZoning && (
                  <div className="p-4 border-b border-[rgb(var(--border-color))]">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
                      Properties
                    </h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {getDisplayProperties(inspectedFeature.layerId, inspectedFeature.properties)
                        .slice(0, 8)
                        .map(({ key, label, value }) => (
                          <div key={key}>
                            <dt className="text-xs text-[rgb(var(--text-secondary))] truncate">
                              {label}
                            </dt>
                            <dd className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                              {value}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                )}

                {/* Nearby Permits */}
                {isZoning && (
                  <div className="px-4 pt-2 pb-3 border-b border-[rgb(var(--border-color))]">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-2">
                      Nearby Activity
                    </h3>
                    {isLoadingPermits ? (
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                        <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : permits && permits.permits.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                          {permits.total} permit{permits.total !== 1 ? 's' : ''} nearby (2yr)
                        </p>
                        {permits.permits.slice(0, 2).map((permit) => (
                          <div
                            key={permit.permit_number}
                            className="p-2 bg-[rgb(var(--secondary-bg))] rounded-lg"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-medium text-[rgb(var(--text-primary))] line-clamp-1">
                                {permit.permit_type}
                              </span>
                              {permit.issue_date && (
                                <span className="text-xs text-[rgb(var(--text-secondary))] shrink-0">
                                  {new Date(permit.issue_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[rgb(var(--text-secondary))]">
                        No recent permits nearby
                      </p>
                    )}
                  </div>
                )}

                {/* Related Proposals */}
                {relatedProposals.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
                      Related Proposals
                    </h3>
                    <div className="space-y-2">
                      {relatedProposals.slice(0, 3).map((proposal) => (
                        <div
                          key={proposal.id}
                          className="p-3 bg-[rgb(var(--secondary-bg))] rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-1">
                              {proposal.name}
                            </h4>
                            <StatusBadge status={proposal.status} />
                          </div>
                          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 line-clamp-2">
                            {proposal.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Controls Mode */
              <div>
                {/* Base Layer Selector */}
                <BaseLayerSelector
                  options={BASE_LAYER_OPTIONS}
                  activeBaseLayer={activeBaseLayer}
                  onSelect={onBaseLayerChange}
                />

                {/* Overlay Layers */}
                <div className="border-b border-[rgb(var(--border-color))]">
                  <div className="px-4 py-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
                      Overlays
                    </h2>
                  </div>
                  {/* Transit Toggle */}
                  <div className="px-3 pb-3">
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
                  </div>
                  {overlayLayerGroups.map((group) => (
                    <LayerGroup
                      key={group.id}
                      name={group.name}
                      layers={group.layers}
                      activeLayers={activeLayers}
                      onLayerToggle={onLayerToggle}
                      defaultExpanded={true}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="border-b border-[rgb(var(--border-color))]">
                  <div className="p-4">
                    <Legend layers={layers} activeLayers={activeLayers} />
                  </div>
                </div>

                {/* Footer links */}
                <div className="p-4">
                  <div className="flex gap-6 text-sm">
                    <Link
                      href="/about"
                      className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                      About
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safe area padding for iOS */}
          <div className="flex-none h-[env(safe-area-inset-bottom)]" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatusBadge({ status }: { status: Proposal['status'] }) {
  const colors: Record<string, string> = {
    Adopted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Public Comment': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Under Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
    >
      {status}
    </span>
  );
}

function TransitInfo({ feature }: { feature: InspectedFeature }) {
  const props = feature.properties;

  if (feature.layerId === 'transit_stops') {
    return (
      <div>
        <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-1">
          {String(props.stop_name || 'Transit Stop')}
        </h3>
        {props.routes != null && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Routes: {String(props.routes)}
          </p>
        )}
      </div>
    );
  }

  if (feature.layerId === 'transit_routes') {
    return (
      <div>
        <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-1">
          Route {String(props.route_short_name || props.route_id || '')}
        </h3>
        {props.route_long_name != null && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            {String(props.route_long_name)}
          </p>
        )}
      </div>
    );
  }

  return null;
}

function InfoTooltip({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center justify-center">
      <button
        type="button"
        className="touch-target-inline relative w-5 h-5 flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        {/* Expanded touch area */}
        <span className="absolute inset-[-8px]" aria-hidden="true" />
        {/* Visual indicator */}
        <span className="w-3.5 h-3.5 rounded-full bg-[rgb(var(--text-tertiary))] text-[rgb(var(--panel-bg))] text-[10px] font-medium flex items-center justify-center pointer-events-none">
          ?
        </span>
      </button>
      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-40 p-2 text-xs text-[rgb(var(--text-primary))] bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] rounded-lg shadow-lg z-50">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[rgb(var(--border-color))]" />
        </div>
      )}
    </span>
  );
}
