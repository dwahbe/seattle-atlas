'use client';

import type { ZoneInfo } from '@/lib/zoning-info';
import { BuildingGraphic, InstitutionGraphic } from '@/components/ui';
import type { InstitutionInfo } from '@/lib/institutions';

interface ZoningSummaryProps {
  zoneInfo: ZoneInfo;
  /** Compact mode for mobile */
  compact?: boolean;
  landmark?: 'space-needle' | null;
  /** When the parcel falls inside a Major Institution Overlay polygon. */
  institution?: InstitutionInfo | null;
}

export function ZoningSummary({
  zoneInfo,
  compact = false,
  landmark = null,
  institution = null,
}: ZoningSummaryProps) {
  return (
    <div className={`border-b border-border ${compact ? 'px-4 py-3' : 'p-4'}`}>
      {institution ? (
        <InstitutionGraphic institution={institution} />
      ) : (
        <BuildingGraphic
          category={zoneInfo.category}
          maxHeightFt={zoneInfo.maxHeightFt}
          code={zoneInfo.code}
          landmark={landmark}
        />
      )}
    </div>
  );
}

interface AllowedUsesProps {
  zoneInfo: ZoneInfo;
  compact?: boolean;
}

export function AllowedUses({ zoneInfo, compact = false }: AllowedUsesProps) {
  if (zoneInfo.allowedUses.length === 0 && zoneInfo.notAllowedUses.length === 0) return null;

  return (
    <div className={`border-b border-border ${compact ? 'px-4 py-3' : 'p-4'}`}>
      {/* Allowed Uses */}
      {zoneInfo.allowedUses.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
            What Can Be Built
          </h3>
          <ul className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {zoneInfo.allowedUses.map((use) => (
              <li key={use} className="flex gap-1.5 text-text-primary">
                <span className="flex h-[1lh] items-center text-green-600 dark:text-green-400 shrink-0">
                  &#10003;
                </span>
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
            {zoneInfo.notAllowedUses.map((use) => (
              <li key={use} className="flex gap-1.5 text-text-secondary">
                <span className="flex h-[1lh] items-center text-red-500 dark:text-red-400 shrink-0">
                  &#10005;
                </span>
                {use}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
