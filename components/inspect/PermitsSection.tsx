'use client';

import type { PermitsData } from '@/types';

interface PermitsSectionProps {
  permits: PermitsData | null;
  isLoading: boolean;
  /** Compact mode for mobile - fewer permits shown */
  compact?: boolean;
}

export function PermitsSection({ permits, isLoading, compact = false }: PermitsSectionProps) {
  const maxPermits = compact ? 4 : 10;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
        <LoadingSpinner />
        {compact ? 'Loading...' : 'Loading permits...'}
      </div>
    );
  }

  if (permits && permits.permits.length > 0) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p className="text-xs text-[rgb(var(--text-secondary))]">
          {permits.total} permit{permits.total !== 1 ? 's' : ''}{' '}
          {compact ? 'nearby (2yr)' : 'in last 2 years within 300m'}
        </p>
        {permits.permits.slice(0, maxPermits).map((permit) => (
          <div
            key={permit.permit_number}
            className={`bg-[rgb(var(--secondary-bg))] rounded-lg ${compact ? 'p-2' : 'p-3'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-xs font-medium text-[rgb(var(--text-primary))] ${compact ? 'line-clamp-1' : ''}`}
              >
                {permit.permit_type}
              </span>
              {permit.issue_date && (
                <span className="text-xs text-[rgb(var(--text-secondary))] shrink-0">
                  {new Date(permit.issue_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: compact ? '2-digit' : 'numeric',
                  })}
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 line-clamp-2">
                {permit.description || permit.address}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm text-[rgb(var(--text-secondary))]">No recent permits found nearby</p>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
  );
}
