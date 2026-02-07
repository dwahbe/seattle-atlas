'use client';

import { useState, useEffect, useMemo } from 'react';
import type { InspectedFeature, WalkScoreData, PermitsData, LayerConfig, Proposal } from '@/types';
import { getZoneInfo, type ZoneInfo } from '@/lib/zoning-info';
import { isZoningLayer, isTransitLayer } from '@/lib/property-display';
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

  // Layer info
  layerConfig: LayerConfig | undefined;
  layerName: string;

  // Zone info (derived)
  zoneInfo: ZoneInfo | null;

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

  // Effect: Reset all data when feature changes to non-zoning or null
  useEffect(() => {
    if (!featurePoint || !isZoning) {
      setWalkScore(null);
      setPermits(null);
      setLocation(null);
      setParcelData(null);
    }
  }, [featurePoint, isZoning]);

  // Effect: Fetch Walk Score
  useEffect(() => {
    if (!featurePoint || !isZoning) return;

    const [lng, lat] = featurePoint;
    setIsLoadingWalkScore(true);

    fetch(`/api/walkscore?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => setWalkScore(data))
      .catch(() => {
        setWalkScore(null);
        toast.error('Failed to load Walk Score', { id: 'walkscore-error' });
      })
      .finally(() => setIsLoadingWalkScore(false));
  }, [featurePoint, isZoning]);

  // Effect: Fetch Permits
  useEffect(() => {
    if (!featurePoint || !isZoning) return;

    const [lng, lat] = featurePoint;
    setIsLoadingPermits(true);

    fetch(`/api/permits?lat=${lat}&lng=${lng}&radius=300&limit=5`)
      .then((res) => res.json())
      .then((data) => setPermits(data))
      .catch(() => {
        setPermits(null);
        toast.error('Failed to load permits', { id: 'permits-error' });
      })
      .finally(() => setIsLoadingPermits(false));
  }, [featurePoint, isZoning]);

  // Effect: Fetch Location (reverse geocode)
  // Use clickPoint if provided (more accurate), otherwise fall back to centroid
  useEffect(() => {
    if (!isZoning) return;
    const point = clickPoint || featurePoint;
    if (!point) return;

    const [lng, lat] = point;
    reverseGeocode(lng, lat)
      .then((result) => setLocation(result))
      .catch(() => setLocation(null));
  }, [clickPoint, featurePoint, isZoning]);

  // Effect: Fetch Parcel Data from King County
  // Use clickPoint if available (more accurate), otherwise fall back to centroid
  useEffect(() => {
    if (!isZoning) return;
    const point = clickPoint || featurePoint;
    if (!point) return;

    const [lng, lat] = point;
    setIsLoadingParcel(true);

    fetch(`/api/parcel?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setParcelData(null);
        } else {
          setParcelData(data);
        }
      })
      .catch(() => {
        setParcelData(null);
        toast.error('Failed to load property data', { id: 'parcel-error' });
      })
      .finally(() => setIsLoadingParcel(false));
  }, [clickPoint, featurePoint, isZoning]);

  return {
    feature,
    featurePoint,
    isZoning,
    isTransit,
    layerConfig,
    layerName,
    zoneInfo,
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
