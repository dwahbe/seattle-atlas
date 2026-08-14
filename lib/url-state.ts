// Default map center: Seattle
export const SEATTLE_CENTER = {
  lat: 47.6062,
  lng: -122.3321,
  zoom: 12,
};

// The query params that encode map view/state. Single source of truth:
// `useUrlState`'s parsers are key-checked against this list, and the intro
// splash skips itself when any are present (treating the URL as a deep link).
// The pre-hydration script in app/layout.tsx mirrors this as a literal array
// because inline scripts can't import — keep that copy in sync.
export const MAP_STATE_PARAMS = [
  'lat',
  'lng',
  'z',
  'layers',
  'filters',
  'inspect',
  'pin',
  'compare',
] as const;

export type MapStateParam = (typeof MAP_STATE_PARAMS)[number];

// Shared deep-link detection. IntroHero skips the splash iff a map-state deep
// link is present, and MapDeepLinkScroller scrolls the map into view in exactly
// that case — the two must agree, so the predicate lives here next to
// MAP_STATE_PARAMS rather than being hand-duplicated at each call site.
export function hasMapStateParams(search?: string): boolean {
  const searchString = search ?? (typeof window === 'undefined' ? '' : window.location.search);
  const params = new URLSearchParams(searchString);
  return MAP_STATE_PARAMS.some((key) => params.has(key));
}

// True when the URL carries an inspect pin — i.e. this load will auto-open
// the inspect panel via MapGL's deep-link restore. OnboardingTour consumes
// this to stay out of the restored panel's way.
export function hasPinParam(search?: string): boolean {
  const searchString = search ?? (typeof window === 'undefined' ? '' : window.location.search);
  return new URLSearchParams(searchString).has('pin');
}

// Default visible layers. Parks and the institutions overlay both ride along
// with the zoning toggle (see MapContainer.handleBaseLayerChange), so they
// appear together on first load. Institutions has fill-opacity 0 — it's a
// silent enrichment source for the inspect panel, not a visible layer.
const DEFAULT_LAYERS = ['zoning', 'parks_open_space', 'institutions'];

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

// Parse pin string ("lat,lng") to an internal [lng, lat] position — the
// inspect marker / click point. URL order is lat,lng to match the lat/lng
// params; internal order matches Mapbox. Restore mechanics: see MapGL's
// deep-link restore effect.
export function parsePinParam(pinString: string | null | undefined): [number, number] | null {
  if (!pinString) return null;
  const parts = pinString.split(',');
  if (parts.length !== 2 || parts.some((part) => part.trim() === '')) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lng, lat];
}

// Serialize an internal [lng, lat] position to the pin param ("lat,lng").
// 6 decimals ≈ 0.1 m — the pin feeds parcel/permit point lookups, where
// coarser rounding could land in a neighboring parcel. Longitude is wrapped
// into [-180, 180]: Mapbox reports unwrapped lngs after panning across world
// copies (e.g. 237.67 for Seattle), which parsePinParam would reject.
export function serializePinParam(position: [number, number] | null): string {
  if (!position) return '';
  const [lng, lat] = position;
  const wrappedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
  return `${lat.toFixed(6)},${wrappedLng.toFixed(6)}`;
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
  pinPosition: [number, number] | null;
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

  const pinStr = serializePinParam(params.pinPosition);
  if (pinStr) {
    searchParams.set('pin', pinStr);
  }

  if (params.compare) {
    searchParams.set('compare', 'true');
  }

  const queryString = searchParams.toString();
  return queryString ? `/?${queryString}` : '/';
}
