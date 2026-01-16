'use client';

import type { ZoneInfo } from '@/lib/zoning-info';
import { getCategoryLabel } from '@/lib/zoning-info';
import { BuildingGraphic } from '@/components/ui';

interface ZoningSummaryProps {
  zoneInfo: ZoneInfo;
  /** Compact mode for mobile */
  compact?: boolean;
  landmark?: 'space-needle' | null;
}

export function ZoningSummary({ zoneInfo, compact = false, landmark = null }: ZoningSummaryProps) {
  return (
    <div
      className={`border-b border-[rgb(var(--border-color))] ${compact ? 'px-4 pt-3 pb-2' : 'p-4'}`}
    >
      {/* Building type graphic */}
      <BuildingGraphic
        category={zoneInfo.category}
        maxHeightFt={zoneInfo.maxHeightFt}
        code={zoneInfo.code}
        landmark={landmark}
        className={compact ? 'mb-3' : 'mb-4'}
      />

      {/* Quick stats grid */}
      <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
        <StatCard label="Max Height" value={zoneInfo.maxHeight} compact={compact} />
        {zoneInfo.aduAllowed > 0 ? (
          <StatCard
            label={compact ? 'ADUs' : 'ADUs Allowed'}
            value={compact ? `${zoneInfo.aduAllowed} allowed` : String(zoneInfo.aduAllowed)}
            compact={compact}
          />
        ) : (
          <StatCard
            label="Category"
            value={getCategoryLabel(zoneInfo.category)}
            compact={compact}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={`bg-[rgb(var(--secondary-bg))] rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
      <div className={`text-xs text-[rgb(var(--text-secondary))] ${compact ? '' : 'mb-1'}`}>
        {label}
      </div>
      <div className="text-sm font-semibold text-[rgb(var(--text-primary))]">{value}</div>
    </div>
  );
}
