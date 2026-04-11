'use client';

import type { ParkData } from '@/hooks/useInspectData';
import { StatCard } from '@/components/ui';
import { formatAcres } from '@/lib/format';

interface ParkInfoProps {
  parkData: ParkData;
  /** Compact mode for mobile - tighter spacing */
  compact?: boolean;
}

export function ParkInfo({ parkData, compact = false }: ParkInfoProps) {
  return (
    <div className={`border-b border-border ${compact ? 'px-4 py-3' : 'p-4'}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
        Park Details
      </h3>
      <div className="space-y-2">
        <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
          <StatCard
            label="Size"
            value={formatAcres(parkData.areaAcres)}
            sublabel={formatSqFt(parkData.areaSqFt)}
            compact={compact}
          />
          <StatCard label="Type" value={parkData.type} compact={compact} />
        </div>
        <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
          <StatCard
            label="Acquired"
            value={parkData.acquiredYear ? String(parkData.acquiredYear) : '—'}
            compact={compact}
          />
          <StatCard label="Owner" value={parkData.owner} compact={compact} />
        </div>
        {parkData.address && (
          <StatCard label="Address" value={parkData.address} compact={compact} />
        )}
      </div>
    </div>
  );
}

/** Format square footage for the park size sublabel. */
function formatSqFt(sqFt: number): string {
  if (sqFt >= 1_000_000) return `${(sqFt / 1_000_000).toFixed(1)}M sq ft`;
  if (sqFt >= 10_000) return `${Math.round(sqFt).toLocaleString()} sq ft`;
  return `${sqFt.toLocaleString()} sq ft`;
}
