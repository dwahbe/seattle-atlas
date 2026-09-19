'use client';

import type mapboxgl from 'mapbox-gl';
import { MAP_LABEL_COLORS } from '@/lib/constants';

/**
 * Label design for the base style while a site fill is active.
 *
 * The site's fills sit beneath the base style's labels (see restackBaseWater),
 * so the labels draw on top of the zoning tint, where Mapbox's defaults — pale
 * gray text with a white halo tuned for a near-white canvas — read as a glow
 * and lose contrast. This table restyles each base label class the way a
 * thematic map should: a clear hierarchy through ink, weight, and zoom range
 * (Mapbox's own guidance is to design distinction into the label classes, lead
 * with contrast, and keep minor labels off until they help), crisp text with
 * no halo, and colors from the site's palette so labels match the UI.
 *
 *   place         "Seattle"            primary ink, Bold, base zoom range
 *   neighborhood  "CAPITOL HILL"       primary ink, Bold, lingers to z16 (base z15)
 *   road          street names         secondary ink (primary in dark mode, where
 *                                      the gray loses against the light fills),
 *                                      Medium, from z13 (base z12)
 *   water         "Lake Union"         accent-hue blue, the base's italic
 *   poi/natural   parks, landmarks     secondary/primary as roads, Medium, from z13
 *   airport       "SEA"                secondary/primary as roads, Medium
 *   region        state/country        primary ink (never shown at city zooms)
 *
 * `halo` is a text-halo-width in px (the spec caps it at text-size / 4); 0 is
 * crisp text. `font` is a DIN Pro face the Mapbox font stack provides. Tune
 * here, not in MapLayers.
 */

export type LabelTheme = keyof typeof MAP_LABEL_COLORS;
type LabelInk = keyof (typeof MAP_LABEL_COLORS)['light'];

export interface LabelClass {
  id: string;
  /** Base-style symbol layer ids this class covers. */
  match: RegExp;
  /** One ink for both themes, or one per theme. */
  ink: LabelInk | Record<LabelTheme, LabelInk>;
  halo: number;
  /** Primary face for `text-font`; omitted = keep the base face (e.g. water's italic). */
  font?: 'DIN Pro Regular' | 'DIN Pro Medium' | 'DIN Pro Bold';
  /** Overrides for the base layer's zoom range; omitted = keep the base value. */
  minzoom?: number;
  maxzoom?: number;
}

const ROAD_INK = { light: 'secondary', dark: 'primary' } as const;

export const LABEL_CLASSES: readonly LabelClass[] = [
  {
    id: 'place',
    match: /^settlement-(major|minor)-label$/,
    ink: 'primary',
    halo: 0,
    font: 'DIN Pro Bold',
  },
  {
    id: 'neighborhood',
    match: /^settlement-subdivision-label$/,
    ink: 'primary',
    halo: 0,
    font: 'DIN Pro Bold',
    maxzoom: 16,
  },
  { id: 'road', match: /^road-label/, ink: ROAD_INK, halo: 0, font: 'DIN Pro Medium', minzoom: 13 },
  { id: 'water', match: /^water(way)?-.*label$/, ink: 'water', halo: 0 },
  {
    id: 'poi',
    match: /^(poi|natural-point|natural-line)-label$/,
    ink: ROAD_INK,
    halo: 0,
    font: 'DIN Pro Medium',
    minzoom: 13,
  },
  { id: 'airport', match: /^airport-label$/, ink: ROAD_INK, halo: 0, font: 'DIN Pro Medium' },
  { id: 'region', match: /^(state|country|continent)-label$/, ink: 'primary', halo: 0 },
];

/** Mapbox's font stacks pair a DIN Pro face with an Arial Unicode fallback of matching weight. */
export function fontStack(font: NonNullable<LabelClass['font']>): string[] {
  return [font, font === 'DIN Pro Bold' ? 'Arial Unicode MS Bold' : 'Arial Unicode MS Regular'];
}

function inkFor(cls: LabelClass, theme: LabelTheme): string {
  const ink = typeof cls.ink === 'string' ? cls.ink : cls.ink[theme];
  return MAP_LABEL_COLORS[theme][ink];
}

type TextFont = mapboxgl.DataDrivenPropertyValueSpecification<string[]> | undefined;

/** The base layer's untouched values, so the restyle can be undone. */
export type LabelStyleMemo = Map<
  string,
  {
    color: mapboxgl.DataDrivenPropertyValueSpecification<string> | undefined;
    halo: mapboxgl.DataDrivenPropertyValueSpecification<number> | undefined;
    font: TextFont;
    minzoom: number | undefined;
    maxzoom: number | undefined;
  }
>;

// Apply LABEL_CLASSES to the current base style for `theme`, or put the
// originals back with `theme` null. `memo` holds the untouched values and must
// be cleared when the style reloads. Throws mid style swap (`getStyle`).
export function applyLabelClasses(
  map: mapboxgl.Map,
  theme: LabelTheme | null,
  memo: LabelStyleMemo
): void {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    if (layer.type !== 'symbol') continue;
    const cls = LABEL_CLASSES.find((c) => c.match.test(layer.id));
    if (!cls) continue;

    if (theme === null) {
      const original = memo.get(layer.id);
      if (!original) continue;
      map.setPaintProperty(layer.id, 'text-color', original.color);
      map.setPaintProperty(layer.id, 'text-halo-width', original.halo);
      map.setLayoutProperty(layer.id, 'text-font', original.font);
      map.setLayerZoomRange(layer.id, original.minzoom ?? 0, original.maxzoom ?? 24);
      memo.delete(layer.id);
      continue;
    }

    let original = memo.get(layer.id);
    if (!original) {
      const spec = layer as { paint?: Record<string, unknown>; layout?: Record<string, unknown> };
      original = {
        color: spec.paint?.['text-color'] as
          mapboxgl.DataDrivenPropertyValueSpecification<string> | undefined,
        halo: spec.paint?.['text-halo-width'] as
          mapboxgl.DataDrivenPropertyValueSpecification<number> | undefined,
        font: spec.layout?.['text-font'] as TextFont,
        minzoom: layer.minzoom,
        maxzoom: layer.maxzoom,
      };
      memo.set(layer.id, original);
    }
    map.setPaintProperty(layer.id, 'text-color', inkFor(cls, theme));
    map.setPaintProperty(layer.id, 'text-halo-width', cls.halo);
    if (cls.font) map.setLayoutProperty(layer.id, 'text-font', fontStack(cls.font));
    map.setLayerZoomRange(
      layer.id,
      cls.minzoom ?? original.minzoom ?? 0,
      cls.maxzoom ?? original.maxzoom ?? 24
    );
  }
}
