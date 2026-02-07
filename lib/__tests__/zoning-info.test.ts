import { describe, test, expect } from 'bun:test';
import { getZoneInfo, getCategoryLabel, getAllZoneCodes } from '../zoning-info';

describe('getZoneInfo', () => {
  test('returns info for a direct match (NR1)', () => {
    const info = getZoneInfo('NR1');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR1');
    expect(info!.name).toBe('Neighborhood Residential 1');
    expect(info!.category).toBe('residential');
    expect(info!.maxHeightFt).toBe(30);
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
    const info = getZoneInfo('nr1');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR1');
  });

  test('trims whitespace', () => {
    const info = getZoneInfo('  NR1  ');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR1');
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

  test('includes NR1', () => {
    expect(getAllZoneCodes()).toContain('NR1');
  });

  test('includes DOC2', () => {
    expect(getAllZoneCodes()).toContain('DOC2');
  });
});
