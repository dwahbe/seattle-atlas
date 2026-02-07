import { describe, test, expect } from 'bun:test';
import { coordsSchema, permitsQuerySchema, walkscoreQuerySchema } from '../validation';

describe('coordsSchema', () => {
  test('parses valid Seattle coordinates', () => {
    const result = coordsSchema.safeParse({ lat: '47.6062', lng: '-122.3321' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBeCloseTo(47.6062);
      expect(result.data.lng).toBeCloseTo(-122.3321);
    }
  });

  test('parses numeric values directly', () => {
    const result = coordsSchema.safeParse({ lat: 47.6, lng: -122.3 });
    expect(result.success).toBe(true);
  });

  test('rejects missing lat', () => {
    const result = coordsSchema.safeParse({ lng: '-122.3' });
    expect(result.success).toBe(false);
  });

  test('rejects missing lng', () => {
    const result = coordsSchema.safeParse({ lat: '47.6' });
    expect(result.success).toBe(false);
  });

  test('rejects lat out of range (>90)', () => {
    const result = coordsSchema.safeParse({ lat: '91', lng: '-122' });
    expect(result.success).toBe(false);
  });

  test('rejects lat out of range (<-90)', () => {
    const result = coordsSchema.safeParse({ lat: '-91', lng: '-122' });
    expect(result.success).toBe(false);
  });

  test('rejects lng out of range (>180)', () => {
    const result = coordsSchema.safeParse({ lat: '47', lng: '181' });
    expect(result.success).toBe(false);
  });

  test('rejects non-numeric strings', () => {
    const result = coordsSchema.safeParse({ lat: 'abc', lng: '-122' });
    expect(result.success).toBe(false);
  });

  test('accepts boundary values', () => {
    expect(coordsSchema.safeParse({ lat: '90', lng: '180' }).success).toBe(true);
    expect(coordsSchema.safeParse({ lat: '-90', lng: '-180' }).success).toBe(true);
  });
});

describe('permitsQuerySchema', () => {
  test('applies default radius and limit', () => {
    const result = permitsQuerySchema.safeParse({ lat: '47.6', lng: '-122.3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(300);
      expect(result.data.limit).toBe(10);
    }
  });

  test('accepts custom radius and limit', () => {
    const result = permitsQuerySchema.safeParse({
      lat: '47.6',
      lng: '-122.3',
      radius: '500',
      limit: '20',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.radius).toBe(500);
      expect(result.data.limit).toBe(20);
    }
  });

  test('rejects radius > 5000', () => {
    const result = permitsQuerySchema.safeParse({
      lat: '47.6',
      lng: '-122.3',
      radius: '6000',
    });
    expect(result.success).toBe(false);
  });

  test('rejects limit > 50', () => {
    const result = permitsQuerySchema.safeParse({
      lat: '47.6',
      lng: '-122.3',
      limit: '100',
    });
    expect(result.success).toBe(false);
  });

  test('rejects limit < 1', () => {
    const result = permitsQuerySchema.safeParse({
      lat: '47.6',
      lng: '-122.3',
      limit: '0',
    });
    expect(result.success).toBe(false);
  });
});

describe('walkscoreQuerySchema', () => {
  test('applies default empty address', () => {
    const result = walkscoreQuerySchema.safeParse({ lat: '47.6', lng: '-122.3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe('');
    }
  });

  test('accepts optional address', () => {
    const result = walkscoreQuerySchema.safeParse({
      lat: '47.6',
      lng: '-122.3',
      address: '123 Main St',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe('123 Main St');
    }
  });

  test('rejects address longer than 200 chars', () => {
    const result = walkscoreQuerySchema.safeParse({
      lat: '47.6',
      lng: '-122.3',
      address: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
