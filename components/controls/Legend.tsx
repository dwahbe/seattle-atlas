'use client';

import { useState, useEffect } from 'react';
import type { LayerConfig, LegendItem } from '@/types';

interface LegendProps {
  layers: LayerConfig[];
  activeLayers: string[];
  /** Callback when legend item is clicked to filter */
  onFilterToggle?: (layerId: string, value: string) => void;
  /** Currently active filter values by layer */
  activeFilters?: Record<string, string[]>;
}

export function Legend({ layers, activeLayers, onFilterToggle, activeFilters = {} }: LegendProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  // Get active layers with legends
  const activeLayersWithLegends = layers
    .filter((layer) => activeLayers.includes(layer.id) && layer.legend.length > 0)
    .slice(0, 4); // Limit to avoid overcrowding

  if (activeLayersWithLegends.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-2">
        Legend
      </h2>
      <div className="space-y-4">
      {activeLayersWithLegends.map((layer) => {
        // Deduplicate legend items by label and aggregate percentages
        const uniqueItems = deduplicateLegendItems(layer.legend);
        const layerFilters = activeFilters[layer.id] || [];

        return (
          <div key={layer.id} className="space-y-2">
            <div className="grid grid-cols-1 gap-y-0.5">
              {uniqueItems.map((item) => {
                const isFiltered = layerFilters.includes(item.value);
                const itemKey = `${layer.id}-${item.value}`;
                const isHovered = hoveredItem === itemKey;

                return (
                  <LegendRow
                    key={item.label}
                    item={item}
                    layerType={layer.type}
                    isFiltered={isFiltered}
                    isHovered={isHovered}
                    isTouch={isTouch}
                    onClick={() => onFilterToggle?.(layer.id, item.value)}
                    onMouseEnter={() => !isTouch && setHoveredItem(itemKey)}
                    onMouseLeave={() => !isTouch && setHoveredItem(null)}
                    isInteractive={!!onFilterToggle}
                  />
                );
              })}
            </div>
            {/* Clear filter button */}
            {layerFilters.length > 0 && (
              <button
                onClick={() => {
                  // Clear all filters for this layer
                  layerFilters.forEach((value) => onFilterToggle?.(layer.id, value));
                }}
                className="text-xs text-[rgb(var(--accent))] hover:underline"
              >
                Show all
              </button>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

interface LegendRowProps {
  item: LegendItem;
  layerType: LayerConfig['type'];
  isFiltered: boolean;
  isHovered: boolean;
  isTouch: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isInteractive: boolean;
}

function LegendRow({
  item,
  layerType,
  isFiltered,
  isHovered,
  isTouch,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isInteractive,
}: LegendRowProps) {
  const baseClasses = `
    flex items-center gap-2 py-1 px-1.5 rounded transition-colors
    ${isInteractive ? 'cursor-pointer' : ''}
    ${isFiltered ? 'bg-[rgb(var(--accent))]/10 ring-1 ring-[rgb(var(--accent))]/30' : ''}
    ${isHovered && !isFiltered ? 'bg-[rgb(var(--secondary-bg))]' : ''}
  `;

  // Touch devices need larger targets
  const touchClasses = isTouch ? 'min-h-[44px]' : '';

  const content = (
    <>
      <LegendSwatch type={layerType} color={item.color} isActive={isFiltered || isHovered} />
      <span
        className={`text-xs flex-1 ${isFiltered ? 'text-[rgb(var(--accent))] font-medium' : 'text-[rgb(var(--text-primary))]'}`}
      >
        {item.label}
      </span>
      {item.percentage !== undefined && (
        <span
          className={`text-xs font-medium ${isFiltered ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--text-tertiary))]'}`}
        >
          {item.percentage.toFixed(1)}%
        </span>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        className={`${baseClasses} ${touchClasses} w-full text-left`}
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
  isActive?: boolean;
}

function LegendSwatch({ type, color, isActive = false }: LegendSwatchProps) {
  const ringClass = isActive ? 'ring-2 ring-[rgb(var(--accent))]/50' : '';

  switch (type) {
    case 'fill':
      return (
        <div
          className={`w-4 h-4 rounded-sm border border-black/20 transition-shadow ${ringClass}`}
          style={{ backgroundColor: color }}
        />
      );
    case 'line':
      return (
        <div
          className={`w-4 h-0.5 rounded-full transition-shadow ${ringClass}`}
          style={{ backgroundColor: color }}
        />
      );
    case 'circle':
      return (
        <div
          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-shadow ${ringClass}`}
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
          className={`w-4 h-4 rounded-sm border border-black/20 transition-shadow ${ringClass}`}
          style={{ backgroundColor: color }}
        />
      );
  }
}

/**
 * Deduplicate legend items by label and aggregate percentages
 */
function deduplicateLegendItems(items: LegendItem[]): LegendItem[] {
  return items.reduce((acc, item) => {
    const existing = acc.find((i) => i.label === item.label);
    if (existing) {
      // Aggregate percentage for items with same label
      if (item.percentage !== undefined) {
        existing.percentage = (existing.percentage || 0) + item.percentage;
      }
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as LegendItem[]);
}
