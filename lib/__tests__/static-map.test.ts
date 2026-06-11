import { describe, expect, test } from 'bun:test';
import { staticMapUrl, STATIC_MAP_WIDTH, STATIC_MAP_HEIGHT } from '@/lib/static-map';

const BOUNDS: [number, number, number, number] = [-122.328, 47.613, -122.305, 47.632];

describe('staticMapUrl', () => {
  test('builds a bbox-fitted Static Images URL', () => {
    const url = staticMapUrl(BOUNDS, { token: 'test-token' });
    expect(url).toBe(
      'https://api.mapbox.com/styles/v1/dwahbe/cmq9vnkp4002901qz8bk094jy/static/' +
        `[-122.328,47.613,-122.305,47.632]/${STATIC_MAP_WIDTH}x${STATIC_MAP_HEIGHT}@2x` +
        '?padding=20&access_token=test-token'
    );
  });

  test('honors custom dimensions', () => {
    const url = staticMapUrl(BOUNDS, { token: 'test-token', width: 400, height: 250 });
    expect(url).toContain('/400x250@2x');
  });

  test('returns null without a token', () => {
    const original = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    try {
      expect(staticMapUrl(BOUNDS)).toBeNull();
    } finally {
      if (original !== undefined) process.env.NEXT_PUBLIC_MAPBOX_TOKEN = original;
    }
  });
});
