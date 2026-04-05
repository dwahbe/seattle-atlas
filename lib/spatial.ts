/**
 * Spatial Utilities
 *
 * Functions for calculating distances and spatial relationships.
 * Uses individual Turf.js subpackages to minimize bundle size.
 */

import { point as turfPoint } from '@turf/helpers';
import turfDistance from '@turf/distance';
import turfCentroid from '@turf/centroid';
import type { Geometry } from 'geojson';

/**
 * Get the centroid of a geometry.
 */
export function getCentroid(geometry: Geometry): [number, number] | null {
  try {
    const c = turfCentroid({ type: 'Feature', geometry, properties: {} });
    return c.geometry.coordinates as [number, number];
  } catch {
    return null;
  }
}

/**
 * Get a representative point for a geometry (for polygons, the centroid).
 */
export function getRepresentativePoint(geometry: Geometry): [number, number] | null {
  if (!geometry) return null;

  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates as [number, number];

    case 'MultiPoint':
      if (geometry.coordinates.length > 0) {
        return geometry.coordinates[0] as [number, number];
      }
      return null;

    case 'LineString':
      // Return midpoint
      if (geometry.coordinates.length >= 2) {
        const midIndex = Math.floor(geometry.coordinates.length / 2);
        return geometry.coordinates[midIndex] as [number, number];
      }
      return null;

    case 'MultiLineString':
      if (geometry.coordinates.length > 0 && geometry.coordinates[0].length >= 2) {
        const line = geometry.coordinates[0];
        const midIndex = Math.floor(line.length / 2);
        return line[midIndex] as [number, number];
      }
      return null;

    case 'Polygon':
    case 'MultiPolygon':
      return getCentroid(geometry);

    default:
      return getCentroid(geometry);
  }
}

/**
 * Convert meters to miles.
 */
export function metersToMiles(meters: number): number {
  return Math.round((meters / 1609.344) * 100) / 100;
}

/**
 * Format distance for display.
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    // Show in feet for very short distances
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Check if a point is within a given radius of another point.
 *
 * @param center - Center point [lng, lat]
 * @param point - Point to check [lng, lat]
 * @param radiusMeters - Radius in meters
 */
export function isWithinRadius(
  center: [number, number],
  point: [number, number],
  radiusMeters: number
): boolean {
  const dist = turfDistance(turfPoint(center), turfPoint(point), { units: 'meters' });
  return dist <= radiusMeters;
}
