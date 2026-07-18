import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BRAND_ICON_SVG } from '../brand-icon';

const root = join(import.meta.dir, '..', '..');

// The brand mark exists in three encodings: the BRAND_ICON_SVG constant
// (consumed by the apple-icon route and the social-card script), app/icon.svg
// (Next metadata file), and BrandMark.tsx (JSX). These tests turn "keep them
// in sync" from a convention into a CI failure.
describe('brand mark copies stay in sync', () => {
  test('app/icon.svg matches BRAND_ICON_SVG byte for byte', () => {
    const file = readFileSync(join(root, 'app', 'icon.svg'), 'utf8');
    expect(file.trim()).toBe(BRAND_ICON_SVG.trim());
  });

  test('BrandMark.tsx draws the same geometry and colors', () => {
    const source = readFileSync(join(root, 'components', 'ui', 'BrandMark.tsx'), 'utf8');

    const paths = [...BRAND_ICON_SVG.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    for (const d of paths) {
      expect(source).toContain(d);
    }

    const rects = [...BRAND_ICON_SVG.matchAll(/<rect ([^/]+)\/>/g)].map((m) => m[1].trim());
    expect(rects.length).toBeGreaterThan(0);
    for (const rect of rects) {
      // JSX uses the same attribute syntax for rects (no camelCase needed)
      expect(source).toContain(rect);
    }

    const colors = [...BRAND_ICON_SVG.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map(
      (m) => m[1]
    );
    for (const color of colors) {
      expect(source).toContain(color);
    }
  });
});
