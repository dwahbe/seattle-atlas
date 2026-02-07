'use client';

import type { ParcelData } from '@/hooks/useInspectData';
import { Skeleton } from '@/components/ui';

interface ParcelInfoProps {
  parcelData: ParcelData | null;
  isLoading: boolean;
  /** Compact mode for mobile - 2 col grid */
  compact?: boolean;
  /** Headless mode - no wrapper/title, for use inside CollapsibleSection */
  headless?: boolean;
}

export function ParcelInfo({
  parcelData,
  isLoading,
  compact = false,
  headless = false,
}: ParcelInfoProps) {
  // Don't render if not loading and no data
  if (!isLoading && !parcelData) return null;

  const content = isLoading ? (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <Skeleton className="h-14 rounded-lg" />
    </div>
  ) : parcelData ? (
    <div className="space-y-2">
      {/* Top row: 2 cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Lot Size"
          value={parcelData.lotSqFt ? formatSqFt(parcelData.lotSqFt) : '—'}
          compact={compact}
        />
        <StatCard
          label="Present Use"
          value={formatPresentUse(parcelData.presentUse) || '—'}
          compact={compact}
        />
      </div>
      {/* Bottom row: Full-width assessor link */}
      <a
        href={parcelData.assessorUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between bg-secondary-bg hover:bg-secondary-hover rounded-lg p-3 transition-colors group"
      >
        <div>
          <div className="text-xs text-text-secondary">King County Assessor</div>
          <div className="text-sm font-semibold text-text-primary">
            View assessed value, sale history & more
          </div>
        </div>
        <svg
          className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  ) : null;

  if (headless) {
    return content;
  }

  return (
    <div className={`border-b border-border ${compact ? 'px-4 py-3' : 'p-4'}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
        Property Details
      </h3>
      {content}
    </div>
  );
}

function StatCard({
  label,
  value,
  link,
  compact = false,
}: {
  label: string;
  value: string;
  link?: string;
  compact?: boolean;
}) {
  return (
    <div className={`bg-secondary-bg rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
      <div className={`text-xs text-text-secondary ${compact ? '' : 'mb-1'}`}>
        {label}
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-accent hover:underline truncate block"
          title="View on King County Assessor"
        >
          {value} →
        </a>
      ) : (
        <div className="text-sm font-semibold text-text-primary break-words text-pretty">
          {value}
        </div>
      )}
    </div>
  );
}

/**
 * Format square footage with commas and "sq ft" suffix
 */
function formatSqFt(sqft: number): string {
  return `${sqft.toLocaleString()} sq ft`;
}

/**
 * Format present use - adds space before parentheses if missing
 */
function formatPresentUse(presentUse: string | null | undefined): string {
  if (!presentUse) return '';
  return presentUse.replace(/\//g, ' / ').replace(/\(/g, ' (').replace(/  +/g, ' ').trim();
}
