interface StatCardProps {
  label: string;
  value: string;
  /** Optional secondary text shown under the value */
  sublabel?: string;
  /** Tighter padding for mobile layouts */
  compact?: boolean;
}

/**
 * Rounded card showing a labeled stat. Shared across inspect panel sections
 * (zoning, parcel, park). Keep visual variants minimal — callers compose
 * the card into their own grids / sections.
 */
export function StatCard({ label, value, sublabel, compact = false }: StatCardProps) {
  return (
    <div className={`bg-secondary-bg rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
      <div className={`text-xs text-text-secondary ${compact ? '' : 'mb-1'}`}>{label}</div>
      <div className="text-sm font-semibold text-text-primary break-words text-pretty">{value}</div>
      {sublabel && <div className="text-xs text-text-tertiary mt-0.5">{sublabel}</div>}
    </div>
  );
}
