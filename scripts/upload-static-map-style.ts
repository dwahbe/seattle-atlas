/**
 * Static Map Style Publish
 * ------------------------
 * Pushes the JSON emitted by generate-static-map-style.ts to the Studio
 * styles the site already references, via the Styles API's PATCH endpoint.
 * Updating in place keeps the style ids, so lib/static-map.ts needs no change
 * and the neighborhood previews pick the update up as their image cache turns.
 *
 * After each update the script re-reads the published and draft versions and
 * checks that the site's own layers (ids prefixed `seattle-atlas-`) are in the
 * published one, so a Studio-side "publish" step is never silently missed.
 *
 * Needs MAPBOX_UPLOAD_TOKEN in .env.local with the styles:write scope (the
 * same secret token upload-parks-tileset.ts uses, with one more scope).
 *
 * Run with:
 *   bun scripts/generate-static-map-style.ts && bun scripts/upload-static-map-style.ts
 */

import { readFile } from 'node:fs/promises';
import { STATIC_MAP_STYLE, STATIC_MAP_STYLE_LIGHT } from '../lib/static-map';
import { mapboxFetch } from './lib/mapbox-api';

const SITE_LAYER_PREFIX = 'seattle-atlas-';

interface StyleTarget {
  file: string;
  styleId: string;
}

const STYLES: StyleTarget[] = [
  // Live: the satellite variant the neighborhood previews render from
  // (STATIC_MAP_STYLE in lib/static-map.ts).
  { file: 'static-map-style-satellite.json', styleId: STATIC_MAP_STYLE },
  // Published alongside it; not used by the previews.
  { file: 'static-map-style.json', styleId: STATIC_MAP_STYLE_LIGHT },
];

interface StyleDoc {
  name: string;
  modified?: string;
  layers: { id: string }[];
}

function hasSiteLayers(style: StyleDoc, siteLayerIds: string[]): boolean {
  const present = new Set(style.layers.map((l) => l.id));
  return siteLayerIds.every((id) => present.has(id));
}

async function main() {
  const token = process.env.MAPBOX_UPLOAD_TOKEN;
  if (!token) {
    console.error(
      'MAPBOX_UPLOAD_TOKEN is not set. Add a secret token with the styles:write scope to .env.local.'
    );
    process.exit(1);
  }

  let needsStudioPublish = false;
  for (const target of STYLES) {
    const body = JSON.parse(
      await readFile(new URL(`./${target.file}`, import.meta.url), 'utf8')
    ) as StyleDoc;
    const siteLayerIds = body.layers
      .map((l) => l.id)
      .filter((id) => id.startsWith(SITE_LAYER_PREFIX));

    process.stdout.write(
      `Updating ${target.styleId} from ${target.file} (${body.layers.length} layers, site layers: ${siteLayerIds.join(', ')})... `
    );
    const updated = await mapboxFetch<StyleDoc>(token, `/styles/v1/${target.styleId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`ok (modified ${updated.modified})`);

    // `fresh` bypasses the Styles API's response cache so the check reads
    // what was just written.
    const fresh = { fresh: 'true' };
    const published = await mapboxFetch<StyleDoc>(
      token,
      `/styles/v1/${target.styleId}`,
      undefined,
      fresh
    );
    const draft = await mapboxFetch<StyleDoc>(
      token,
      `/styles/v1/${target.styleId}/draft`,
      undefined,
      fresh
    );
    const publishedOk = hasSiteLayers(published, siteLayerIds);
    console.log(
      `  published: ${publishedOk ? 'has all site layers' : 'MISSING site layers'} (modified ${published.modified})`
    );
    console.log(
      `  draft:     ${hasSiteLayers(draft, siteLayerIds) ? 'has all site layers' : 'MISSING site layers'} (modified ${draft.modified})`
    );
    if (!publishedOk) needsStudioPublish = true;
  }

  if (needsStudioPublish) {
    console.log(
      '\nACTION NEEDED: the API updated only the draft. Open the style in Mapbox Studio and publish it.'
    );
    process.exit(2);
  }
  console.log('\nBoth styles are published with the current layers.');
}

main().catch((err) => {
  console.error('\nStyle update failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
