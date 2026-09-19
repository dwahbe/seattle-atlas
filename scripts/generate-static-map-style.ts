/**
 * Generate Mapbox Studio styles for the neighborhood static map previews:
 * a base style plus the site's zoning (and optionally parks) layers, colored
 * exactly like data/layers.json and inserted beneath the base water layer.
 *
 * Run: bun scripts/generate-static-map-style.ts
 * Then: bun scripts/upload-static-map-style.ts — pushes both emitted files to
 * the existing Studio styles in place, so the style ids (STATIC_MAP_STYLE in
 * lib/static-map.ts) never change. Re-run both if the zoning legend colors
 * ever change.
 */
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import layersConfig from '../data/layers.json';
import type { LayerConfig } from '../types';
import { buildColorExpression } from '../lib/map-expressions';

interface Variant {
  file: string;
  name: string;
  base: string;
  /** Lower than the live map's 0.7 — static previews shrink the basemap
   * labels, so the fills need to give them more contrast. */
  zoningOpacity: number;
  /** Parks are skipped on satellite — the imagery already shows greenery. */
  parks: boolean;
  /** light-v11's labels are pale monochrome grays (hsl 220,1%,49–71%) tuned
   * for a near-white canvas; over the saturated zoning fills they drop below
   * 3:1. When set, land labels above the fills get dark ink + a solid white
   * halo so text contrasts against its own halo regardless of fill color.
   * Satellite's white-text/dark-halo labels already pass and are left alone. */
  legibleLabels: boolean;
  /** The fills sit beneath the base style's `water` fill so nothing colors
   * the water (the city's zoning covers platted tidelands off Magnolia).
   * satellite-streets has no water fill (the imagery shows the water), so it
   * gets a flat one in this tone, placed above the fills. */
  waterFallbackColor?: string;
}

const VARIANTS: Variant[] = [
  {
    file: 'static-map-style.json',
    name: 'Seattle Atlas Static',
    base: 'mapbox/light-v11',
    zoningOpacity: 0.5,
    parks: true,
    legibleLabels: true,
  },
  {
    file: 'static-map-style-satellite.json',
    name: 'Seattle Atlas Static Satellite',
    base: 'mapbox/satellite-streets-v12',
    zoningOpacity: 0.45,
    parks: false,
    legibleLabels: false,
    waterFallbackColor: 'hsl(207, 32%, 28%)',
  },
];

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set');
  process.exit(1);
}

const configLayers = layersConfig as unknown as LayerConfig[];
const zoning = configLayers.find((l) => l.id === 'zoning');
const parks = configLayers.find((l) => l.id === 'parks_open_space');
if (!zoning || !parks) {
  console.error('zoning / parks_open_space not found in data/layers.json');
  process.exit(1);
}

function fillLayer(layer: LayerConfig, id: string, source: string, opacity?: number) {
  return {
    id,
    type: 'fill',
    source,
    'source-layer': layer.sourceLayer,
    paint: {
      'fill-color': buildColorExpression(layer),
      'fill-opacity': opacity ?? layer.paint?.['fill-opacity'] ?? 0.7,
      'fill-outline-color': layer.paint?.['fill-outline-color'] ?? '#2B3340',
    },
  };
}

for (const variant of VARIANTS) {
  const res = await fetch(
    `https://api.mapbox.com/styles/v1/${variant.base}?access_token=${token}`,
    // The token is URL-restricted; a matching Referer satisfies it.
    { headers: { Referer: 'http://localhost:3000/' } }
  );
  if (!res.ok) {
    console.error(`Failed to fetch ${variant.base}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const style = (await res.json()) as Record<string, unknown> & {
    layers: Array<{ id: string; type: string }>;
    sources: Record<string, unknown>;
  };

  // Strip account metadata so Studio treats the upload as a new style.
  for (const key of ['id', 'owner', 'created', 'modified', 'visibility', 'protected', 'draft']) {
    delete style[key];
  }
  style.name = variant.name;

  style.sources['seattle-zoning'] = { type: 'vector', url: zoning.tileset };
  const added: Record<string, unknown>[] = [
    fillLayer(zoning, 'seattle-atlas-zoning', 'seattle-zoning', variant.zoningOpacity),
  ];
  if (variant.parks) {
    style.sources['seattle-parks'] = { type: 'vector', url: parks.tileset };
    // Parks above zoning, matching the live map's z-order.
    added.push(fillLayer(parks, 'seattle-atlas-parks', 'seattle-parks'));
  }

  // Fills go beneath the base style's water fill, matching the live map
  // (MapLayers.findBeforeId): water, piers, bridges, roads, and labels paint
  // above the tint, and nothing colors the water. Satellite bases have no
  // water fill, so they get a flat one placed above the fills (see
  // Variant.waterFallbackColor), and the group goes below the first road
  // layer so bridges still cross the water.
  const waterIndex = style.layers.findIndex((l) => l.id === 'water' && l.type === 'fill');
  let insertAt: number;
  if (waterIndex !== -1) {
    insertAt = waterIndex;
  } else {
    added.push({
      id: 'seattle-atlas-water',
      type: 'fill',
      source: 'composite',
      'source-layer': 'water',
      paint: { 'fill-color': variant.waterFallbackColor ?? 'hsl(207, 32%, 28%)' },
    });
    const firstRoadIndex = style.layers.findIndex((l) => /^(tunnel|road|bridge)-/.test(l.id));
    const firstSymbolIndex = style.layers.findIndex((l) => l.type === 'symbol');
    insertAt =
      firstRoadIndex !== -1
        ? firstRoadIndex
        : firstSymbolIndex !== -1
          ? firstSymbolIndex
          : style.layers.length;
  }
  style.layers.splice(insertAt, 0, ...(added as never[]));

  if (variant.legibleLabels) {
    // Skip water labels (they sit on water, never on fills) and route shields
    // (their text sits on the shield graphic).
    const skip = /water|shield/;
    for (const layer of style.layers.slice(insertAt + added.length)) {
      const symbol = layer as { type: string; id: string; paint?: Record<string, unknown> };
      if (symbol.type !== 'symbol' || skip.test(symbol.id)) continue;
      symbol.paint ??= {};
      symbol.paint['text-color'] = '#2B3340';
      symbol.paint['text-halo-color'] = 'hsl(0, 0%, 100%)';
      const halo = symbol.paint['text-halo-width'];
      symbol.paint['text-halo-width'] = Math.max(typeof halo === 'number' ? halo : 0, 1.4);
    }
  }

  const outputPath = new URL(`./${variant.file}`, import.meta.url).pathname;
  await writeFile(outputPath, JSON.stringify(style, null, 2));
  console.log(
    `Wrote ${outputPath} (${variant.base} base, ${style.layers.length} layers, inserted at index ${insertAt})`
  );
}

// Keep the emitted JSON in the repo's Prettier style so a regeneration diff
// shows real changes rather than array re-wrapping.
spawnSync(
  'bunx',
  ['prettier', '--write', ...VARIANTS.map((v) => new URL(`./${v.file}`, import.meta.url).pathname)],
  { stdio: 'inherit' }
);
