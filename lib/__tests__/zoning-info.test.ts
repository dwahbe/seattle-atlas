import { describe, test, expect } from 'bun:test';
import { getZoneInfo, getCategoryLabel, getAllZoneCodes } from '../zoning-info';

describe('getZoneInfo', () => {
  test('returns info for a direct match (NR)', () => {
    // NR1/NR2/NR3 were collapsed into a single NR zone by Ordinance 127376
    // (effective Jan 21, 2026). Height bumped from 30 ft to 32 ft.
    const info = getZoneInfo('NR');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR');
    expect(info!.name).toBe('Neighborhood Residential');
    expect(info!.category).toBe('residential');
    expect(info!.maxHeightFt).toBe(32);
  });

  test('resolves legacy RSL code to its historical entry', () => {
    // RSL was rezoned to LR1 in Jan 2026 but getZoneInfo still returns the
    // legacy entry so historical lookups (ZONING_PREV, old bookmarks) resolve.
    const info = getZoneInfo('RSL');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('RSL');
    expect(info!.summary).toContain('legacy');
  });

  test('returns info for NC3', () => {
    const info = getZoneInfo('NC3');
    expect(info).not.toBeNull();
    expect(info!.category).toBe('commercial');
    expect(info!.maxHeightFt).toBe(65);
  });

  test('handles height suffix (NC3-65)', () => {
    const info = getZoneInfo('NC3-65');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NC3-65');
    expect(info!.maxHeight).toBe('65 ft');
    expect(info!.maxHeightFt).toBe(65);
    // Should inherit base NC3 properties
    expect(info!.name).toBe('Neighborhood Commercial 3');
  });

  test('handles height suffix with different height (NC3-85)', () => {
    const info = getZoneInfo('NC3-85');
    expect(info).not.toBeNull();
    expect(info!.maxHeight).toBe('85 ft');
    expect(info!.maxHeightFt).toBe(85);
  });

  test('returns null for unknown zone code', () => {
    expect(getZoneInfo('UNKNOWN')).toBeNull();
    expect(getZoneInfo('XYZ123')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(getZoneInfo('')).toBeNull();
  });

  test('is case-insensitive', () => {
    const info = getZoneInfo('nr');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR');
  });

  test('trims whitespace', () => {
    const info = getZoneInfo('  NR  ');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR');
  });

  test('returns info for downtown zones', () => {
    const info = getZoneInfo('DOC2');
    expect(info).not.toBeNull();
    expect(info!.category).toBe('downtown');
    expect(info!.maxHeightFt).toBe(500);
  });

  test('returns info for industrial zones', () => {
    const info = getZoneInfo('IC');
    expect(info).not.toBeNull();
    expect(info!.category).toBe('industrial');
  });
});

describe('getCategoryLabel', () => {
  test('returns "Residential" for residential', () => {
    expect(getCategoryLabel('residential')).toBe('Residential');
  });

  test('returns "Multi-Family" for multifamily', () => {
    expect(getCategoryLabel('multifamily')).toBe('Multi-Family');
  });

  test('returns "Mixed Use" for mixed', () => {
    expect(getCategoryLabel('mixed')).toBe('Mixed Use');
  });
});

describe('getAllZoneCodes', () => {
  test('returns a non-empty array', () => {
    const codes = getAllZoneCodes();
    expect(codes.length).toBeGreaterThan(0);
  });

  test('includes NR', () => {
    expect(getAllZoneCodes()).toContain('NR');
  });

  test('includes DOC2', () => {
    expect(getAllZoneCodes()).toContain('DOC2');
  });
});
