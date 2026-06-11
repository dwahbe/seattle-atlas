'use client';

import mapboxgl from 'mapbox-gl';
import type { LayerConfig } from '@/types';
import { HIGHLIGHT_COLOR } from '@/lib/constants';

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

// Build a Mapbox expression for data-driven coloring
function buildColorExpression(layer: LayerConfig): mapboxgl.Expression | string {
  // If colorProperty is specified but no legend, use the property value directly
  // This enables data-driven coloring from GeoJSON properties (e.g., transit route colors)
  if (layer.colorProperty && layer.legend.length === 0) {
    return ['get', layer.colorProperty] as mapboxgl.Expression;
  }

  if (layer.legend.length === 0) {
    // Use paint fill-color/line-color if specified, otherwise default
    return (
      (layer.paint?.['fill-color'] as string) ||
      (layer.paint?.['line-color'] as string) ||
      '#888888'
    );
  }

  if (layer.legend.length === 1) {
    return layer.legend[0].color;
  }

  // Use colorProperty if specified, otherwise try to infer from layer config
  const propertyName = layer.colorProperty || 'ZONELUT';

  const overrides = layer.valueOverrides ?? [];
  const overrideValues = new Set(overrides.map((o) => o.value));

  const matchExpression: mapboxgl.Expression = ['match', ['get', propertyName]];

  for (const item of layer.legend) {
    // Pseudo values (e.g. SM_HIGHRISE) match a different property — handled
    // by the case wrapper below, not the colorProperty match.
    if (overrideValues.has(item.value)) continue;
    matchExpression.push(item.value, item.color);
  }

  // Default color for unmatched values
  matchExpression.push('#9CA3AF');

  if (overrides.length === 0) {
    return matchExpression;
  }

  // Overrides take precedence over the base match, so e.g. tower-zoned SM
  // polygons color as Downtown & Highrise while ZONELUT still reads "SM".
  const caseExpression: mapboxgl.Expression = ['case'];
  for (const override of overrides) {
    const item = layer.legend.find((i) => i.value === override.value);
    if (!item) continue;
    caseExpression.push(
      ['in', ['get', override.property], ['literal', override.matchValues]],
      item.color
    );
  }
  caseExpression.push(matchExpression);
  return caseExpression;
}

// Get layer layout properties
export function getLayerLayout(layer: LayerConfig): mapboxgl.AnyLayout {
  return {
    visibility: 'visible',
    ...(layer.layout || {}),
  } as mapboxgl.AnyLayout;
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
  const overrides = layer.valueOverrides ?? [];
  const overrideByValue = new Map(overrides.map((o) => [o.value, o]));

  for (const filter of layer.filters) {
    const values = filterState[filter.id];
    if (values && values.length > 0) {
      const plainValues = values.filter((v) => !overrideByValue.has(v));
      const selectedOverrides = values.flatMap((v) => overrideByValue.get(v) ?? []);

      const orConditions: mapboxgl.Expression[] = [];

      if (plainValues.length > 0) {
        // Build "in" expression for multiselect
        let inExpression: mapboxgl.Expression = [
          'in',
          ['get', filter.property],
          ['literal', plainValues],
        ];
        if (overrides.length > 0) {
          // Features claimed by an override (e.g. tower-zoned SM) must not
          // ride along with their base value — keep filtering consistent
          // with the legend coloring.
          inExpression = [
            'all',
            inExpression,
            ...overrides.map(
              (o): mapboxgl.Expression => [
                '!',
                ['in', ['get', o.property], ['literal', o.matchValues]],
              ]
            ),
          ];
        }
        orConditions.push(inExpression);
      }

      for (const override of selectedOverrides) {
        orConditions.push(['in', ['get', override.property], ['literal', override.matchValues]]);
      }

      if (orConditions.length === 1) {
        conditions.push(orConditions[0]);
      } else if (orConditions.length > 1) {
        conditions.push(['any', ...orConditions]);
      }
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
