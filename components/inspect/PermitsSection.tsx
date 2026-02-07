'use client';

import type { PermitsData } from '@/types';
import { Skeleton } from '@/components/ui';

interface PermitsSectionProps {
  permits: PermitsData | null;
  isLoading: boolean;
  /** Compact mode for mobile - fewer permits shown */
  compact?: boolean;
}

export function PermitsSection({ permits, isLoading, compact = false }: PermitsSectionProps) {
  if (isLoading) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <Skeleton className="h-3 w-40" />
        <Skeleton className={`rounded-lg ${compact ? 'h-10' : 'h-16'}`} />
        <Skeleton className={`rounded-lg ${compact ? 'h-10' : 'h-16'}`} />
      </div>
    );
  }

  if (permits && permits.permits.length > 0) {
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p className="text-xs text-text-secondary">
          {permits.total} permit{permits.total !== 1 ? 's' : ''}{' '}
          {compact ? 'nearby (2yr)' : 'in last 2 years within 300m'}
        </p>
        {permits.permits.map((permit) => (
          <div
            key={permit.permit_number}
            className={`bg-secondary-bg rounded-lg ${compact ? 'p-2' : 'p-3'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-xs font-medium text-text-primary ${compact ? 'line-clamp-1' : ''}`}
              >
                {permit.permit_type}
              </span>
              {permit.issue_date && (
                <span className="text-xs text-text-secondary shrink-0">
                  {new Date(permit.issue_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: compact ? '2-digit' : 'numeric',
                  })}
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                {permit.description || permit.address}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <svg
        className="w-8 h-8 mx-auto mb-2 text-text-tertiary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm font-medium text-text-secondary">
        No recent permits nearby
      </p>
      <p className="text-xs text-text-tertiary mt-1">
        No building permits filed within 300m in the last 2 years
      </p>
    </div>
  );
}
