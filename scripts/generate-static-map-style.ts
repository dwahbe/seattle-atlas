/**
 * Generate Mapbox Studio styles for the neighborhood static map previews:
 * a base style plus the site's zoning (and optionally parks) layers, colored
 * exactly like data/layers.json and inserted below all labels.
 *
 * Run: bun scripts/generate-static-map-style.ts
 * Then upload an emitted JSON in Mapbox Studio (Create a style → Upload),
 * publish it, and point STATIC_MAP_STYLE in lib/static-map.ts at the new
 * style id. Re-run and re-upload if the zoning legend colors ever change.
 */
import { writeFile } from 'node:fs/promises';
import layersConfig from '../data/layers.json';

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
  },
];

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (!token) {
  console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set');
  process.exit(1);
}

interface LegendItem {
  value: string;
  color: string;
}

interface ValueOverride {
  value: string;
  property: string;
  matchValues: string[];
}

interface ConfigLayer {
  id: string;
  tileset: string;
  sourceLayer: string;
  colorProperty?: string;
  legend: LegendItem[];
  valueOverrides?: ValueOverride[];
  paint?: Record<string, unknown>;
}

const configLayers = layersConfig as unknown as ConfigLayer[];
const zoning = configLayers.find((l) => l.id === 'zoning');
const parks = configLayers.find((l) => l.id === 'parks_open_space');
if (!zoning || !parks) {
  console.error('zoning / parks_open_space not found in data/layers.json');
  process.exit(1);
}

// Same shape as buildColorExpression in lib/mapbox.ts (which is client-only).
function colorExpression(layer: ConfigLayer): unknown {
  if (layer.legend.length === 1) return layer.legend[0].color;
  const overrides = layer.valueOverrides ?? [];
  const overrideValues = new Set(overrides.map((o) => o.value));
  const match: unknown[] = ['match', ['get', layer.colorProperty ?? 'ZONELUT']];
  for (const item of layer.legend) {
    if (overrideValues.has(item.value)) continue;
    match.push(item.value, item.color);
  }
  match.push('#9CA3AF');
  if (overrides.length === 0) return match;

  // Overrides (e.g. tower-zoned SM → Downtown & Highrise) win over the base match.
  const caseExpr: unknown[] = ['case'];
  for (const override of overrides) {
    const item = layer.legend.find((i) => i.value === override.value);
    if (!item) continue;
    caseExpr.push(
      ['in', ['get', override.property], ['literal', override.matchValues]],
      item.color
    );
  }
  caseExpr.push(match);
  return caseExpr;
}

function fillLayer(layer: ConfigLayer, id: string, source: string, opacity?: number) {
  return {
    id,
    type: 'fill',
    source,
    'source-layer': layer.sourceLayer,
    paint: {
      'fill-color': colorExpression(layer),
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
  const added = [
    fillLayer(zoning, 'seattle-atlas-zoning', 'seattle-zoning', variant.zoningOpacity),
  ];
  if (variant.parks) {
    style.sources['seattle-parks'] = { type: 'vector', url: parks.tileset };
    // Parks above zoning, matching the live map's z-order.
    added.push(fillLayer(parks, 'seattle-atlas-parks', 'seattle-parks'));
  }

  // Insert below all labels.
  const firstSymbolIndex = style.layers.findIndex((l) => l.type === 'symbol');
  const insertAt = firstSymbolIndex === -1 ? style.layers.length : firstSymbolIndex;
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
