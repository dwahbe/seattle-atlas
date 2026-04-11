'use client';

import { useState, useEffect, useMemo } from 'react';
import type { InspectedFeature, WalkScoreData, PermitsData, LayerConfig, Proposal } from '@/types';
import { getZoneInfo, type ZoneInfo } from '@/lib/zoning-info';
import { isZoningLayer, isTransitLayer, isParkLayer } from '@/lib/property-display';
import { getRepresentativePoint, isWithinRadius } from '@/lib/spatial';
import { reverseGeocode } from '@/lib/mapbox';
import { toast } from 'sonner';

const SPACE_NEEDLE_COORD: [number, number] = [-122.3493, 47.6205];
const SPACE_NEEDLE_RADIUS_METERS = 350;

// ============================================================================
// Types
// ============================================================================

export interface ParcelData {
  pin: string;
  acres: number | null;
  lotSqFt: number | null;
  zoning: string | null;
  presentUse: string | null;
  assessorUrl: string;
}

export interface ParkData {
  name: string;
  type: string;
  address: string | null;
  areaAcres: number;
  areaSqFt: number;
  acquiredYear: number | null;
  owner: string;
}

export interface LocationData {
  address: string;
  neighborhood?: string;
}

export interface InspectData {
  // Feature info
  feature: InspectedFeature | null;
  featurePoint: [number, number] | null;
  isZoning: boolean;
  isTransit: boolean;
  isPark: boolean;

  // Layer info
  layerConfig: LayerConfig | undefined;
  layerName: string;

  // Zone info (derived)
  zoneInfo: ZoneInfo | null;

  // Park info (derived from feature properties)
  parkData: ParkData | null;

  // Location (fetched)
  location: LocationData | null;

  // Walk Score (fetched)
  walkScore: WalkScoreData | null;
  isLoadingWalkScore: boolean;

  // Permits (fetched)
  permits: PermitsData | null;
  isLoadingPermits: boolean;

  // Parcel (fetched) - NEW
  parcelData: ParcelData | null;
  isLoadingParcel: boolean;

  // Related proposals
  relatedProposals: Proposal[];

  // Landmark (derived)
  landmark: 'space-needle' | null;
}

// ============================================================================
// Hook
// ============================================================================

export function useInspectData(
  feature: InspectedFeature | null,
  layerConfigs: LayerConfig[],
  proposals: Proposal[],
  /** Optional click point - used for reverse geocoding instead of centroid */
  clickPoint?: [number, number] | null
): InspectData {
  // Local state for fetched data
  const [walkScore, setWalkScore] = useState<WalkScoreData | null>(null);
  const [permits, setPermits] = useState<PermitsData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [isLoadingWalkScore, setIsLoadingWalkScore] = useState(false);
  const [isLoadingPermits, setIsLoadingPermits] = useState(false);
  const [isLoadingParcel, setIsLoadingParcel] = useState(false);

  // Derived: layer type booleans
  const isZoning = feature ? isZoningLayer(feature.layerId) : false;
  const isTransit = feature ? isTransitLayer(feature.layerId) : false;
  const isPark = feature ? isParkLayer(feature.layerId) : false;

  // Derived: layer config and name
  const layerConfig = useMemo(
    () => layerConfigs.find((l) => l.id === feature?.layerId),
    [layerConfigs, feature?.layerId]
  );
  const layerName = layerConfig?.name || feature?.layerId || '';

  // Derived: zone info (from feature properties)
  const zoneInfo = useMemo<ZoneInfo | null>(() => {
    if (!feature || !isZoning) return null;
    const zoneCode = feature.properties.ZONELUT as string;
    return getZoneInfo(zoneCode);
  }, [feature, isZoning]);

  // Derived: park info (from clean tileset properties)
  const parkData = useMemo<ParkData | null>(() => {
    if (!feature || !isPark) return null;
    const p = feature.properties;
    return {
      name: typeof p.name === 'string' ? p.name : 'Unnamed',
      type: typeof p.type === 'string' ? p.type : 'Park',
      address: typeof p.address === 'string' && p.address.length > 0 ? p.address : null,
      areaAcres: typeof p.areaAcres === 'number' ? p.areaAcres : 0,
      areaSqFt: typeof p.areaSqFt === 'number' ? p.areaSqFt : 0,
      acquiredYear: typeof p.acquiredYear === 'number' ? p.acquiredYear : null,
      owner: typeof p.owner === 'string' ? p.owner : 'Seattle Parks',
    };
  }, [feature, isPark]);

  // Derived: representative point for API calls
  const featurePoint = useMemo<[number, number] | null>(() => {
    if (!feature?.geometry) return null;
    return getRepresentativePoint(feature.geometry);
  }, [feature]);

  // Derived: landmark detection (Space Needle)
  const landmark = useMemo<'space-needle' | null>(() => {
    if (!isZoning) return null;
    const point = clickPoint || featurePoint;
    if (!point) return null;
    if (isWithinRadius(SPACE_NEEDLE_COORD, point, SPACE_NEEDLE_RADIUS_METERS)) {
      return 'space-needle';
    }
    return null;
  }, [clickPoint, featurePoint, isZoning]);

  // Derived: related proposals
  const relatedProposals = useMemo(
    () => (feature ? proposals.filter((p) => p.layers.includes(feature.layerId)) : []),
    [proposals, feature]
  );

  // ---------------------------------------------------------------------------
  // Fetch target keys — identify the coordinates each fetch group runs against.
  // Two groups because walkscore/permits use the feature centroid, while
  // location/parcel prefer the actual click point for sub-parcel accuracy.
  // ---------------------------------------------------------------------------
  const featureKey = featurePoint && isZoning ? `${featurePoint[0]},${featurePoint[1]}` : null;
  const clickResolved = clickPoint || featurePoint;
  const clickKey = isZoning && clickResolved ? `${clickResolved[0]},${clickResolved[1]}` : null;

  // Reset fetched data + prime loading state whenever the fetch target changes.
  // Uses the "setState during render" pattern documented at
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // — this is preferable to resetting inside a useEffect because it avoids an
  // extra commit cycle (and avoids the react-hooks/set-state-in-effect lint).
  const [prevFeatureKey, setPrevFeatureKey] = useState<string | null>(null);
  const [prevClickKey, setPrevClickKey] = useState<string | null>(null);

  if (prevFeatureKey !== featureKey) {
    setPrevFeatureKey(featureKey);
    setWalkScore(null);
    setPermits(null);
    setIsLoadingWalkScore(featureKey !== null);
    setIsLoadingPermits(featureKey !== null);
  }

  if (prevClickKey !== clickKey) {
    setPrevClickKey(clickKey);
    setLocation(null);
    setParcelData(null);
    setIsLoadingParcel(clickKey !== null);
  }

  // Effect: Fetch Walk Score.
  // `isLoadingWalkScore` is primed to `true` by the render-time key-change block
  // above, so we only flip it back to `false` in `.finally()` here.
  // The `cancelled` guard prevents stale responses from rapid feature switching
  // landing on top of a newer feature's data.
  useEffect(() => {
    if (!featurePoint || !isZoning) return;

    const [lng, lat] = featurePoint;
    let cancelled = false;

    fetch(`/api/walkscore?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setWalkScore(data);
      })
      .catch(() => {
        if (cancelled) return;
        setWalkScore(null);
        toast.error('Failed to load Walk Score', { id: 'walkscore-error' });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingWalkScore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [featurePoint, isZoning]);

  // Effect: Fetch Permits. Loading state is primed by the render-time block above.
  useEffect(() => {
    if (!featurePoint || !isZoning) return;

    const [lng, lat] = featurePoint;
    let cancelled = false;

    fetch(`/api/permits?lat=${lat}&lng=${lng}&radius=300&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPermits(data);
      })
      .catch(() => {
        if (cancelled) return;
        setPermits(null);
        toast.error('Failed to load permits', { id: 'permits-error' });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPermits(false);
      });

    return () => {
      cancelled = true;
    };
  }, [featurePoint, isZoning]);

  // Effect: Fetch Location (reverse geocode).
  // Use clickPoint if provided (more accurate), otherwise fall back to centroid.
  useEffect(() => {
    if (!isZoning) return;
    const point = clickPoint || featurePoint;
    if (!point) return;

    const [lng, lat] = point;
    let cancelled = false;

    reverseGeocode(lng, lat)
      .then((result) => {
        if (!cancelled) setLocation(result);
      })
      .catch(() => {
        if (!cancelled) setLocation(null);
      });

    return () => {
      cancelled = true;
    };
  }, [clickPoint, featurePoint, isZoning]);

  // Effect: Fetch Parcel Data from King County.
  // Use clickPoint if available (more accurate), otherwise fall back to centroid.
  // Loading state is primed by the render-time block above.
  useEffect(() => {
    if (!isZoning) return;
    const point = clickPoint || featurePoint;
    if (!point) return;

    const [lng, lat] = point;
    let cancelled = false;

    fetch(`/api/parcel?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setParcelData(null);
        } else {
          setParcelData(data);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setParcelData(null);
        toast.error('Failed to load property data', { id: 'parcel-error' });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingParcel(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clickPoint, featurePoint, isZoning]);

  return {
    feature,
    featurePoint,
    isZoning,
    isTransit,
    isPark,
    layerConfig,
    layerName,
    zoneInfo,
    parkData,
    location,
    walkScore,
    isLoadingWalkScore,
    permits,
    isLoadingPermits,
    parcelData,
    isLoadingParcel,
    relatedProposals,
    landmark,
  };
}
