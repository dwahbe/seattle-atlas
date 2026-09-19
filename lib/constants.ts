/** Shared constants used across map controls and rendering */

// Layer group IDs — base layers are mutually exclusive
export const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];
export const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops', 'light_rail'];
export const BIKE_LAYER_ID = 'bike_facilities';
export const PARKS_LAYER_ID = 'parks_open_space';
export const INSTITUTIONS_LAYER_ID = 'institutions';

// Transit and bike infrastructure are render-only — clicking them produces an
// uninsightful details panel (e.g. "Route 100002, Type: bus") — and the
// institutions overlay is a silent enrichment source, so all are excluded from
// inspect and hover queries.
export const NON_INSPECTABLE_LAYER_IDS = new Set<string>([
  ...TRANSIT_LAYER_IDS,
  BIKE_LAYER_ID,
  INSTITUTIONS_LAYER_ID,
]);

/**
 * The base style's water fill — light-v11 and dark-v11 both name it `water`.
 * `MapLayers` inserts the site's fill layers beneath it, so zoning and park
 * color never paint over water (the city's zoning covers platted tidelands off
 * Magnolia, and the parks source has lots under Puget Sound), and inspect and
 * hover treat a hit on it as empty space (see `isOverWater`).
 */
export const BASE_WATER_LAYER_ID = 'water';

/** Filter id on each zoning base layer that the interactive legend toggles. */
export const ZONING_FILTER_IDS: Record<string, string> = {
  zoning: 'zone_category',
  zoning_detailed: 'zone_type',
};

/** Cobalt highlight color for inspected/selected features — matches the UI accent */
export const HIGHLIGHT_COLOR = '#1D63ED';

/** Square feet per acre — keeps the acres/sqft round-trip a single definition */
export const SQ_FT_PER_ACRE = 43560;
