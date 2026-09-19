/**
 * Static Map Style Publish
 * ------------------------
 * Pushes the JSON emitted by generate-static-map-style.ts to the Studio
 * style the site already references, via the Styles API's PATCH endpoint.
 * Updating in place keeps the style ids, so lib/static-map.ts needs no change
 * and the neighborhood previews pick the update up as their image cache turns.
 *
 * The PATCH publishes immediately but leaves Studio's draft copy untouched, so
 * the script writes the same body to the draft as well — otherwise a later
 * "Publish" click in Studio would overwrite the live style with a stale draft.
 * It then re-reads both versions and checks that the site's own layers (ids
 * prefixed `seattle-atlas-`) are present in each.
 *
 * Needs MAPBOX_UPLOAD_TOKEN in .env.local with the styles:write scope (the
 * same secret token upload-parks-tileset.ts uses, with one more scope).
 *
 * Run with:
 *   bun scripts/generate-static-map-style.ts && bun scripts/upload-static-map-style.ts
 */

import { readFile } from 'node:fs/promises';
import { STATIC_MAP_STYLE } from '../lib/static-map';
import { mapboxFetch } from './lib/mapbox-api';

const SITE_LAYER_PREFIX = 'seattle-atlas-';

interface StyleTarget {
  file: string;
  styleId: string;
}

const STYLES: StyleTarget[] = [
  // The satellite style the neighborhood previews render from.
  { file: 'static-map-style-satellite.json', styleId: STATIC_MAP_STYLE },
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

    process.stdout.write('  syncing Studio draft... ');
    const draftUpdated = await mapboxFetch<StyleDoc>(token, `/styles/v1/${target.styleId}/draft`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`ok (modified ${draftUpdated.modified})`);

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
    const draftOk = hasSiteLayers(draft, siteLayerIds);
    console.log(
      `  published: ${publishedOk ? 'has all site layers' : 'MISSING site layers'} (modified ${published.modified})`
    );
    console.log(
      `  draft:     ${draftOk ? 'has all site layers' : 'MISSING site layers'} (modified ${draft.modified})`
    );
    if (!publishedOk || !draftOk) needsStudioPublish = true;
  }

  if (needsStudioPublish) {
    console.log(
      '\nACTION NEEDED: a version is missing the site layers. Open the style in Mapbox Studio and check its draft and published state.'
    );
    process.exit(2);
  }
  console.log('\nThe style is published with the current layers, and its Studio draft matches.');
}

main().catch((err) => {
  console.error('\nStyle update failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
