'use client';

import { useState } from 'react';
import type { LayerFilter, FilterOption } from '@/types';

interface LayerFilterAccordionProps {
  filters: LayerFilter[];
  values: Record<string, string[]>;
  onChange: (filterId: string, values: string[]) => void;
}

export function LayerFilterAccordion({ filters, values, onChange }: LayerFilterAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!filters || filters.length === 0) return null;

  return (
    <div className="ml-7 mt-1 mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors py-1"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        Filters
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-3">
          {filters.map((filter) => (
            <FilterControl
              key={filter.id}
              filter={filter}
              selectedValues={values[filter.id] || []}
              onChange={(newValues) => onChange(filter.id, newValues)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterControlProps {
  filter: LayerFilter;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function FilterControl({ filter, selectedValues, onChange }: FilterControlProps) {
  if (filter.type === 'multiselect' && filter.options) {
    return (
      <div>
        <div className="text-xs font-medium text-[rgb(var(--text-secondary))] mb-2">
          {filter.label}
        </div>
        <div className="space-y-1">
          {filter.options.map((option) => (
            <FilterCheckbox
              key={option.value}
              option={option}
              isSelected={selectedValues.includes(option.value)}
              onToggle={() => {
                const newValues = selectedValues.includes(option.value)
                  ? selectedValues.filter((v) => v !== option.value)
                  : [...selectedValues, option.value];
                onChange(newValues);
              }}
            />
          ))}
        </div>
        {selectedValues.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="mt-2 text-xs text-[rgb(var(--accent))] hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
    );
  }

  // Default: simple select (not multiselect)
  if (filter.type === 'select' && filter.options) {
    return (
      <div>
        <label className="text-xs font-medium text-[rgb(var(--text-secondary))] mb-1 block">
          {filter.label}
        </label>
        <select
          value={selectedValues[0] || ''}
          onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
          className="w-full text-sm bg-[rgb(var(--secondary-bg))] border border-[rgb(var(--border-color))] rounded px-2 py-1.5 text-[rgb(var(--text-primary))]"
        >
          <option value="">All</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}

interface FilterCheckboxProps {
  option: FilterOption;
  isSelected: boolean;
  onToggle: () => void;
}

function FilterCheckbox({ option, isSelected, onToggle }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-[rgb(var(--secondary-bg))] rounded transition-colors min-h-[44px] md:min-h-0">
      <div className="relative flex items-center justify-center">
        <input type="checkbox" checked={isSelected} onChange={onToggle} className="sr-only peer" />
        <div
          className={`
            w-4 h-4 rounded border-2 transition-colors flex items-center justify-center
            ${
              isSelected
                ? 'bg-[rgb(var(--accent))] border-[rgb(var(--accent))]'
                : 'bg-transparent border-[rgb(var(--border-color))]'
            }
          `}
        >
          {isSelected && (
            <svg
              className="w-2.5 h-2.5 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-[rgb(var(--text-primary))]">{option.label}</span>
    </label>
  );
}
