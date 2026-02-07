import { describe, test, expect } from 'bun:test';
import {
  getRepresentativePoint,
  isWithinRadius,
  metersToMiles,
  formatDistance,
  getCentroid,
} from '../spatial';

describe('getRepresentativePoint', () => {
  test('returns coords directly for Point geometry', () => {
    const point = getRepresentativePoint({
      type: 'Point',
      coordinates: [-122.3321, 47.6062],
    });
    expect(point).toEqual([-122.3321, 47.6062]);
  });

  test('returns centroid for Polygon geometry', () => {
    const point = getRepresentativePoint({
      type: 'Polygon',
      coordinates: [
        [
          [-122.34, 47.6],
          [-122.33, 47.6],
          [-122.33, 47.61],
          [-122.34, 47.61],
          [-122.34, 47.6],
        ],
      ],
    });
    expect(point).not.toBeNull();
    if (point) {
      expect(point[0]).toBeCloseTo(-122.335, 2);
      expect(point[1]).toBeCloseTo(47.605, 2);
    }
  });

  test('returns midpoint for LineString geometry', () => {
    const point = getRepresentativePoint({
      type: 'LineString',
      coordinates: [
        [-122.34, 47.6],
        [-122.33, 47.61],
        [-122.32, 47.62],
      ],
    });
    expect(point).toEqual([-122.33, 47.61]);
  });

  test('returns first coord for MultiPoint geometry', () => {
    const point = getRepresentativePoint({
      type: 'MultiPoint',
      coordinates: [
        [-122.34, 47.6],
        [-122.33, 47.61],
      ],
    });
    expect(point).toEqual([-122.34, 47.6]);
  });

  test('returns null for null geometry', () => {
    const point = getRepresentativePoint(null as unknown as GeoJSON.Geometry);
    expect(point).toBeNull();
  });
});

describe('isWithinRadius', () => {
  const spaceNeedle: [number, number] = [-122.3493, 47.6205];
  const nearbyPoint: [number, number] = [-122.3495, 47.6207]; // ~25m away
  const farPoint: [number, number] = [-122.3321, 47.6062]; // ~2km away

  test('returns true for point inside radius', () => {
    expect(isWithinRadius(spaceNeedle, nearbyPoint, 100)).toBe(true);
  });

  test('returns false for point outside radius', () => {
    expect(isWithinRadius(spaceNeedle, farPoint, 100)).toBe(false);
  });

  test('same point is within any positive radius', () => {
    expect(isWithinRadius(spaceNeedle, spaceNeedle, 1)).toBe(true);
  });
});

describe('metersToMiles', () => {
  test('converts 1609.344 meters to ~1 mile', () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1.0, 1);
  });

  test('converts 0 meters to 0 miles', () => {
    expect(metersToMiles(0)).toBe(0);
  });

  test('converts 100 meters to ~0.06 miles', () => {
    expect(metersToMiles(100)).toBeCloseTo(0.06, 1);
  });
});

describe('formatDistance', () => {
  test('shows feet for very short distances', () => {
    expect(formatDistance(0.05)).toMatch(/ft$/);
  });

  test('shows miles for longer distances', () => {
    expect(formatDistance(0.5)).toBe('0.5 mi');
  });

  test('shows miles for 1 mile', () => {
    expect(formatDistance(1)).toBe('1.0 mi');
  });
});

describe('getCentroid', () => {
  test('returns centroid of a polygon', () => {
    const centroid = getCentroid({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    });
    expect(centroid).not.toBeNull();
    if (centroid) {
      expect(centroid[0]).toBeCloseTo(5, 0);
      expect(centroid[1]).toBeCloseTo(5, 0);
    }
  });
});
