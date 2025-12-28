'use client';

import type { LayerConfig } from '@/types';

interface LegendProps {
  layers: LayerConfig[];
  activeLayers: string[];
}

export function Legend({ layers, activeLayers }: LegendProps) {
  // Get active layers with legends
  const activeLayersWithLegends = layers
    .filter((layer) => activeLayers.includes(layer.id) && layer.legend.length > 0)
    .slice(0, 4); // Limit to avoid overcrowding

  if (activeLayersWithLegends.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
        Legend
      </h3>
      {activeLayersWithLegends.map((layer) => {
        // Deduplicate legend items by label and aggregate percentages
        const uniqueItems = layer.legend.reduce(
          (acc, item) => {
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
          },
          [] as typeof layer.legend
        );

        return (
          <div key={layer.id} className="space-y-2">
            <div className="grid grid-cols-1 gap-y-1.5">
              {uniqueItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <LegendSwatch type={layer.type} color={item.color} />
                  <span className="text-xs text-[rgb(var(--text-secondary))] flex-1">
                    {item.label}
                  </span>
                  {item.percentage !== undefined && (
                    <span className="text-xs font-medium text-[rgb(var(--text-tertiary))]">
                      {item.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
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
