/**
 * Generate the Mapbox Studio style for the neighborhood static map previews:
 * satellite-streets plus the site's zoning layer, colored exactly like
 * data/layers.json and stacked the way the live map stacks it.
 *
 * Run: bun scripts/generate-static-map-style.ts
 * Then: bun scripts/upload-static-map-style.ts — pushes the emitted file to
 * the existing Studio style in place, so the style id (STATIC_MAP_STYLE in
 * lib/static-map.ts) never changes. Re-run both if the zoning legend colors
 * ever change.
 */
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import layersConfig from '../data/layers.json';
import type { LayerConfig } from '../types';
import { buildColorExpression } from '../lib/map-expressions';

const OUTPUT_FILE = 'static-map-style-satellite.json';
const STYLE_NAME = 'Seattle Atlas Static Satellite';
const BASE_STYLE = 'mapbox/satellite-streets-v12';
/** Lower than the live map's 0.7 — static previews shrink the basemap labels,
 * so the fills need to give them more contrast. */
const ZONING_OPACITY = 0.45;
/** satellite-streets has no water fill (the imagery shows the water), so the
 * style gets a flat one in this tone above the zoning fill, so nothing colors
 * the water (the city's zoning covers platted tidelands off Magnolia). */
const WATER_COLOR = 'hsl(207, 32%, 28%)';
// Parks are deliberately not included: the imagery already shows greenery.

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set');
  process.exit(1);
}

const zoning = (layersConfig as unknown as LayerConfig[]).find((l) => l.id === 'zoning');
if (!zoning) {
  console.error('zoning not found in data/layers.json');
  process.exit(1);
}

const res = await fetch(
  `https://api.mapbox.com/styles/v1/${BASE_STYLE}?access_token=${token}`,
  // The token is URL-restricted; a matching Referer satisfies it.
  { headers: { Referer: 'http://localhost:3000/' } }
);
if (!res.ok) {
  console.error(`Failed to fetch ${BASE_STYLE}: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const style = (await res.json()) as Record<string, unknown> & {
  layers: Array<{ id: string; type: string }>;
  sources: Record<string, unknown>;
};

// Strip account metadata so the file is a plain style document.
for (const key of ['id', 'owner', 'created', 'modified', 'visibility', 'protected', 'draft']) {
  delete style[key];
}
style.name = STYLE_NAME;

style.sources['seattle-zoning'] = { type: 'vector', url: zoning.tileset };
const added = [
  {
    id: 'seattle-atlas-zoning',
    type: 'fill',
    source: 'seattle-zoning',
    'source-layer': zoning.sourceLayer,
    paint: {
      'fill-color': buildColorExpression(zoning),
      'fill-opacity': ZONING_OPACITY,
      'fill-outline-color': zoning.paint?.['fill-outline-color'] ?? '#2B3340',
    },
  },
  {
    id: 'seattle-atlas-water',
    type: 'fill',
    source: 'composite',
    'source-layer': 'water',
    paint: { 'fill-color': WATER_COLOR },
  },
];

// Match the live map's stacking (MapLayers + restackBaseWater): the fill and
// the water above it go in just below the first bridge layer — above surface
// roads and buildings (tinted), below bridges and labels, so bridges still
// cross the water.
const bridge = style.layers.findIndex((l) => /^bridge-/.test(l.id));
const symbol = style.layers.findIndex((l) => l.type === 'symbol');
const insertAt = bridge !== -1 ? bridge : symbol !== -1 ? symbol : style.layers.length;
style.layers.splice(insertAt, 0, ...(added as never[]));

const outputPath = new URL(`./${OUTPUT_FILE}`, import.meta.url).pathname;
await writeFile(outputPath, JSON.stringify(style, null, 2));
console.log(
  `Wrote ${outputPath} (${BASE_STYLE} base, ${style.layers.length} layers, inserted at index ${insertAt})`
);

// Keep the emitted JSON in the repo's Prettier style so a regeneration diff
// shows real changes rather than array re-wrapping.
spawnSync('bunx', ['prettier', '--write', outputPath], { stdio: 'inherit' });
