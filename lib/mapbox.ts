'use client';

import mapboxgl from 'mapbox-gl';
import type { InspectedFeature, LayerConfig } from '@/types';
import {
  BASE_WATER_LAYER_ID,
  HIGHLIGHT_COLOR,
  INSTITUTIONS_LAYER_ID,
  NON_INSPECTABLE_LAYER_IDS,
} from '@/lib/constants';
import { getInstitutionInfo } from '@/lib/institutions';
import { buildColorExpression } from '@/lib/map-expressions';

export {
  buildColorExpression,
  buildFilterExpression,
  resolveLegendItem,
} from '@/lib/map-expressions';

// Mapbox access token from environment
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Seattle bounds for geocoding
const SEATTLE_BOUNDS: [number, number, number, number] = [
  -122.4596, // west
  47.4919, // south
  -122.2244, // east
  47.7341, // north
];

// Map style URLs
export const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

// Initialize Mapbox access token
export function initializeMapbox() {
  if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN;
  }
}

// Query the rendered, inspectable layers at a lng/lat point and build the
// InspectedFeature there (institution enrichment included) — the single
// query-at-point implementation behind live clicks, address search, and the
// deep-link restore. `expectedFeatureId` breaks ties toward a known feature
// (the restore passes the URL's inspect id so overlapping polygons — e.g. a
// park over zoning — resolve to what the sharer saw); `preferZoning` keeps the
// address-search behavior of surfacing the zoning parcel over overlays.
export function queryInspectableFeature(
  map: mapboxgl.Map,
  lngLat: [number, number],
  activeLayers: string[],
  options: { preferZoning?: boolean; expectedFeatureId?: string | null } = {}
): InspectedFeature | null {
  const point = map.project(lngLat);
  // Water is painted above the fills, so a point on water has nothing to
  // inspect even though the zoning/park polygons underneath still render.
  if (isOverWater(map, point)) return null;
  const primaryLayers = activeLayers.filter(
    (id) => !NON_INSPECTABLE_LAYER_IDS.has(id) && map.getLayer(id)
  );
  const features = map.queryRenderedFeatures(point, { layers: primaryLayers });
  if (features.length === 0) return null;

  const expected = options.expectedFeatureId
    ? features.find((f) => String(f.id ?? f.properties?.id) === options.expectedFeatureId)
    : undefined;
  const zoning = options.preferZoning
    ? features.find((f) => f.layer?.id === 'zoning' || f.layer?.id === 'zoning_detailed')
    : undefined;
  const feature = expected ?? zoning ?? features[0];
  const layerId = feature.layer?.id ?? 'unknown';

  // Separate lookup for the institutions overlay — it has fill-opacity 0 and
  // is excluded from the primary query, but its data rides along when the
  // point falls inside one.
  const institutionFeature = map.getLayer(INSTITUTIONS_LAYER_ID)
    ? map.queryRenderedFeatures(point, { layers: [INSTITUTIONS_LAYER_ID] })[0]
    : undefined;
  const institution = institutionFeature
    ? (getInstitutionInfo(
        institutionFeature.properties?.OVERLAY,
        institutionFeature.properties?.DESCRIPTION
      ) ?? undefined)
    : undefined;

  return {
    id: feature.id ?? feature.properties?.id ?? `${layerId}-${Date.now()}`,
    layerId,
    properties: feature.properties as Record<string, unknown>,
    geometry: feature.geometry,
    ...(institution && { institution }),
  };
}

// Screen-point test against the base style's water fill — the same
// rendered-feature query the inspect path uses, so "over water" is judged by
// what is actually painted rather than by geometry. The site's fills sit
// beneath that layer (see MapLayers), so a hit means nothing underneath is
// visible to inspect. False when the style has no water layer.
export function isOverWater(map: mapboxgl.Map, point: mapboxgl.PointLike): boolean {
  if (!map.getLayer(BASE_WATER_LAYER_ID)) return false;
  return map.queryRenderedFeatures(point, { layers: [BASE_WATER_LAYER_ID] }).length > 0;
}

// Get layer paint properties based on layer type and config
// Includes feature-state expressions for inspected highlight
export function getLayerPaint(layer: LayerConfig): Record<string, unknown> {
  const basePaint = layer.paint || {};
  const colorExpr = buildColorExpression(layer);

  // Build inspected state expressions for opacity/width boost
  const inspectedOpacityExpr = (baseOpacity: number): mapboxgl.Expression => [
    'case',
    ['boolean', ['feature-state', 'inspected'], false],
    Math.min(baseOpacity + 0.2, 1),
    baseOpacity,
  ];

  const inspectedStrokeExpr = (baseWidth: number): mapboxgl.Expression => [
    'case',
    ['boolean', ['feature-state', 'inspected'], false],
    baseWidth + 2,
    baseWidth,
  ];

  if (layer.type === 'fill') {
    const baseOpacity = (basePaint['fill-opacity'] as number) ?? 0.7;
    // Spread basePaint first, then override with inspected-aware expressions
    return {
      ...basePaint,
      'fill-color': colorExpr,
      'fill-opacity': inspectedOpacityExpr(baseOpacity),
      'fill-outline-color': [
        'case',
        ['boolean', ['feature-state', 'inspected'], false],
        HIGHLIGHT_COLOR, // Blue outline for inspected
        (basePaint['fill-outline-color'] as string) ?? '#000000',
      ],
    };
  }

  if (layer.type === 'line') {
    const baseWidth = (basePaint['line-width'] as number) ?? 2;
    return {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'inspected'], false],
        HIGHLIGHT_COLOR,
        colorExpr,
      ],
      'line-width': typeof baseWidth === 'number' ? inspectedStrokeExpr(baseWidth) : baseWidth,
      ...basePaint,
    };
  }

  if (layer.type === 'circle') {
    return {
      'circle-color': colorExpr,
      'circle-radius': (basePaint['circle-radius'] as number) ?? 6,
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'inspected'], false],
        ((basePaint['circle-stroke-width'] as number) ?? 1) + 2,
        (basePaint['circle-stroke-width'] as number) ?? 1,
      ],
      'circle-stroke-color': [
        'case',
        ['boolean', ['feature-state', 'inspected'], false],
        HIGHLIGHT_COLOR,
        (basePaint['circle-stroke-color'] as string) ?? '#ffffff',
      ],
      ...basePaint,
    };
  }

  if (layer.type === 'symbol') {
    return {
      'text-color': (basePaint['text-color'] as string) ?? '#000000',
      ...basePaint,
    };
  }

  return basePaint;
}

// Get layer layout properties
export function getLayerLayout(layer: LayerConfig): mapboxgl.AnyLayout {
  return {
    visibility: 'visible',
    ...(layer.layout || {}),
  } as mapboxgl.AnyLayout;
}

// Geocoding API helper
export async function geocodeAddress(query: string): Promise<GeocodingResult[]> {
  if (!MAPBOX_TOKEN || !query.trim()) {
    return [];
  }

  const url = new URL(
    'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json'
  );
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('bbox', SEATTLE_BOUNDS.join(','));
  url.searchParams.set('limit', '5');
  url.searchParams.set('types', 'address,neighborhood,locality,place');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.features.map((feature: MapboxGeocodingFeature) => ({
      id: feature.id,
      name: feature.place_name,
      type: mapFeatureType(feature.place_type[0]),
      center: feature.center as [number, number],
      bbox: feature.bbox as [number, number, number, number] | undefined,
    }));
  } catch {
    return [];
  }
}

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  place_type: string[];
  center: number[];
  bbox?: number[];
  context?: Array<{ id: string; text: string }>;
}

export interface GeocodingResult {
  id: string;
  name: string;
  type: 'address' | 'neighborhood' | 'place';
  center: [number, number];
  bbox?: [number, number, number, number];
}

function mapFeatureType(type: string): 'address' | 'neighborhood' | 'place' {
  switch (type) {
    case 'address':
      return 'address';
    case 'neighborhood':
    case 'locality':
      return 'neighborhood';
    default:
      return 'place';
  }
}

/**
 * Reverse geocode a point to get an address or place name.
 *
 * `isPrecise` is true when Mapbox returns a specific street address; false when
 * we fall back to a neighborhood/area match. Callers use it to decide whether
 * to qualify the result (e.g. with a "Near" prefix).
 */
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<{ address: string; neighborhood?: string; isPrecise: boolean } | null> {
  if (!MAPBOX_TOKEN) {
    return null;
  }

  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`);
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('limit', '1');
  url.searchParams.set('types', 'address,neighborhood');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0] as MapboxGeocodingFeature;

    // Extract just the street address (first part before the city)
    const placeName = feature.place_name;
    const addressParts = placeName.split(',');
    const shortAddress = addressParts[0]?.trim() || placeName;

    // Try to find neighborhood from context
    let neighborhood: string | undefined;
    if (feature.context) {
      const neighborhoodContext = (feature.context as Array<{ id: string; text: string }>).find(
        (c) => c.id.startsWith('neighborhood')
      );
      neighborhood = neighborhoodContext?.text;
    }

    return {
      address: shortAddress,
      neighborhood,
      isPrecise: feature.place_type?.[0] === 'address',
    };
  } catch {
    return null;
  }
}
