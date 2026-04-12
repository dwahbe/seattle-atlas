/**
 * Property Display Configuration
 *
 * Defines how feature properties should be displayed for each layer type.
 * Handles field filtering, formatting, and transformation.
 */

import { PARKS_LAYER_ID } from '@/lib/constants';

interface DisplayField {
  key: string;
  label: string;
  transform?: 'none' | 'yesNo' | 'date' | 'number' | 'zoneCode' | 'uppercase';
  priority: number; // Lower = shown first
}

interface LayerDisplayConfig {
  layerId: string;
  displayFields: DisplayField[];
  hiddenFields: string[];
}

/**
 * Fields that should always be hidden (internal GIS fields).
 */
const GLOBAL_HIDDEN_FIELDS = [
  'OBJECTID',
  'OBJECT_ID',
  'Shape_Length',
  'Shape_Area',
  'Shape__Length',
  'Shape__Area',
  'GlobalID',
  'FID',
  '_id',
  'id',
];

/**
 * Layer-specific display configurations.
 */
const LAYER_DISPLAY_CONFIGS: Record<string, LayerDisplayConfig> = {
  zoning: {
    layerId: 'zoning',
    displayFields: [
      { key: 'ZONELUT', label: 'Zone Code', transform: 'zoneCode', priority: 1 },
      { key: 'IZ', label: 'Inclusionary Zoning', transform: 'yesNo', priority: 2 },
    ],
    hiddenFields: [
      'ZONEID',
      'ZONING',
      'ZONING_DESC',
      'CATEGORY_DESC',
      'DETAIL_DESC',
      'CLASS_DESC',
      'CONTRACT',
      'CONTRACT_PREV',
      'HISTORIC',
      'EFFECTIVE_PREV',
      ...GLOBAL_HIDDEN_FIELDS,
    ],
  },
  zoning_detailed: {
    layerId: 'zoning_detailed',
    displayFields: [
      { key: 'ZONELUT', label: 'Zone Code', transform: 'uppercase', priority: 1 },
      { key: 'ZONING_DESC', label: 'Full Name', priority: 2 },
      { key: 'CATEGORY_DESC', label: 'Category', priority: 3 },
      { key: 'IZ', label: 'Inclusionary Zoning', transform: 'yesNo', priority: 4 },
    ],
    hiddenFields: [
      'ZONEID',
      'ZONING',
      'DETAIL_DESC',
      'CLASS_DESC',
      'CONTRACT',
      'CONTRACT_PREV',
      'HISTORIC',
      'EFFECTIVE_PREV',
      ...GLOBAL_HIDDEN_FIELDS,
    ],
  },
  parks_open_space: {
    layerId: 'parks_open_space',
    displayFields: [
      { key: 'name', label: 'Park Name', priority: 1 },
      { key: 'type', label: 'Type', priority: 2 },
      { key: 'address', label: 'Address', priority: 3 },
      { key: 'areaAcres', label: 'Size', transform: 'number', priority: 4 },
      { key: 'acquiredYear', label: 'Acquired', priority: 5 },
      { key: 'owner', label: 'Owner', priority: 6 },
    ],
    hiddenFields: ['areaSqFt', 'parcelCount', ...GLOBAL_HIDDEN_FIELDS],
  },
  transit_stops: {
    layerId: 'transit_stops',
    displayFields: [
      { key: 'stop_name', label: 'Stop Name', priority: 1 },
      { key: 'stop_id', label: 'Stop ID', priority: 2 },
      { key: 'routes', label: 'Routes', priority: 3 },
    ],
    hiddenFields: [...GLOBAL_HIDDEN_FIELDS],
  },
  transit_routes: {
    layerId: 'transit_routes',
    displayFields: [
      { key: 'route_short_name', label: 'Route', priority: 1 },
      { key: 'route_long_name', label: 'Name', priority: 2 },
      { key: 'route_type', label: 'Type', priority: 3 },
      { key: 'agency_name', label: 'Agency', priority: 4 },
    ],
    hiddenFields: [
      'route_id',
      'agency_id',
      'route_color',
      'route_text_color',
      ...GLOBAL_HIDDEN_FIELDS,
    ],
  },
};

/**
 * Format a property value for display.
 */
export function formatPropertyValue(value: unknown, transform?: DisplayField['transform']): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  switch (transform) {
    case 'yesNo':
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1') return 'Yes';
        if (lower === 'n' || lower === 'no' || lower === 'false' || lower === '0') return 'No';
      }
      return String(value);

    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
      }
      return String(value);

    case 'number':
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      return String(value);

    case 'zoneCode':
    case 'uppercase':
      return String(value).toUpperCase();

    case 'none':
    default:
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') return value.toLocaleString();
      return String(value);
  }
}

/**
 * Check if a field should be hidden for a layer.
 */
export function isFieldHidden(layerId: string, fieldKey: string): boolean {
  const config = LAYER_DISPLAY_CONFIGS[layerId];

  // Always hide global hidden fields
  if (GLOBAL_HIDDEN_FIELDS.includes(fieldKey)) {
    return true;
  }

  // Check layer-specific hidden fields
  if (config?.hiddenFields.includes(fieldKey)) {
    return true;
  }

  // Hide fields starting with underscore
  if (fieldKey.startsWith('_')) {
    return true;
  }

  return false;
}

/**
 * Get formatted properties for display.
 * Returns properties sorted by priority with hidden fields removed.
 */
export function getDisplayProperties(
  layerId: string,
  properties: Record<string, unknown>
): Array<{ key: string; label: string; value: string }> {
  const config = LAYER_DISPLAY_CONFIGS[layerId];
  const result: Array<{ key: string; label: string; value: string; priority: number }> = [];

  if (config) {
    // Use configured fields in priority order
    for (const field of config.displayFields) {
      if (field.key in properties) {
        result.push({
          key: field.key,
          label: field.label,
          value: formatPropertyValue(properties[field.key], field.transform),
          priority: field.priority,
        });
      }
    }
  } else {
    // Fallback: show all non-hidden fields
    let priority = 1;
    for (const [key, value] of Object.entries(properties)) {
      if (!isFieldHidden(layerId, key)) {
        result.push({
          key,
          label: formatFieldLabel(key),
          value: formatPropertyValue(value),
          priority: priority++,
        });
      }
    }
  }

  // Sort by priority and return without priority field
  return result
    .sort((a, b) => a.priority - b.priority)
    .map(({ key, label, value }) => ({ key, label, value }));
}

/**
 * Convert a field key to a display label.
 * E.g., "ZONING_DESC" → "Zoning Desc"
 */
export function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a layer is a zoning layer.
 */
export function isZoningLayer(layerId: string): boolean {
  return layerId === 'zoning' || layerId === 'zoning_detailed';
}

/**
 * Check if a layer is a transit layer.
 */
export function isTransitLayer(layerId: string): boolean {
  return layerId === 'transit_stops' || layerId === 'transit_routes' || layerId === 'light_rail';
}

/**
 * Check if a layer is the parks & open space layer.
 */
export function isParkLayer(layerId: string): boolean {
  return layerId === PARKS_LAYER_ID;
}
