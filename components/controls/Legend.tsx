'use client';

import { useState } from 'react';
import type { LayerConfig, LegendItem } from '@/types';
import { PARKS_LAYER_ID } from '@/lib/constants';
import { InfoTooltip } from '@/components/inspect/InfoTooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import parksStats from '@/data/parks-stats.json';

interface LegendProps {
  layers: LayerConfig[];
  activeLayers: string[];
  /** Callback when a legend item is clicked. Receives all underlying values for the deduplicated row. */
  onFilterToggle?: (layerId: string, values: string[]) => void;
  /** Called when the Clear button is pressed. Parent decides which filters to clear. */
  onClearFilters?: () => void;
  /** Currently active filter values, flattened per layer. */
  activeFilters?: Record<string, string[]>;
  /** Layer IDs whose rows render as clickable filters. Rows for other layers are display-only. */
  interactiveLayerIds?: string[];
}

// Parks overlay the underlying zoning (a park is still designated NR, MIO,
// etc.), so their 12.1% would double-count against the zoning totals. We
// surface the figure via a tooltip instead of showing it inline as a percentage.
const PARKS_TOOLTIP = `Parks overlay zoning — ${parksStats.percentageOfSeattle}% of Seattle (${parksStats.totalParks} parks).`;

export function Legend({
  layers,
  activeLayers,
  onFilterToggle,
  onClearFilters,
  activeFilters = {},
  interactiveLayerIds = [],
}: LegendProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  // Reactively detect touch devices (remains in sync if the user plugs/unplugs a pointer).
  const isTouch = useMediaQuery('(hover: none)');

  // Get active layers with legends. Parks rides along with the zoning toggle
  // (see MapContainer.handleBaseLayerChange) and flows through as a regular
  // legend item alongside the other base layers when it's active.
  const activeLayersWithLegends = layers
    .filter((layer) => activeLayers.includes(layer.id) && layer.legend.length > 0)
    .slice(0, 5); // Limit to avoid overcrowding

  if (activeLayersWithLegends.length === 0) {
    return null;
  }

  const hasAnyActiveFilters = Object.values(activeFilters).some((arr) => arr && arr.length > 0);
  const showClear = hasAnyActiveFilters && !!onClearFilters;

  // Group layers by their group property for seamless legends
  const groupedLayers = activeLayersWithLegends.reduce(
    (acc, layer) => {
      const group = layer.group || 'other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(layer);
      return acc;
    },
    {} as Record<string, LayerConfig[]>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pr-1.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Legend
        </h2>
        <button
          onClick={() => onClearFilters?.()}
          className={`
            touch-target-inline text-xs transition-colors
            ${
              showClear
                ? 'text-accent hover:text-accent-hover'
                : 'text-transparent pointer-events-none'
            }
          `}
          aria-hidden={!showClear}
          tabIndex={showClear ? 0 : -1}
        >
          Clear
        </button>
      </div>
      <div className="space-y-4">
        {Object.entries(groupedLayers).map(([group, groupLayers]) => (
          <div key={group}>
            <div className="grid grid-cols-1 gap-y-0.5">
              {groupLayers.flatMap((layer) => {
                const uniqueItems = deduplicateLegendItems(layer.legend);
                const layerFilters = activeFilters[layer.id] || [];
                const someFilterActiveOnLayer = layerFilters.length > 0;
                const isParks = layer.id === PARKS_LAYER_ID;
                const isInteractive =
                  !!onFilterToggle && !isParks && interactiveLayerIds.includes(layer.id);

                return uniqueItems.map((item) => {
                  const isFiltered = item.allValues.every((v) => layerFilters.includes(v));
                  const itemKey = `${layer.id}-${item.value}`;
                  const isHovered = hoveredItem === itemKey;
                  const isDimmed = isInteractive && someFilterActiveOnLayer && !isFiltered;

                  return (
                    <LegendRow
                      key={`${layer.id}-${item.label}`}
                      item={item}
                      layerType={layer.type}
                      isFiltered={isFiltered}
                      isHovered={isHovered}
                      isDimmed={isDimmed}
                      isTouch={isTouch}
                      onClick={() => onFilterToggle?.(layer.id, item.allValues)}
                      onMouseEnter={() => !isTouch && setHoveredItem(itemKey)}
                      onMouseLeave={() => !isTouch && setHoveredItem(null)}
                      isInteractive={isInteractive}
                      tooltip={isParks ? PARKS_TOOLTIP : undefined}
                    />
                  );
                });
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LegendRowProps {
  item: LegendItem;
  layerType: LayerConfig['type'];
  isFiltered: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  isTouch: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isInteractive: boolean;
  /** When set, renders an info icon in place of the percentage. */
  tooltip?: string;
}

function LegendRow({
  item,
  layerType,
  isFiltered,
  isHovered,
  isDimmed,
  isTouch,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isInteractive,
  tooltip,
}: LegendRowProps) {
  const baseClasses = `
    touch-target-inline flex items-center gap-2 py-1.5 pr-1.5 rounded transition-all
    ${isInteractive ? 'cursor-pointer' : ''}
    ${isHovered && !isFiltered ? 'bg-secondary-bg' : ''}
    ${isDimmed ? 'opacity-40 hover:opacity-100' : ''}
  `;

  const content = (
    <>
      <LegendSwatch type={layerType} color={item.color} />
      <span
        className={`text-xs flex-1 flex items-center gap-1 min-w-0 text-text-primary ${isFiltered ? 'font-medium' : ''}`}
      >
        <span className="truncate">{item.label}</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      {!tooltip && item.percentage !== undefined && (
        <span className="text-xs font-medium text-text-tertiary">
          {item.percentage.toFixed(1)}%
        </span>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        className={`${baseClasses} w-full text-left`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-pressed={isFiltered}
        title={
          isTouch ? `Tap to ${isFiltered ? 'show all' : `filter to ${item.label}`}` : undefined
        }
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

interface LegendSwatchProps {
  type: LayerConfig['type'];
  color: string;
}

function LegendSwatch({ type, color }: LegendSwatchProps) {
  switch (type) {
    case 'fill':
      return (
        <div
          className="w-4 h-4 rounded-sm border border-black/20"
          style={{ backgroundColor: color }}
        />
      );
    case 'line':
      return <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: color }} />;
    case 'circle':
      return (
        <div
          className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: color }}
        />
      );
    case 'symbol':
      return (
        <div className="w-4 h-4 flex items-center justify-center">
          <span className="text-xs" style={{ color }}>
            ●
          </span>
        </div>
      );
    default:
      return (
        <div
          className="w-4 h-4 rounded-sm border border-black/20"
          style={{ backgroundColor: color }}
        />
      );
  }
}

/** A legend item with all grouped values collected for filtering */
interface DeduplicatedLegendItem extends LegendItem {
  allValues: string[];
}

/**
 * Deduplicate legend items by label, aggregate percentages, and collect all values
 */
function deduplicateLegendItems(items: LegendItem[]): DeduplicatedLegendItem[] {
  return items.reduce((acc, item) => {
    const existing = acc.find((i) => i.label === item.label);
    if (existing) {
      // Aggregate percentage for items with same label
      if (item.percentage !== undefined) {
        existing.percentage = (existing.percentage || 0) + item.percentage;
      }
      existing.allValues.push(item.value);
    } else {
      acc.push({ ...item, allValues: [item.value] });
    }
    return acc;
  }, [] as DeduplicatedLegendItem[]);
}
