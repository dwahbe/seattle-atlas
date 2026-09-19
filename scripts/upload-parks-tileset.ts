/**
 * Mapbox Parks Tileset Upload
 * ---------------------------
 * Replaces the parks tileset in place via the Mapbox Uploads API, so the
 * tileset id referenced by data/layers.json (and by the published static-map
 * style) keeps working.
 *
 * Flow:
 *   1. Request temporary S3 staging credentials from Mapbox.
 *   2. PUT the GeoJSON into the staging bucket (SigV4-signed with node:crypto —
 *      no AWS SDK dependency).
 *   3. Create an upload that targets the existing tileset id.
 *   4. Poll until Mapbox finishes processing.
 *   5. Read the tileset's TileJSON and confirm the vector layer name still
 *      matches `sourceLayer` in data/layers.json.
 *
 * Needs MAPBOX_UPLOAD_TOKEN in .env.local — a secret token with the
 * uploads:read and uploads:write scopes. Bun loads .env.local automatically.
 * The token is only ever sent to api.mapbox.com and is never logged.
 *
 * Run with:
 *   bun run scripts/upload-parks-tileset.ts
 */

import { createHash, createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import layersConfig from '../data/layers.json';
import { mapboxFetch } from './lib/mapbox-api';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const LAYER_ID = 'parks_open_space';
const GEOJSON_PATH = 'data/seattle-parks-clean.geojson';
// Mapbox's staging bucket lives in us-east-1.
const S3_REGION = 'us-east-1';
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 15 * 60_000;

interface TilesetLayer {
  id: string;
  tileset?: string;
  sourceLayer?: string;
}

interface StagingCredentials {
  accessKeyId: string;
  bucket: string;
  key: string;
  secretAccessKey: string;
  sessionToken: string;
  url: string;
}

interface UploadStatus {
  id: string;
  name: string;
  tileset: string;
  complete: boolean;
  error: string | null;
  progress: number;
}

interface TileJson {
  vector_layers?: { id: string }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sha256Hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

/** RFC 3986 percent-encoding for one S3 key segment (SigV4 is strict about `!*'()`). */
function rfc3986(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Upload a body to the staging object with an AWS Signature V4 header. */
async function putToS3(creds: StagingCredentials, body: Buffer): Promise<void> {
  const host = `${creds.bucket}.s3.amazonaws.com`;
  const canonicalUri = `/${creds.key.split('/').map(rfc3986).join('/')}`;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''); // 20260919T161602Z
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);

  const amzHeaders = {
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    'x-amz-security-token': creds.sessionToken,
  };
  // `host` is signed but set by fetch from the URL; sending it explicitly is not allowed.
  const headers: Record<string, string> = { host, ...amzHeaders };
  const headerNames = Object.keys(headers).sort();
  const signedHeaders = headerNames.join(';');
  const canonicalHeaders = headerNames.map((name) => `${name}:${headers[name]}\n`).join('');
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const scope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
  const kDate = hmac(`AWS4${creds.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, S3_REGION);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const res = await fetch(`https://${host}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      ...amzHeaders,
      authorization: `AWS4-HMAC-SHA256 Credential=${creds.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'content-type': 'application/geo+json',
    },
    // Copy into a plain Uint8Array: Node's Buffer type no longer satisfies BodyInit.
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 staging PUT failed: ${res.status} ${text.slice(0, 500)}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const token = process.env.MAPBOX_UPLOAD_TOKEN;
  if (!token) {
    console.error(
      'MAPBOX_UPLOAD_TOKEN is not set. Add a secret token with the uploads:read and uploads:write scopes to .env.local.'
    );
    process.exit(1);
  }

  const layers: TilesetLayer[] = layersConfig;
  const layer = layers.find((l) => l.id === LAYER_ID);
  if (!layer?.tileset || !layer.sourceLayer) {
    console.error(`${LAYER_ID} with tileset + sourceLayer not found in data/layers.json`);
    process.exit(1);
  }
  const tilesetId = layer.tileset.replace(/^mapbox:\/\//, ''); // dwahbe.4tqk418n
  const username = tilesetId.split('.')[0];
  const expectedSourceLayer = layer.sourceLayer;

  const geojsonPath = path.join(process.cwd(), GEOJSON_PATH);
  const body = await readFile(geojsonPath);
  const featureCount = (JSON.parse(body.toString('utf8')) as { features: unknown[] }).features
    .length;
  console.log(
    `Replacing ${tilesetId} (layer "${expectedSourceLayer}") with ${GEOJSON_PATH}: ${featureCount} features, ${(body.length / 1_048_576).toFixed(1)} MB\n`
  );

  process.stdout.write('Requesting S3 staging credentials... ');
  const creds = await mapboxFetch<StagingCredentials>(token, `/uploads/v1/${username}/credentials`);
  console.log('ok');

  process.stdout.write('Uploading to staging bucket... ');
  await putToS3(creds, body);
  console.log('ok');

  process.stdout.write('Creating upload... ');
  const upload = await mapboxFetch<UploadStatus>(token, `/uploads/v1/${username}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      url: creds.url,
      tileset: tilesetId,
      // Mapbox names the tileset (and, for GeoJSON, its single vector layer)
      // after this. Keeping it equal to the current sourceLayer avoids a
      // config change; the TileJSON check below catches it if that ever drifts.
      name: expectedSourceLayer,
    }),
  });
  console.log(`ok (upload id ${upload.id})\n`);

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let status = upload;
  while (!status.complete) {
    if (status.error) {
      throw new Error(`Mapbox reported an upload error: ${status.error}`);
    }
    if (Date.now() > deadline) {
      throw new Error(`Timed out after ${POLL_TIMEOUT_MS / 60_000} minutes waiting for Mapbox.`);
    }
    await sleep(POLL_INTERVAL_MS);
    status = await mapboxFetch<UploadStatus>(token, `/uploads/v1/${username}/${upload.id}`);
    console.log(`  processing... ${Math.round(status.progress * 100)}%`);
  }
  console.log('\nMapbox finished processing.\n');

  const tileJson = await mapboxFetch<TileJson>(token, `/v4/${tilesetId}.json`);
  const layerIds = (tileJson.vector_layers ?? []).map((v) => v.id);
  console.log(`Vector layers now in ${tilesetId}: ${layerIds.join(', ') || '(none reported)'}`);
  if (!layerIds.includes(expectedSourceLayer)) {
    console.log(
      `\nACTION NEEDED: data/layers.json expects sourceLayer "${expectedSourceLayer}". Update it to the id above, then re-run bun scripts/generate-static-map-style.ts and republish the style.`
    );
  } else {
    console.log('sourceLayer in data/layers.json still matches — no config change needed.');
  }
}

main().catch((err) => {
  console.error('\nUpload failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
