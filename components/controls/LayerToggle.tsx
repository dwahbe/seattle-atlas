'use client';

import type { LayerConfig } from '@/types';

interface LayerToggleProps {
  layer: LayerConfig;
  isActive: boolean;
  onToggle: () => void;
}

export function LayerToggle({ layer, isActive, onToggle }: LayerToggleProps) {
  return (
    <label className="flex items-start gap-3 py-2 px-1 cursor-pointer hover:bg-[rgb(var(--secondary-bg))] rounded transition-colors group">
      <div className="relative flex items-center justify-center mt-0.5">
        <input type="checkbox" checked={isActive} onChange={onToggle} className="sr-only peer" />
        <div
          className={`
            w-4 h-4 rounded border-2 transition-colors
            ${
              isActive
                ? 'bg-[rgb(var(--accent))] border-[rgb(var(--accent))]'
                : 'bg-transparent border-[rgb(var(--border-color))] group-hover:border-[rgb(var(--text-secondary))]'
            }
          `}
        >
          {isActive && (
            <svg
              className="w-3 h-3 text-white absolute top-0.5 left-0.5"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[rgb(var(--text-primary))]">{layer.name}</div>
        {layer.description && (
          <div className="text-xs text-[rgb(var(--text-secondary))] mt-0.5 line-clamp-2">
            {layer.description}
          </div>
        )}
        <div className="text-xs text-[rgb(var(--text-tertiary))] mt-1">Source: {layer.source}</div>
      </div>
    </label>
  );
}
