'use client';

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
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary-bg transition-colors"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </h3>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
