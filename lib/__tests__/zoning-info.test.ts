import { describe, test, expect } from 'bun:test';
import { getZoneInfo, getAllZoneCodes } from '../zoning-info';

describe('getZoneInfo', () => {
  test('returns info for a direct match (NR)', () => {
    // NR1/NR2/NR3 were collapsed into a single NR zone by Ordinance 127376
    // (effective Jan 21, 2026). Height: 32 ft base, up to 42 ft when bonus
    // standards are met (seattle.gov middle housing code summary).
    const info = getZoneInfo('NR');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('NR');
    expect(info!.name).toBe('Neighborhood Residential');
    expect(info!.category).toBe('residential');
    expect(info!.maxHeight).toBe('32–42 ft');
    expect(info!.maxHeightFt).toBe(42);
  });

  test('NR surfaces the corner-store hours rule', () => {
    const info = getZoneInfo('NR');
    expect(info!.useNotes!.join(' ')).toContain('6 AM');
    expect(info!.useNotes!.join(' ')).toContain('10 PM');
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
    // Base entry spans the designation range (NC3-40 … NC3P-200); the real
    // per-parcel limit comes from the ZONING designation.
    expect(info!.maxHeightFt).toBe(200);
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

  // Full ZONING designations (tileset's ZONING property), verified against the
  // City of Seattle "Current Land Use Zoning Detail" dataset (June 2026).
  test('applies a full SM designation: U District tower zone', () => {
    const info = getZoneInfo('SM', 'SM-U 95-320 (M1)');
    expect(info).not.toBeNull();
    expect(info!.code).toBe('SM-U 95-320');
    expect(info!.name).toBe('Seattle Mixed — U District');
    expect(info!.maxHeight).toBe('320 ft');
    expect(info!.maxHeightFt).toBe(320);
    expect(info!.category).toBe('mixed');
  });

  test('applies a slash-form SM designation: South Lake Union', () => {
    const info = getZoneInfo('SM', 'SM-SLU 240/125-440');
    expect(info!.code).toBe('SM-SLU 240/125-440');
    expect(info!.name).toBe('Seattle Mixed — South Lake Union');
    expect(info!.maxHeightFt).toBe(440);
    expect(info!.maxHeight).toBe('440 ft');
  });

  test('applies SM designations for Northgate and Uptown', () => {
    expect(getZoneInfo('SM', 'SM-NG 240')!.maxHeightFt).toBe(240);
    expect(getZoneInfo('SM', 'SM-NG 240')!.name).toBe('Seattle Mixed — Northgate');
    // SM-UP must resolve to Uptown, not U District (prefix overlap)
    const uptown = getZoneInfo('SM', 'SM-UP 160 (M)');
    expect(uptown!.name).toBe('Seattle Mixed — Uptown');
    expect(uptown!.maxHeightFt).toBe(160);
  });

  test('does not treat the digit in a base code as a height (NC3P-200)', () => {
    const info = getZoneInfo('NC3', 'NC3P-200 (M)');
    expect(info!.code).toBe('NC3P-200');
    expect(info!.maxHeightFt).toBe(200);
    expect(info!.name).toBe('Neighborhood Commercial 3');
  });

  test('marks unlimited downtown heights with a plus (DOC1 U/450-U)', () => {
    const info = getZoneInfo('DOC1', 'DOC1 U/450-U');
    expect(info!.maxHeight).toBe('450+ ft');
    expect(info!.maxHeightFt).toBe(450);
  });

  test('industrial "U" means unlimited FAR, not height (MML U/45)', () => {
    const info = getZoneInfo('MML', 'MML U/45');
    expect(info!.maxHeight).toBe('45 ft');
    expect(info!.maxHeightFt).toBe(45);
  });

  test('applies MHA heights when the designation has an (M) suffix but no number', () => {
    // MHA (2019) raised heights in zones without numeric suffixes:
    // HR 300 → 440 ft, MR → 80 ft, LR3 → 40–50 ft (SDCI/HALA zone summaries).
    expect(getZoneInfo('HR', 'HR (M)')!.maxHeight).toBe('440 ft');
    expect(getZoneInfo('HR', 'HR (M)')!.maxHeightFt).toBe(440);
    expect(getZoneInfo('MR', 'MR (M1)')!.maxHeight).toBe('80 ft');
    expect(getZoneInfo('MR', 'MR RC (M)')!.maxHeightFt).toBe(80);
    expect(getZoneInfo('LR3', 'LR3 (M2)')!.maxHeight).toBe('40–50 ft');
    expect(getZoneInfo('LR2', 'LR2 (M)')!.maxHeight).toBe('30–40 ft');
  });

  test('keeps base heights for designations without an MHA suffix', () => {
    expect(getZoneInfo('LR2', 'LR2')!.maxHeight).toBe('30 ft');
    // "(0.75)" is a FAR variant, not an MHA suffix
    expect(getZoneInfo('LR2', 'LR2 (0.75)')!.maxHeight).toBe('30 ft');
    expect(getZoneInfo('MR', 'MR')!.maxHeight).toBe('60–75 ft');
  });

  test('MIO compound designations use the institution cap, not the underlying zone', () => {
    // The displayed entry is the overlay regime, so the MIO cap wins even
    // when the underlying zone's limit is larger (designations verified
    // against the city dataset, June 2026).
    const info = getZoneInfo('MIO', 'MIO-160-NC3-200 (M)');
    expect(info!.code).toBe('MIO-160-NC3-200');
    expect(info!.maxHeightFt).toBe(160);
    expect(getZoneInfo('MIO', 'MIO-70-NC3P-200 (M)')!.maxHeightFt).toBe(70);
    expect(getZoneInfo('MIO', 'MIO-37-MML U/45')!.maxHeightFt).toBe(37);
    expect(getZoneInfo('MIO', 'MIO-160-HR (M)')!.maxHeight).toBe('160 ft');
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

  test('includes allowedUses for NR', () => {
    const info = getZoneInfo('NR');
    expect(info).not.toBeNull();
    expect(info!.allowedUses.length).toBeGreaterThan(0);
    expect(info!.allowedUses).toContain('Corner stores & cafes');
    expect(info!.allowedUses).toContain('Multiplexes (up to 9 units)');
    expect(info!.allowedUses).toContain('Cottage housing & stacked flats');
  });

  test('includes notAllowedUses for NR', () => {
    const info = getZoneInfo('NR');
    expect(info).not.toBeNull();
    expect(info!.notAllowedUses.length).toBeGreaterThan(0);
    expect(info!.notAllowedUses).toContain('Industrial');
  });

  test('all zone codes have allowedUses and notAllowedUses', () => {
    const codes = getAllZoneCodes();
    for (const code of codes) {
      const info = getZoneInfo(code);
      expect(info).not.toBeNull();
      expect(info!.allowedUses.length).toBeGreaterThan(0);
      expect(info!.notAllowedUses.length).toBeGreaterThan(0);
    }
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
