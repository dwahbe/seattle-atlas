'use client';

import { Drawer } from 'vaul';
import { useState, useCallback, useMemo } from 'react';
import { BaseLayerSelector } from '@/components/controls/BaseLayerSelector';
import { LayerGroup } from '@/components/controls/LayerGroup';
import { Legend } from '@/components/controls/Legend';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SearchBar } from '@/components/search/SearchBar';
import type {
  LayerConfig,
  LayerGroup as LayerGroupType,
  InspectedFeature,
  Proposal,
  SearchResult,
} from '@/types';
import Link from 'next/link';

// Base layer configuration
const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];
const BASE_LAYER_OPTIONS = [
  { id: 'zoning', label: 'Simplified', description: 'What can be built here' },
  { id: 'zoning_detailed', label: 'Technical', description: 'Official zoning codes' },
];

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
  // Inspect
  inspectedFeature: InspectedFeature | null;
  proposals: Proposal[];
  onCloseInspect: () => void;
  layerConfigs: LayerConfig[];
  // Search
  onSearchSelect: (result: SearchResult) => void;
}

export function MobileDrawer({
  layers,
  layerGroups,
  activeLayers,
  onLayerToggle,
  onBaseLayerChange,
  inspectedFeature,
  proposals,
  onCloseInspect,
  layerConfigs,
  onSearchSelect,
}: MobileDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINT_PEEK);

  // Determine which base layer is active
  const activeBaseLayer = BASE_LAYER_IDS.find((id) => activeLayers.includes(id)) || null;

  // Filter overlay layers (non-base layers)
  const overlayLayerGroups = useMemo(
    () =>
      layerGroups
        .map((group) => ({
          ...group,
          layers: group.layers.filter((layer) => !BASE_LAYER_IDS.includes(layer.id)),
        }))
        .filter((group) => group.layers.length > 0),
    [layerGroups]
  );

  // Get layer name for inspect
  const getLayerName = useCallback(
    (layerId: string) => layerConfigs.find((l) => l.id === layerId)?.name || layerId,
    [layerConfigs]
  );

  // Related proposals for inspected feature
  const relatedProposals = useMemo(
    () =>
      inspectedFeature ? proposals.filter((p) => p.layers.includes(inspectedFeature.layerId)) : [],
    [inspectedFeature, proposals]
  );

  // Format property values
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  // When a feature is inspected, expand the drawer
  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      onSearchSelect(result);
      setSnap(SNAP_POINT_PEEK); // Collapse after search
    },
    [onSearchSelect]
  );

  // Auto-expand when inspecting a feature
  const isInspecting = inspectedFeature !== null;

  return (
    <Drawer.Root
      open
      modal={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={isInspecting ? SNAP_POINT_HALF : snap}
      setActiveSnapPoint={setSnap}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl bg-[rgb(var(--panel-bg))] border-t border-[rgb(var(--border-color))] shadow-2xl"
          style={{
            height: `${SNAP_POINT_FULL * 100}%`,
            maxHeight: `${SNAP_POINT_FULL * 100}%`,
          }}
        >
          {/* Drag handle */}
          <div className="flex-none pt-3 pb-2 px-4">
            <div
              className="mx-auto w-12 h-1.5 rounded-full bg-[rgb(var(--text-tertiary))]"
              aria-hidden="true"
            />
          </div>

          {/* Header with search */}
          <div className="flex-none px-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <Link href="/" className="group">
                <h1 className="text-base font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
                  Civic Atlas
                </h1>
              </Link>
              <ThemeToggle />
            </div>
            <SearchBar onSelect={handleSearchSelect} placeholder="Search Seattle..." />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isInspecting ? (
              /* Inspect Mode */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Inspect Header */}
                <div className="px-4 pb-3 border-b border-[rgb(var(--border-color))] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--accent))]">
                      {getLayerName(inspectedFeature.layerId)}
                    </div>
                    <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                      Feature Details
                    </h2>
                  </div>
                  <button
                    onClick={onCloseInspect}
                    className="p-2 -mr-2 hover:bg-[rgb(var(--secondary-bg))] rounded-lg transition-colors"
                    aria-label="Close inspection"
                  >
                    <svg
                      className="w-5 h-5 text-[rgb(var(--text-secondary))]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Properties */}
                <div className="p-4 border-b border-[rgb(var(--border-color))]">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
                    Properties
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(inspectedFeature.properties)
                      .filter(([key]) => !key.startsWith('_') && key !== 'id')
                      .slice(0, 8)
                      .map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs text-[rgb(var(--text-secondary))] capitalize truncate">
                            {key.replace(/_/g, ' ')}
                          </dt>
                          <dd className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                            {formatValue(value)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>

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
                            <span
                              className={`
                                text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0
                                ${
                                  proposal.status === 'Adopted'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                    : proposal.status === 'Draft'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                      : proposal.status === 'Public Comment'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                }
                              `}
                            >
                              {proposal.status}
                            </span>
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
                {overlayLayerGroups.length > 0 && (
                  <div className="border-b border-[rgb(var(--border-color))]">
                    <div className="px-4 py-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
                        Overlays
                      </h2>
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
                )}

                {/* Legend */}
                <div className="p-4 border-b border-[rgb(var(--border-color))]">
                  <Legend layers={layers} activeLayers={activeLayers} />
                </div>

                {/* Footer links */}
                <div className="p-4">
                  <div className="flex gap-6 text-sm">
                    <Link
                      href="/methodology"
                      className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                      Methodology
                    </Link>
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
