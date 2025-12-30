/**
 * Spatial Utilities
 *
 * Functions for calculating distances and spatial relationships.
 * Uses Turf.js for calculations.
 */

import * as turf from '@turf/turf';
import type { Feature, Point, Geometry } from 'geojson';

export interface NearestTransitResult {
  distance: number; // Distance in miles
  distanceMeters: number; // Distance in meters
  stopName: string;
  stopId: string;
  routes?: string[];
}

/**
 * Find the nearest transit stop to a point.
 *
 * @param point - The point to search from [lng, lat]
 * @param stops - Array of transit stop features
 * @returns The nearest stop info or null if no stops provided
 */
export function findNearestTransitStop(
  point: [number, number],
  stops: Feature<Point>[]
): NearestTransitResult | null {
  if (!stops || stops.length === 0) {
    return null;
  }

  const fromPoint = turf.point(point);
  let nearest: Feature<Point> | null = null;
  let nearestDistance = Infinity;

  for (const stop of stops) {
    if (!stop.geometry || stop.geometry.type !== 'Point') continue;

    const distance = turf.distance(fromPoint, stop, { units: 'meters' });
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = stop;
    }
  }

  if (!nearest) {
    return null;
  }

  const props = nearest.properties || {};

  return {
    distance: metersToMiles(nearestDistance),
    distanceMeters: nearestDistance,
    stopName: props.stop_name || props.name || 'Unknown Stop',
    stopId: props.stop_id || props.id || '',
    routes: parseRoutes(props.routes),
  };
}

/**
 * Get the centroid of a geometry.
 */
export function getCentroid(geometry: Geometry): [number, number] | null {
  try {
    const centroid = turf.centroid({ type: 'Feature', geometry, properties: {} });
    return centroid.geometry.coordinates as [number, number];
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
 * Parse routes string into array.
 */
function parseRoutes(routes: unknown): string[] | undefined {
  if (!routes) return undefined;

  if (Array.isArray(routes)) {
    return routes.map(String);
  }

  if (typeof routes === 'string') {
    // Handle comma-separated or space-separated routes
    return routes
      .split(/[,\s]+/)
      .map((r) => r.trim())
      .filter(Boolean);
  }

  return undefined;
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
  const distance = turf.distance(turf.point(center), turf.point(point), { units: 'meters' });
  return distance <= radiusMeters;
}

/**
 * Get bounding box for a geometry.
 */
export function getBoundingBox(geometry: Geometry): [number, number, number, number] | null {
  try {
    const bbox = turf.bbox({ type: 'Feature', geometry, properties: {} });
    return bbox as [number, number, number, number];
  } catch {
    return null;
  }
}
