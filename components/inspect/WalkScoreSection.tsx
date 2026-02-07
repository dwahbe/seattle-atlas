'use client';

import type { WalkScoreData } from '@/types';
import { Donut, Skeleton } from '@/components/ui';

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
    <div className={`border-b border-border ${compact ? 'px-4 py-3' : 'p-4'}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
        Walk Score
      </h3>

      {isLoading ? (
        <div className="flex justify-around">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className={`rounded-full ${compact ? 'w-14 h-14' : 'w-16 h-16'}`} />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
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
            className="inline-block mt-3 text-xs text-text-tertiary hover:text-text-secondary"
          >
            Scores by Walk Score®
          </a>
        </div>
      ) : null}
    </div>
  );
}
