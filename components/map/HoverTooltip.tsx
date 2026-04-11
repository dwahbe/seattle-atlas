'use client';

import type { ReactNode } from 'react';
import type { LayerConfig } from '@/types';
import { isParkLayer } from '@/lib/property-display';
import { formatAcres } from '@/lib/format';

interface HoverTooltipProps {
  x: number;
  y: number;
  properties: Record<string, unknown>;
  layerConfig: LayerConfig | null;
}

// Try common property names for neighborhood
function getNeighborhood(properties: Record<string, unknown>): string | null {
  const neighborhoodKeys = [
    'NEIGHBORHOOD',
    'neighborhood',
    'URBAN_VILLAGE',
    'urban_village',
    'UVILLAGE',
    'COMMUNITY',
    'community',
  ];

  for (const key of neighborhoodKeys) {
    const value = properties[key];
    if (value && typeof value === 'string') {
      return value;
    }
  }
  return null;
}

export function HoverTooltip({ x, y, properties, layerConfig }: HoverTooltipProps) {
  if (!layerConfig) return null;

  // Parks layer uses cleaned fields and a single-color fill — the legend-based
  // flow below doesn't apply, so render a dedicated body.
  if (isParkLayer(layerConfig.id)) {
    const name = typeof properties.name === 'string' ? properties.name : 'Park';
    const type = typeof properties.type === 'string' ? properties.type : 'Park';
    const areaAcres =
      typeof properties.areaAcres === 'number' && properties.areaAcres > 0
        ? properties.areaAcres
        : null;

    const subtitle = areaAcres != null ? `${type} · ${formatAcres(areaAcres)}` : type;

    return (
      <TooltipShell x={x} y={y}>
        <div className="font-medium text-gray-900 dark:text-gray-100">{name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</div>
      </TooltipShell>
    );
  }

  // Default path: legend-based display (zoning, etc.)
  const colorProperty = layerConfig.colorProperty;
  if (!colorProperty) return null;

  const value = properties[colorProperty] as string;
  if (!value) return null;

  // Find the legend item that matches this value
  const legendItem = layerConfig.legend.find((item) => item.value === value);

  // For simplified view, use the legend label
  // For technical view, show the code and full name
  const isSimplified = layerConfig.id === 'zoning';
  const displayLabel = legendItem?.label || value;

  // Get neighborhood if available
  const neighborhood = getNeighborhood(properties);

  return (
    <TooltipShell x={x} y={y}>
      {neighborhood && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{neighborhood}</div>
      )}
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {isSimplified ? displayLabel : value}
      </div>
      {!isSimplified && legendItem && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {legendItem.label.replace(`${value} - `, '')}
        </div>
      )}
    </TooltipShell>
  );
}

/**
 * Shared positioned wrapper + arrow for every tooltip variant. Keeps the
 * shell/arrow styling in one place so the parks and zoning branches can
 * focus on their own content.
 */
function TooltipShell({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-full"
      style={{
        left: x,
        top: y - 12,
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm whitespace-nowrap">
        {children}
      </div>
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-gray-900" />
    </div>
  );
}
