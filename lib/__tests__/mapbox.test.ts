import { describe, expect, test } from 'bun:test';
import type { LayerConfig } from '@/types';
import { getLayerPaint, buildFilterExpression, resolveLegendItem } from '@/lib/mapbox';
import { getLayerById } from '@/lib/layers';
import { getZoneInfo } from '@/lib/zoning-info';

const zoning = getLayerById('zoning') as LayerConfig;
const override = zoning.valueOverrides![0];

describe('zoning color expression with valueOverrides', () => {
  const fillColor = getLayerPaint(zoning)['fill-color'] as unknown[];

  test('wraps the ZONELUT match in a case that checks ZONING first', () => {
    expect(fillColor[0]).toBe('case');
    expect(fillColor[1]).toEqual(['in', ['get', 'ZONING'], ['literal', override.matchValues]]);
    // Override color matches the Downtown & Highrise legend color
    const highriseColor = zoning.legend.find((i) => i.value === 'HR')!.color;
    expect(fillColor[2]).toBe(highriseColor);
  });

  test('keeps SM in the base match but not the SM_HIGHRISE pseudo value', () => {
    const match = fillColor[3] as unknown[];
    expect(match[0]).toBe('match');
    expect(match).toContain('SM');
    expect(match).not.toContain('SM_HIGHRISE');
  });
});

describe('zoning filter expression with valueOverrides', () => {
  const highriseValues = zoning
    .filters![0].options!.filter((o) => o.label === 'Downtown & Highrise')
    .map((o) => o.value);
  const shopsValues = zoning
    .filters![0].options!.filter((o) => o.label === 'Large Buildings')
    .map((o) => o.value);

  test('Downtown & Highrise selection includes tower SM designations', () => {
    const expr = buildFilterExpression(zoning, { zone_category: highriseValues }) as unknown[];
    expect(expr[0]).toBe('any');
    expect(JSON.stringify(expr)).toContain('SM-U 95-320 (M1)');
  });

  test('Large Buildings selection excludes tower SM designations', () => {
    const expr = buildFilterExpression(zoning, { zone_category: shopsValues }) as unknown[];
    // SM is selected, but tower-zoned SM polygons are carved out so the
    // filter matches the legend coloring.
    const json = JSON.stringify(expr);
    expect(json).toContain('"SM"');
    expect(json).toContain('["!",["in",["get","ZONING"]');
  });

  test('selecting both categories keeps tower SM positive and drops the carve-out', () => {
    const expr = buildFilterExpression(zoning, {
      zone_category: [...shopsValues, ...highriseValues],
    }) as unknown[];
    expect(expr[0]).toBe('any');
    const json = JSON.stringify(expr);
    // The positive tower condition makes the exclusion redundant
    // ((A && !B) || B === A || B), so it is omitted.
    expect(json).toContain('"SM-NG 240"');
    expect(json).not.toContain('["!"');
  });

  test('legend pseudo value stays in sync with the filter options', () => {
    const legendValues = zoning.legend.map((i) => i.value);
    const filterValues = zoning.filters![0].options!.map((o) => o.value);
    expect(legendValues).toContain(override.value);
    expect(filterValues).toContain(override.value);
    expect(legendValues.sort()).toEqual(filterValues.sort());
  });
});

describe('override scoping with multiple filters', () => {
  // A hypothetical second filter on the zoning layer that does not offer
  // the SM_HIGHRISE pseudo value — its conditions must not inherit the
  // tower carve-out.
  const twoFilter: LayerConfig = {
    ...zoning,
    filters: [
      ...zoning.filters!,
      {
        ...zoning.filters![0],
        id: 'iz',
        property: 'IZ',
        options: [
          { label: 'Yes', value: 'Y' },
          { label: 'No', value: 'N' },
        ],
      },
    ],
  };

  test('a filter that does not offer the pseudo value gets no carve-out', () => {
    const expr = buildFilterExpression(twoFilter, { iz: ['Y'] }) as unknown[];
    expect(JSON.stringify(expr)).not.toContain('ZONING');
  });

  test('with both filters active the carve-out stays inside zone_category', () => {
    const expr = buildFilterExpression(twoFilter, {
      iz: ['Y'],
      zone_category: ['NR'],
    }) as unknown[];
    expect(expr[0]).toBe('all');
    const [, zoneCondition, izCondition] = expr as [unknown, unknown, unknown];
    expect(JSON.stringify(zoneCondition)).toContain('["!"');
    expect(JSON.stringify(izCondition)).not.toContain('ZONING');
  });
});

describe('degenerate override config', () => {
  test('falls back to the base match when no override has a legend row', () => {
    // Config drift: the SM_HIGHRISE legend row removed but valueOverrides
    // kept. The builder must emit a valid plain match, not a 2-element
    // 'case' that Mapbox rejects.
    const drifted: LayerConfig = {
      ...zoning,
      legend: zoning.legend.filter((i) => i.value !== override.value),
    };
    const fillColor = getLayerPaint(drifted)['fill-color'] as unknown[];
    expect(fillColor[0]).toBe('match');
  });
});

describe('SM_HIGHRISE matchValues content', () => {
  test('every matchValue parses to a tower-zoned SM designation (240 ft+)', () => {
    expect(override.matchValues.length).toBeGreaterThan(0);
    for (const designation of override.matchValues) {
      const info = getZoneInfo('SM', designation);
      expect(info).not.toBeNull();
      expect(info!.maxHeightFt).toBeGreaterThanOrEqual(240);
    }
  });
});

describe('resolveLegendItem', () => {
  test('overrides win over the ZONELUT lookup', () => {
    const item = resolveLegendItem(zoning, {
      ZONELUT: 'SM',
      ZONING: override.matchValues[0],
    });
    expect(item!.value).toBe(override.value);
  });

  test('falls back to the colorProperty lookup', () => {
    const item = resolveLegendItem(zoning, { ZONELUT: 'NR' });
    expect(item!.label).toBe('Homes & Small Shops');
  });

  test('returns null for unknown values', () => {
    expect(resolveLegendItem(zoning, { ZONELUT: 'NOPE' })).toBeNull();
  });
});
