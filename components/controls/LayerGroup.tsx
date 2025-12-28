'use client';

import { useState } from 'react';
import { LayerToggle } from './LayerToggle';
import type { LayerConfig } from '@/types';

interface LayerGroupProps {
  name: string;
  layers: LayerConfig[];
  activeLayers: string[];
  onLayerToggle: (layerId: string) => void;
  defaultExpanded?: boolean;
}

export function LayerGroup({
  name,
  layers,
  activeLayers,
  onLayerToggle,
  defaultExpanded = true,
}: LayerGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const activeCount = layers.filter((l) => activeLayers.includes(l.id)).length;

  return (
    <div className="border-b border-[rgb(var(--border-color))] last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-[rgb(var(--secondary-bg))] transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-[rgb(var(--text-secondary))] transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="font-semibold text-sm text-[rgb(var(--text-primary))]">{name}</span>
        </div>
        <span className="text-xs text-[rgb(var(--text-secondary))] bg-[rgb(var(--secondary-bg))] px-2 py-0.5 rounded-full">
          {activeCount}/{layers.length}
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          {layers.map((layer) => (
            <LayerToggle
              key={layer.id}
              layer={layer}
              isActive={activeLayers.includes(layer.id)}
              onToggle={() => onLayerToggle(layer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
