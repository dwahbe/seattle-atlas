import { describe, expect, test } from 'bun:test';
import {
  parsePinParam,
  serializePinParam,
  buildShareableUrl,
  hasMapStateParams,
  hasPinParam,
  SEATTLE_CENTER,
} from '@/lib/url-state';

describe('parsePinParam', () => {
  test('parses "lat,lng" into internal [lng, lat]', () => {
    expect(parsePinParam('47.606200,-122.332100')).toEqual([-122.3321, 47.6062]);
  });

  test('returns null for empty or missing values', () => {
    expect(parsePinParam('')).toBeNull();
    expect(parsePinParam(null)).toBeNull();
    expect(parsePinParam(undefined)).toBeNull();
  });

  test('returns null for malformed values', () => {
    expect(parsePinParam('47.6062')).toBeNull();
    expect(parsePinParam('47.6062,-122.3321,3')).toBeNull();
    expect(parsePinParam('foo,bar')).toBeNull();
    expect(parsePinParam('47.6062,')).toBeNull();
  });

  test('returns null for out-of-range coordinates', () => {
    expect(parsePinParam('91,-122.3321')).toBeNull();
    expect(parsePinParam('47.6062,-181')).toBeNull();
  });
});

describe('serializePinParam', () => {
  test('serializes internal [lng, lat] as "lat,lng" with 6 decimals', () => {
    expect(serializePinParam([-122.3321, 47.6062])).toBe('47.606200,-122.332100');
  });

  test('serializes null as the empty string', () => {
    expect(serializePinParam(null)).toBe('');
  });

  test('round-trips through parsePinParam', () => {
    const position: [number, number] = [-122.332112, 47.606234];
    expect(parsePinParam(serializePinParam(position))).toEqual(position);
  });

  // Mapbox reports unwrapped longitudes after panning across world copies, so
  // a Seattle click can arrive as 237.6679 — it must still parse back.
  test('wraps unwrapped longitudes into [-180, 180]', () => {
    expect(serializePinParam([-122.3321 + 360, 47.6062])).toBe('47.606200,-122.332100');
    expect(serializePinParam([-122.3321 - 360, 47.6062])).toBe('47.606200,-122.332100');
    expect(parsePinParam(serializePinParam([-122.3321 + 360, 47.6062]))).toEqual([
      -122.3321, 47.6062,
    ]);
  });
});

describe('hasPinParam', () => {
  test('detects an inspect pin', () => {
    expect(hasPinParam('?pin=47.606200,-122.332100')).toBe(true);
  });

  test('is false for map links without a pin', () => {
    expect(hasPinParam('?lat=47.61&lng=-122.33')).toBe(false);
    expect(hasPinParam('')).toBe(false);
  });
});

describe('buildShareableUrl', () => {
  const defaults = {
    lat: SEATTLE_CENTER.lat,
    lng: SEATTLE_CENTER.lng,
    zoom: SEATTLE_CENTER.zoom,
    layers: ['zoning', 'parks_open_space', 'institutions'],
    filters: {},
    inspectedFeatureId: null,
    pinPosition: null,
    compare: false,
  };

  test('omits all params at the default state', () => {
    expect(buildShareableUrl(defaults)).toBe('/');
  });

  test('includes inspect and pin when a feature is inspected', () => {
    const url = buildShareableUrl({
      ...defaults,
      inspectedFeatureId: '305',
      pinPosition: [-122.3321, 47.6062],
    });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('inspect')).toBe('305');
    expect(params.get('pin')).toBe('47.606200,-122.332100');
  });

  test('omits pin when there is no marker', () => {
    const url = buildShareableUrl({ ...defaults, inspectedFeatureId: '305' });
    expect(url).toBe('/?inspect=305');
  });
});

describe('hasMapStateParams', () => {
  test('treats a pin-bearing URL as a map-state deep link', () => {
    expect(hasMapStateParams('?pin=47.606200,-122.332100')).toBe(true);
  });

  test('ignores unrelated params', () => {
    expect(hasMapStateParams('?utm_source=share')).toBe(false);
  });
});
