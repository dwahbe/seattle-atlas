'use client';

import { useState } from 'react';
import type { ZoneInfo } from '@/lib/zoning-info';
import { getCategoryLabel } from '@/lib/zoning-info';
import { BuildingGraphic, StatCard } from '@/components/ui';

interface ZoningSummaryProps {
  zoneInfo: ZoneInfo;
  /** Compact mode for mobile */
  compact?: boolean;
  landmark?: 'space-needle' | null;
}

export function ZoningSummary({ zoneInfo, compact = false, landmark = null }: ZoningSummaryProps) {
  return (
    <div className={`border-b border-border ${compact ? 'px-4 pt-3 pb-2' : 'p-4'}`}>
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

/** Max items shown before "and N more" in compact mode */
const COMPACT_LIMIT = 3;

interface AllowedUsesProps {
  zoneInfo: ZoneInfo;
  compact?: boolean;
}

export function AllowedUses({ zoneInfo, compact = false }: AllowedUsesProps) {
  const [expanded, setExpanded] = useState(false);

  if (zoneInfo.allowedUses.length === 0 && zoneInfo.notAllowedUses.length === 0) return null;

  const showAll = !compact || expanded;
  const allowed = showAll ? zoneInfo.allowedUses : zoneInfo.allowedUses.slice(0, COMPACT_LIMIT);
  const notAllowed = showAll
    ? zoneInfo.notAllowedUses
    : zoneInfo.notAllowedUses.slice(0, COMPACT_LIMIT);
  const hiddenCount =
    compact && !expanded
      ? Math.max(
          0,
          zoneInfo.allowedUses.length -
            COMPACT_LIMIT +
            zoneInfo.notAllowedUses.length -
            COMPACT_LIMIT
        )
      : 0;

  return (
    <div className={`border-b border-border ${compact ? 'px-4 pt-2 pb-3' : 'p-4'}`}>
      {/* Allowed Uses */}
      {zoneInfo.allowedUses.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
            What Can Be Built
          </h3>
          <ul className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {allowed.map((use) => (
              <li key={use} className="flex items-start gap-1.5 text-text-primary">
                <span className="text-green-600 dark:text-green-400 shrink-0 mt-0.5">&#10003;</span>
                {use}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Not Allowed */}
      {zoneInfo.notAllowedUses.length > 0 && (
        <div className={compact ? 'mt-2' : 'mt-3'}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
            Not Allowed
          </h3>
          <ul className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {notAllowed.map((use) => (
              <li key={use} className="flex items-start gap-1.5 text-text-secondary">
                <span className="text-red-500 dark:text-red-400 shrink-0 mt-0.5">&#10005;</span>
                {use}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expand toggle for compact mode */}
      {hiddenCount > 0 && (
        <button onClick={() => setExpanded(true)} className="text-xs text-accent mt-2">
          and {hiddenCount} more&hellip;
        </button>
      )}
    </div>
  );
}
