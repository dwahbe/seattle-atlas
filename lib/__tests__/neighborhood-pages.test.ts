import { describe, expect, test } from 'bun:test';
import {
  NEIGHBORHOOD_PAGES,
  getNeighborhoodPage,
  neighborhoodMapHref,
} from '@/data/neighborhood-pages';
import { NEIGHBORHOODS } from '@/data/neighborhoods';

describe('NEIGHBORHOOD_PAGES', () => {
  test('every page name matches a NEIGHBORHOODS entry (bounds join)', () => {
    const names = new Set(NEIGHBORHOODS.map((n) => n.name));
    for (const page of NEIGHBORHOOD_PAGES) {
      expect(names.has(page.name)).toBe(true);
    }
  });

  test('every NEIGHBORHOODS entry has a page', () => {
    const pageNames = new Set(NEIGHBORHOOD_PAGES.map((p) => p.name));
    for (const neighborhood of NEIGHBORHOODS) {
      expect(pageNames.has(neighborhood.name)).toBe(true);
    }
  });

  test('slugs are unique and URL-safe', () => {
    const slugs = NEIGHBORHOOD_PAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  test('every page has content', () => {
    for (const page of NEIGHBORHOOD_PAGES) {
      expect(page.description.length).toBeGreaterThan(50);
      expect(page.description.length).toBeLessThanOrEqual(170);
      expect(page.paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(page.highlights.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('getNeighborhoodPage resolves slugs and rejects unknowns', () => {
    expect(getNeighborhoodPage('capitol-hill')?.name).toBe('Capitol Hill');
    expect(getNeighborhoodPage('narnia')).toBeUndefined();
  });

  test('map hrefs are valid deep links within Seattle', () => {
    for (const page of NEIGHBORHOOD_PAGES) {
      const href = neighborhoodMapHref(page);
      const params = new URLSearchParams(href.slice(2));
      const lat = Number(params.get('lat'));
      const lng = Number(params.get('lng'));
      const z = Number(params.get('z'));
      expect(href.startsWith('/?lat=')).toBe(true);
      expect(lat).toBeGreaterThan(47.4);
      expect(lat).toBeLessThan(47.8);
      expect(lng).toBeGreaterThan(-122.5);
      expect(lng).toBeLessThan(-122.2);
      expect(z).toBeGreaterThanOrEqual(12);
      expect(z).toBeLessThanOrEqual(15);
    }
  });
});
