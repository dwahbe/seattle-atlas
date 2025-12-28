'use client';

import mapboxgl from 'mapbox-gl';
import type { LayerConfig } from '@/types';

// Mapbox access token from environment
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Seattle bounds for geocoding
export const SEATTLE_BOUNDS: [number, number, number, number] = [
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

// Get layer paint properties based on layer type and config
export function getLayerPaint(layer: LayerConfig): Record<string, unknown> {
  const basePaint = layer.paint || {};
  const colorExpr = buildColorExpression(layer);

  if (layer.type === 'fill') {
    return {
      'fill-color': colorExpr,
      'fill-opacity': (basePaint['fill-opacity'] as number) ?? 0.7,
      'fill-outline-color': (basePaint['fill-outline-color'] as string) ?? '#000000',
      ...basePaint,
    };
  }

  if (layer.type === 'line') {
    return {
      'line-color': colorExpr,
      'line-width': (basePaint['line-width'] as number) ?? 2,
      ...basePaint,
    };
  }

  if (layer.type === 'circle') {
    return {
      'circle-color': colorExpr,
      'circle-radius': (basePaint['circle-radius'] as number) ?? 6,
      'circle-stroke-width': (basePaint['circle-stroke-width'] as number) ?? 1,
      'circle-stroke-color': (basePaint['circle-stroke-color'] as string) ?? '#ffffff',
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

// Build a Mapbox expression for data-driven coloring
function buildColorExpression(layer: LayerConfig): mapboxgl.Expression | string {
  if (layer.legend.length === 0) {
    // Use paint fill-color if specified, otherwise default
    return (layer.paint?.['fill-color'] as string) || '#888888';
  }

  if (layer.legend.length === 1) {
    return layer.legend[0].color;
  }

  // Use colorProperty if specified, otherwise try to infer from layer config
  const propertyName = layer.colorProperty || 'ZONELUT';

  const matchExpression: mapboxgl.Expression = ['match', ['get', propertyName]];

  for (const item of layer.legend) {
    matchExpression.push(item.value, item.color);
  }

  // Default color for unmatched values
  matchExpression.push('#9CA3AF');

  return matchExpression;
}

// Get layer layout properties
export function getLayerLayout(layer: LayerConfig): mapboxgl.AnyLayout {
  return {
    visibility: 'visible',
  };
}

// Build filter expression from filter state
export function buildFilterExpression(
  layer: LayerConfig,
  filterState: Record<string, string[]>
): mapboxgl.Expression | null {
  if (!layer.filters || Object.keys(filterState).length === 0) {
    return null;
  }

  const conditions: mapboxgl.Expression[] = [];

  for (const filter of layer.filters) {
    const values = filterState[filter.id];
    if (values && values.length > 0) {
      // Build "in" expression for multiselect
      const inExpression: mapboxgl.Expression = [
        'in',
        ['get', filter.property],
        ['literal', values],
      ];
      conditions.push(inExpression);
    }
  }

  if (conditions.length === 0) {
    return null;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return ['all', ...conditions];
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
      console.error('Geocoding error:', response.status);
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
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

interface MapboxGeocodingFeature {
  id: string;
  place_name: string;
  place_type: string[];
  center: number[];
  bbox?: number[];
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
