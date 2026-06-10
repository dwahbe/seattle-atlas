import { describe, expect, test } from 'bun:test';
import { getLegendCategories } from '@/lib/layers';

describe('getLegendCategories', () => {
  test('dedupes the zoning legend into the six simplified categories', () => {
    const categories = getLegendCategories('zoning');
    expect(categories.map((c) => c.label)).toEqual([
      'Homes & Small Shops',
      'Midsize Buildings',
      'Shops & Mixed-Use',
      'Downtown & Towers',
      'Institutions',
      'Industrial',
    ]);
    for (const category of categories) {
      expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test('returns empty for unknown layers', () => {
    expect(getLegendCategories('nope')).toEqual([]);
  });
});
