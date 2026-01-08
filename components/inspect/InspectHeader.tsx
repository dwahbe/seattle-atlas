'use client';

import type { ZoneInfo } from '@/lib/zoning-info';
import type { LocationData } from '@/hooks/useInspectData';

interface InspectHeaderProps {
  zoneInfo: ZoneInfo | null;
  layerName: string;
  location: LocationData | null;
  isZoning: boolean;
  onClose: () => void;
  /** Mobile variant shows back button instead of close */
  variant?: 'desktop' | 'mobile';
  /** Callback for back button in mobile variant */
  onBack?: () => void;
  /** Exact address from search - displayed instead of reverse-geocoded location */
  searchedAddress?: string | null;
}

export function InspectHeader({
  zoneInfo,
  layerName,
  location,
  isZoning,
  onClose,
  variant = 'desktop',
  onBack,
  searchedAddress,
}: InspectHeaderProps) {
  const title = isZoning && zoneInfo ? zoneInfo.name : layerName;

  // Prioritize searched address (exact), fall back to reverse-geocoded location (approximate)
  const subtitle = isZoning
    ? searchedAddress
      ? searchedAddress
      : location
        ? `Near ${location.address}`
        : 'Loading...'
    : 'Feature Details';

  const hasLocation = isZoning && (searchedAddress || location);

  if (variant === 'mobile') {
    return (
      <div>
        {/* Back button */}
        <div className="px-4 pb-2">
          <button
            onClick={onBack || onClose}
            className="flex items-center gap-1 text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors -ml-1 py-1"
            aria-label="Back to layers"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Layers
          </button>
        </div>

        {/* Title */}
        <div className="px-4 pb-3 border-b border-[rgb(var(--border-color))]">
          <div className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
            {title}
          </div>
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-1.5">
            {hasLocation && <LocationIcon />}
            {subtitle}
          </h2>
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="flex-none flex items-center justify-between p-4 border-b border-[rgb(var(--border-color))]">
      <div className="min-w-0 flex-1 mr-2">
        <div className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
          {title}
        </div>
        <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mt-1 truncate flex items-center gap-1.5">
          {hasLocation && <LocationIcon />}
          <span className="truncate">{subtitle}</span>
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-[rgb(var(--secondary-bg))] rounded-md transition-colors"
        aria-label="Close panel"
      >
        <svg
          className="w-5 h-5 text-[rgb(var(--text-secondary))]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0 text-[rgb(var(--text-secondary))]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
