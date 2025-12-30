'use client';

import { BaseLayerSelector } from '@/components/controls/BaseLayerSelector';
import { LayerGroup } from '@/components/controls/LayerGroup';
import { Legend } from '@/components/controls/Legend';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { LayerConfig, LayerGroup as LayerGroupType } from '@/types';
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

interface ControlPanelProps {
  layers: LayerConfig[];
  layerGroups: LayerGroupType[];
  activeLayers: string[];
  onLayerToggle: (layerId: string) => void;
  onBaseLayerChange: (layerId: string | null) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ControlPanel({
  layers,
  layerGroups,
  activeLayers,
  onLayerToggle,
  onBaseLayerChange,
  isCollapsed,
  onToggleCollapse,
}: ControlPanelProps) {
  // Determine which base layer is active (if any)
  const activeBaseLayer = BASE_LAYER_IDS.find((id) => activeLayers.includes(id)) || null;

  // Filter out base layers from layer groups for overlay display
  const overlayLayerGroups = layerGroups
    .map((group) => ({
      ...group,
      layers: group.layers.filter((layer) => !BASE_LAYER_IDS.includes(layer.id)),
    }))
    .filter((group) => group.layers.length > 0);

  return (
    <>
      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className={`
          absolute top-20 z-20 p-2 
          bg-[rgb(var(--panel-bg))] 
          border border-[rgb(var(--border-color))]
          rounded-r-md shadow-md
          hover:bg-[rgb(var(--secondary-bg))]
          transition-all duration-300
          ${isCollapsed ? 'left-0' : 'left-80'}
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
              <p className="text-xs text-[rgb(var(--text-secondary))]">Seattle Zoning & Transit</p>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          {/* Base Layer Selector (Arc-style) */}
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
          <div className="p-4">
            <Legend layers={layers} activeLayers={activeLayers} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-[rgb(var(--border-color))] bg-[rgb(var(--secondary-bg))]">
          <div className="flex gap-4 text-xs">
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
    </>
  );
}
