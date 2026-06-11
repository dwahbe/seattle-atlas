import { describe, expect, test } from 'bun:test';
import type { LayerConfig } from '@/types';
import { getLayerPaint, buildFilterExpression } from '@/lib/mapbox';
import { getLayerById } from '@/lib/layers';

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

  test('selecting both categories shows all SM polygons one way or the other', () => {
    const expr = buildFilterExpression(zoning, {
      zone_category: [...shopsValues, ...highriseValues],
    }) as unknown[];
    expect(expr[0]).toBe('any');
    const json = JSON.stringify(expr);
    // Tower designations appear as a positive condition, not only an exclusion
    expect(json.split('"SM-NG 240"').length).toBeGreaterThan(2);
  });

  test('legend pseudo value stays in sync with the filter options', () => {
    const legendValues = zoning.legend.map((i) => i.value);
    const filterValues = zoning.filters![0].options!.map((o) => o.value);
    expect(legendValues).toContain(override.value);
    expect(filterValues).toContain(override.value);
    expect(legendValues.sort()).toEqual(filterValues.sort());
  });
});
