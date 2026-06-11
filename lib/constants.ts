/** Shared constants used across map controls and rendering */

// Layer group IDs — base layers are mutually exclusive
export const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];
export const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops', 'light_rail'];
export const BIKE_LAYER_ID = 'bike_facilities';
export const PARKS_LAYER_ID = 'parks_open_space';
export const INSTITUTIONS_LAYER_ID = 'institutions';

/** Filter id on each zoning base layer that the interactive legend toggles. */
export const ZONING_FILTER_IDS: Record<string, string> = {
  zoning: 'zone_category',
  zoning_detailed: 'zone_type',
};

/** Cobalt highlight color for inspected/selected features — matches the UI accent */
export const HIGHLIGHT_COLOR = '#1D63ED';
