'use client';

import { useState, useEffect, useMemo } from 'react';
import type { InspectedFeature, WalkScoreData, PermitsData, LayerConfig, Proposal } from '@/types';
import { getZoneInfo, type ZoneInfo } from '@/lib/zoning-info';
import { isZoningLayer, isTransitLayer } from '@/lib/property-display';
import { getRepresentativePoint } from '@/lib/spatial';
import { reverseGeocode } from '@/lib/mapbox';

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
}

// ============================================================================
// Hook
// ============================================================================

export function useInspectData(
  feature: InspectedFeature | null,
  layerConfigs: LayerConfig[],
  proposals: Proposal[]
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
  }, [feature?.geometry]);

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
      .catch(() => setWalkScore(null))
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
      .catch(() => setPermits(null))
      .finally(() => setIsLoadingPermits(false));
  }, [featurePoint, isZoning]);

  // Effect: Fetch Location (reverse geocode)
  useEffect(() => {
    if (!featurePoint || !isZoning) return;

    const [lng, lat] = featurePoint;
    reverseGeocode(lng, lat)
      .then((result) => setLocation(result))
      .catch(() => setLocation(null));
  }, [featurePoint, isZoning]);

  // Effect: Fetch Parcel Data from King County
  useEffect(() => {
    if (!featurePoint || !isZoning) return;

    const [lng, lat] = featurePoint;
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
      .catch(() => setParcelData(null))
      .finally(() => setIsLoadingParcel(false));
  }, [featurePoint, isZoning]);

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
  };
}
