'use client';

import type { ZoneInfo } from '@/lib/zoning-info';
import type { LocationData, ParkData } from '@/hooks/useInspectData';
import { TreeIcon } from '@/components/ui';
import type { InstitutionInfo } from '@/lib/institutions';
import { SharePopover } from './SharePopover';
import { IconChevronLeft, IconMapPin, IconX } from '@tabler/icons-react';

interface InspectHeaderProps {
  zoneInfo: ZoneInfo | null;
  parkData: ParkData | null;
  layerName: string;
  location: LocationData | null;
  isZoning: boolean;
  isPark: boolean;
  onClose: () => void;
  /** Mobile variant shows back button instead of close */
  variant?: 'desktop' | 'mobile';
  /** Callback for back button in mobile variant */
  onBack?: () => void;
  /** Exact address from search - displayed instead of reverse-geocoded location */
  searchedAddress?: string | null;
  /** When the parcel falls inside a Major Institution Overlay polygon. */
  institution?: InstitutionInfo | null;
  /** Optional node rendered to the right of the address (mobile only). */
  endAdornment?: React.ReactNode;
  /** Shareable URL (path or absolute). Renders a share menu on desktop when provided. */
  shareUrl?: string;
}

export function InspectHeader({
  zoneInfo,
  parkData,
  layerName,
  location,
  isZoning,
  isPark,
  onClose,
  variant = 'desktop',
  onBack,
  searchedAddress,
  institution = null,
  endAdornment,
  shareUrl,
}: InspectHeaderProps) {
  // Title is the category/eyebrow text, subtitle is the main headline.
  const title =
    isPark && parkData
      ? parkData.type
      : institution
        ? institution.name
        : isZoning && zoneInfo
          ? zoneInfo.name
          : layerName;

  // Prioritize searched address (exact), fall back to reverse-geocoded location.
  // Drop the "Near" qualifier when Mapbox returns a precise street address —
  // only neighborhood-level fallbacks need the hedge.
  const subtitle =
    isPark && parkData
      ? parkData.name
      : isZoning
        ? searchedAddress
          ? searchedAddress
          : location
            ? location.isPrecise
              ? location.address
              : `Near ${location.address}`
            : 'Loading...'
        : 'Feature Details';

  // `hasLocation` implies `isZoning`, which is mutually exclusive with `isPark`
  // (a feature has exactly one layerId), so no `!isPark` guard is needed when
  // rendering the location icon.
  const hasLocation = isZoning && (searchedAddress || location);

  if (variant === 'mobile') {
    return (
      <div>
        {/* Back button */}
        <div className="px-4 pb-2">
          <button
            onClick={onBack || onClose}
            className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors -ml-1 py-1"
            aria-label="Back to Layers"
          >
            <IconChevronLeft size={16} stroke={2} aria-hidden="true" />
            Layers
          </button>
        </div>

        {/* Title */}
        <div className="px-4 pb-3 border-b border-border">
          <div className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {title}
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-1.5 min-w-0">
              {isPark && (
                <TreeIcon className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />
              )}
              {hasLocation && <LocationIcon />}
              <span className="truncate">{subtitle}</span>
            </h2>
            {endAdornment}
          </div>
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="flex-none flex items-start justify-between p-4 border-b border-border">
      <div className="min-w-0 flex-1 mr-2">
        <div className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          {title}
        </div>
        <h2 className="text-lg font-semibold text-text-primary mt-1 truncate flex items-center gap-1.5">
          {isPark && <TreeIcon className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />}
          {hasLocation && <LocationIcon />}
          <span className="truncate">{subtitle}</span>
        </h2>
      </div>
      <div className="flex items-center gap-1 -mt-1">
        {shareUrl && <SharePopover url={shareUrl} title={subtitle} />}
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary-bg rounded-md transition-colors"
          aria-label="Close Panel"
        >
          <IconX className="text-text-secondary" size={20} stroke={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <IconMapPin className="shrink-0 text-text-secondary" size={16} stroke={2} aria-hidden="true" />
  );
}
