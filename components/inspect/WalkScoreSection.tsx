'use client';

import type { WalkScoreData } from '@/types';
import { Donut } from '@/components/ui';

interface WalkScoreSectionProps {
  walkScore: WalkScoreData | null;
  isLoading: boolean;
  /** Compact mode for mobile - smaller donuts */
  compact?: boolean;
}

export function WalkScoreSection({ walkScore, isLoading, compact = false }: WalkScoreSectionProps) {
  // Don't render if not loading and no data
  if (!isLoading && !walkScore) return null;

  const donutSize = compact ? 56 : 64;
  const strokeWidth = compact ? 5 : 6;

  return (
    <div className={`border-b border-[rgb(var(--border-color))] ${compact ? 'px-4 py-3' : 'p-4'}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))] mb-3">
        Walk Score
      </h3>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
          <LoadingSpinner />
          Loading scores...
        </div>
      ) : walkScore && !walkScore.error ? (
        <div>
          <div className="flex justify-around">
            {walkScore.walkscore !== null && (
              <Donut
                value={walkScore.walkscore}
                max={100}
                size={donutSize}
                strokeWidth={strokeWidth}
                label="Walk"
                title={`Walk Score: ${walkScore.walkscore}`}
              />
            )}
            {walkScore.transit_score !== null && (
              <Donut
                value={walkScore.transit_score}
                max={100}
                size={donutSize}
                strokeWidth={strokeWidth}
                label="Transit"
                title={`Transit Score: ${walkScore.transit_score}`}
              />
            )}
            {walkScore.bike_score !== null && (
              <Donut
                value={walkScore.bike_score}
                max={100}
                size={donutSize}
                strokeWidth={strokeWidth}
                label="Bike"
                title={`Bike Score: ${walkScore.bike_score}`}
              />
            )}
          </div>
          <a
            href={walkScore.more_info_link || 'https://www.walkscore.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
          >
            Scores by Walk Score®
          </a>
        </div>
      ) : null}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-4 h-4 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
  );
}
