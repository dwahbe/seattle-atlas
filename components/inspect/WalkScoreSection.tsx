'use client';

import type { WalkScoreData } from '@/types';
import { Donut, Skeleton } from '@/components/ui';

interface WalkScoreSectionProps {
  walkScore: WalkScoreData | null;
  isLoading: boolean;
}

export function WalkScoreSection({ walkScore, isLoading }: WalkScoreSectionProps) {
  // Don't render if not loading and no data
  if (!isLoading && !walkScore) return null;

  const donutSize = 60;
  const strokeWidth = 6;

  const attributionHref =
    walkScore && !walkScore.error
      ? walkScore.more_info_link || 'https://www.walkscore.com'
      : 'https://www.walkscore.com';

  return (
    <div className="border-b border-border px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-2 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Car-Free Scores
        </h3>
        <a
          href={attributionHref}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target-inline text-xs leading-4 text-text-tertiary hover:text-text-secondary"
        >
          Scores by Walk Score®
        </a>
      </div>

      {isLoading ? (
        <div className="flex justify-around">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="rounded-full size-15" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      ) : walkScore && !walkScore.error ? (
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
      ) : null}
    </div>
  );
}
