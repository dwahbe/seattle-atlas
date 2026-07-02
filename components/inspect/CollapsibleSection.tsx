'use client';

import { IconChevronDown } from '@tabler/icons-react';

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        // Inset ring, not the global outline — panel overflow clips an outline's side edges on full-width rows
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary-bg transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </h3>
        <IconChevronDown
          className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          stroke={2}
        />
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
