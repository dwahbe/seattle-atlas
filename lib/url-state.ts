import { createSearchParamsCache, parseAsBoolean, parseAsFloat, parseAsString } from 'nuqs/server';

// Default map center: Seattle
export const SEATTLE_CENTER = {
  lat: 47.6062,
  lng: -122.3321,
  zoom: 12,
};

// Default visible layers
export const DEFAULT_LAYERS = ['zoning'];

// Search params parsers for server-side parsing
export const searchParamsParsers = {
  lat: parseAsFloat.withDefault(SEATTLE_CENTER.lat),
  lng: parseAsFloat.withDefault(SEATTLE_CENTER.lng),
  z: parseAsFloat.withDefault(SEATTLE_CENTER.zoom),
  layers: parseAsString.withDefault(DEFAULT_LAYERS.join(',')),
  filters: parseAsString.withDefault(''),
  inspect: parseAsString.withDefault(''),
  compare: parseAsBoolean.withDefault(false),
};

// Create the search params cache for server components
export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

// Parse layers string to array
// Empty string = no layers (user unchecked all)
// Undefined/null = use defaults (first visit)
export function parseLayersParam(layersString: string | null | undefined): string[] {
  if (layersString === null || layersString === undefined) return DEFAULT_LAYERS;
  if (layersString === '') return [];
  return layersString.split(',').filter(Boolean);
}

// Serialize layers array to string
// Empty array becomes empty string (not omitted) so we know user chose no layers
export function serializeLayersParam(layers: string[]): string {
  return layers.join(',');
}

// Parse filters string to object
// Format: "layerId.filterId:value1,value2;layerId.filterId:value"
export function parseFiltersParam(filtersString: string): Record<string, Record<string, string[]>> {
  if (!filtersString) return {};

  const result: Record<string, Record<string, string[]>> = {};

  const filterParts = filtersString.split(';').filter(Boolean);
  for (const part of filterParts) {
    const [key, value] = part.split(':');
    if (!key || !value) continue;

    const [layerId, filterId] = key.split('.');
    if (!layerId || !filterId) continue;

    if (!result[layerId]) {
      result[layerId] = {};
    }
    result[layerId][filterId] = value.split(',').filter(Boolean);
  }

  return result;
}

// Serialize filters object to string
export function serializeFiltersParam(filters: Record<string, Record<string, string[]>>): string {
  const parts: string[] = [];

  for (const [layerId, layerFilters] of Object.entries(filters)) {
    for (const [filterId, values] of Object.entries(layerFilters)) {
      if (values.length > 0) {
        parts.push(`${layerId}.${filterId}:${values.join(',')}`);
      }
    }
  }

  return parts.join(';');
}

// Build shareable URL from current state
export function buildShareableUrl(params: {
  lat: number;
  lng: number;
  zoom: number;
  layers: string[];
  filters: Record<string, Record<string, string[]>>;
  inspectedFeatureId: string | null;
  compare: boolean;
}): string {
  const searchParams = new URLSearchParams();

  // Only add non-default values
  if (Math.abs(params.lat - SEATTLE_CENTER.lat) > 0.0001) {
    searchParams.set('lat', params.lat.toFixed(4));
  }
  if (Math.abs(params.lng - SEATTLE_CENTER.lng) > 0.0001) {
    searchParams.set('lng', params.lng.toFixed(4));
  }
  if (Math.abs(params.zoom - SEATTLE_CENTER.zoom) > 0.1) {
    searchParams.set('z', params.zoom.toFixed(1));
  }

  const layersStr = serializeLayersParam(params.layers);
  if (layersStr !== DEFAULT_LAYERS.join(',')) {
    searchParams.set('layers', layersStr);
  }

  const filtersStr = serializeFiltersParam(params.filters);
  if (filtersStr) {
    searchParams.set('filters', filtersStr);
  }

  if (params.inspectedFeatureId) {
    searchParams.set('inspect', params.inspectedFeatureId);
  }

  if (params.compare) {
    searchParams.set('compare', 'true');
  }

  const queryString = searchParams.toString();
  return queryString ? `/map?${queryString}` : '/map';
}
