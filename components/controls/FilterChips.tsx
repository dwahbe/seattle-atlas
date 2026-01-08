'use client';

import type { LayerFilter } from '@/types';

interface FilterChipsProps {
  filters: LayerFilter[];
  values: Record<string, string[]>;
  onChange: (filterId: string, values: string[]) => void;
}

/** Group options by label, collecting all values for each unique label */
interface GroupedOption {
  label: string;
  values: string[];
}

function groupOptionsByLabel(options: { label: string; value: string }[]): GroupedOption[] {
  const groups = new Map<string, string[]>();
  const order: string[] = [];

  for (const opt of options) {
    if (!groups.has(opt.label)) {
      groups.set(opt.label, []);
      order.push(opt.label);
    }
    groups.get(opt.label)!.push(opt.value);
  }

  return order.map((label) => ({ label, values: groups.get(label)! }));
}

/**
 * Modern horizontal chip/pill filter UI.
 * Groups options by label - clicking a chip toggles ALL values for that label.
 */
export function FilterChips({ filters, values, onChange }: FilterChipsProps) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="space-y-3">
      {filters.map((filter) => {
        if (!filter.options) return null;

        const selectedValues = values[filter.id] || [];
        const hasSelection = selectedValues.length > 0;

        // Group options by label
        const groupedOptions = groupOptionsByLabel(filter.options);

        return (
          <div key={filter.id}>
            {/* Filter label - matches section header style */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]">
                {filter.label}
              </h2>
              <button
                onClick={() => onChange(filter.id, [])}
                className={`
                  text-xs transition-colors
                  ${
                    hasSelection
                      ? 'text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))]'
                      : 'text-transparent pointer-events-none'
                  }
                `}
                aria-hidden={!hasSelection}
                tabIndex={hasSelection ? 0 : -1}
              >
                Clear
              </button>
            </div>

            {/* Horizontal scrolling chips - one per unique label */}
            <div
              className="
                flex gap-2 overflow-x-auto pb-1
                scrollbar-none
                -mx-4 px-4
                md:mx-0 md:px-0 md:flex-wrap
              "
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {groupedOptions.map((group) => {
                // Check if ALL values for this group are selected
                const isSelected = group.values.every((v) => selectedValues.includes(v));

                return (
                  <button
                    key={group.label}
                    onClick={() => {
                      let newValues: string[];
                      if (isSelected) {
                        // Remove all values in this group
                        newValues = selectedValues.filter((v) => !group.values.includes(v));
                      } else {
                        // Add all values in this group
                        const toAdd = group.values.filter((v) => !selectedValues.includes(v));
                        newValues = [...selectedValues, ...toAdd];
                      }
                      onChange(filter.id, newValues);
                    }}
                    className={`
                      inline-flex items-center gap-1.5
                      px-2 py-1
                      text-xs font-medium
                      rounded-full
                      whitespace-nowrap
                      transition-colors duration-150
                      shrink-0
                      border
                      ${
                        isSelected
                          ? 'bg-[rgb(var(--accent))] text-white border-[rgb(var(--accent))]'
                          : 'bg-[rgb(var(--secondary-bg))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--secondary-hover))] hover:text-[rgb(var(--text-primary))] border-[rgb(var(--border-color))]'
                      }
                    `}
                  >
                    <span>{getShortLabel(group.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Shorten long labels for chips
 */
function getShortLabel(label: string): string {
  // Map long labels to shorter versions for the chips
  const shortLabels: Record<string, string> = {
    'Houses Only': 'Houses',
    'Small Apartments': 'Small Apts',
    'Taller Apartments': 'Tall Apts',
    'Mixed: Shops + Housing': 'Mixed-Use',
  };
  return shortLabels[label] || label;
}
