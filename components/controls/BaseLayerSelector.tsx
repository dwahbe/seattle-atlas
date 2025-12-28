'use client';

import type { LayerConfig } from '@/types';

interface BaseLayerOption {
  id: string;
  label: string;
  description: string;
}

interface BaseLayerSelectorProps {
  options: BaseLayerOption[];
  activeBaseLayer: string | null;
  onSelect: (layerId: string | null) => void;
}

export function BaseLayerSelector({ options, activeBaseLayer, onSelect }: BaseLayerSelectorProps) {
  return (
    <div className="p-4 border-b border-[rgb(var(--border-color))]">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
        Base Layer
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isActive = activeBaseLayer === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(isActive ? null : option.id)}
              className={`
                relative p-3 rounded-lg text-left transition-all duration-150
                border-2
                ${
                  isActive
                    ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10'
                    : 'border-[rgb(var(--border-color))] bg-[rgb(var(--secondary-bg))] hover:border-[rgb(var(--text-secondary))]'
                }
              `}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[rgb(var(--accent))]" />
              )}
              <div className="font-medium text-sm text-[rgb(var(--text-primary))] mb-1">
                {option.label}
              </div>
              <div className="text-xs text-[rgb(var(--text-secondary))] leading-tight">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
