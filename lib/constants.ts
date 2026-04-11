/** Shared constants used across map controls and rendering */

// Layer group IDs — base layers are mutually exclusive
export const BASE_LAYER_IDS = ['zoning', 'zoning_detailed'];
export const TRANSIT_LAYER_IDS = ['transit_routes', 'transit_stops', 'light_rail'];
export const BIKE_LAYER_ID = 'bike_facilities';
export const PARKS_LAYER_ID = 'parks_open_space';

/** Blue highlight color for inspected/selected features */
export const HIGHLIGHT_COLOR = '#3B82F6';

/** When the underlying map data was last refreshed */
export const DATA_FRESHNESS = 'Jan 2025';
