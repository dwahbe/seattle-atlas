'use client';

import { useState } from 'react';
import type { PermitData, PermitsData } from '@/types';
import { Skeleton } from '@/components/ui';
import { IconChevronDown, IconExternalLink, IconFileText } from '@tabler/icons-react';

interface PermitsSectionProps {
  permits: PermitsData | null;
  isLoading: boolean;
  /** Compact mode for mobile - denser cards, description shown only when expanded */
  compact?: boolean;
}

// Permit descriptions often arrive as ALL-CAPS jargon strings. Normalize
// them to sentence case while leaving mixed-case prose untouched.
function prettifyDescription(raw: string): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return cleaned;

  const letters = cleaned.match(/[A-Za-z]/g) ?? [];
  const upper = cleaned.match(/[A-Z]/g) ?? [];
  const isShouty = letters.length > 0 && upper.length / letters.length > 0.7;
  if (!isShouty) return cleaned;

  const lowered = cleaned.toLowerCase();
  // Capitalize the first letter of each sentence.
  return lowered.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
}

function PermitCard({ permit, compact }: { permit: PermitData; compact: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = permit.description ? prettifyDescription(permit.description) : '';

  return (
    <div className={`bg-secondary-bg rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-xs font-medium text-text-primary ${compact && !isExpanded ? 'line-clamp-1' : ''}`}
          >
            {permit.permit_type}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {permit.issue_date && (
              <span className="text-xs text-text-secondary">
                {new Date(permit.issue_date).toLocaleDateString('en-US', {
                  month: 'short',
                  year: compact ? '2-digit' : 'numeric',
                })}
              </span>
            )}
            <IconChevronDown
              className={`w-3.5 h-3.5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              stroke={2}
              aria-hidden="true"
            />
          </span>
        </div>
        {!compact && !isExpanded && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
            {description || permit.address}
          </p>
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-2">
          {description && <p className="text-xs text-text-secondary">{description}</p>}
          <p className="text-xs text-text-tertiary">
            {permit.address && <>{permit.address} · </>}
            {permit.status}
            {typeof permit.value === 'number' && permit.value > 0 && (
              <> · Est. ${permit.value.toLocaleString()}</>
            )}
          </p>
          <a
            href={permit.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            View Permit
            <IconExternalLink className="w-3.5 h-3.5" stroke={2} aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
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
    const shown = permits.permits.length;
    const hasMore = permits.total > shown;
    return (
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        <p className="text-xs text-text-secondary">
          {permits.total.toLocaleString()} permit{permits.total !== 1 ? 's' : ''}{' '}
          {compact ? 'nearby (2yr)' : 'in last 2 years within 300m'}
          {hasMore && (compact ? ` · ${shown} shown` : ` · showing ${shown} most recent`)}
        </p>
        {permits.permits.map((permit, index) => (
          <PermitCard key={`${permit.permit_number}-${index}`} permit={permit} compact={compact} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <IconFileText
        className="w-8 h-8 mx-auto mb-2 text-text-tertiary"
        stroke={1.5}
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-text-secondary">No recent permits nearby</p>
      <p className="text-xs text-text-tertiary mt-1">
        No building permits filed within 300m in the last 2 years
      </p>
    </div>
  );
}
