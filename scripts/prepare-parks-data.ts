/**
 * Seattle Parks Data Prep
 * -----------------------
 * Fetches the raw Seattle Parks & Recreation parcel dataset, normalizes it,
 * and produces two artifacts:
 *
 *   1. data/seattle-parks-clean.geojson — cleaned, dissolved-by-park polygons
 *      ready to upload to Mapbox Studio as a new tileset.
 *
 *   2. data/parks-stats.json — city-wide aggregates used by the legend
 *      (total park count, total area, % of Seattle, largest park, counts by type).
 *
 * Source dataset:
 *   https://data-seattlecitygis.opendata.arcgis.com/datasets/SeattleCityGIS::park-boundary-details
 *
 * Run with:
 *   bun run scripts/prepare-parks-data.ts
 */

import area from '@turf/area';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ARC_BASE =
  'https://services.arcgis.com/ZOyb2t4B0UYuYNYH/ArcGIS/rest/services/Park_Boundary_(details)/FeatureServer/2/query';

const PAGE_SIZE = 2000;

// Seattle's land area per US Census 2020 (83.84 sq mi). Used as the denominator
// for the "% of Seattle" stat. Intentionally land-only (excludes Lake Washington)
// so the number lines up with how people commonly talk about Seattle's size.
const SEATTLE_LAND_AREA_ACRES = 53_658;

// Seattle city limits bounding box. Parks whose centroid falls outside this
// box are excluded (the SPR dataset is mostly in-city, but we filter to be
// safe — "we're not making a state map"). Bounds from lib/mapbox.ts.
const SEATTLE_BBOX = {
  west: -122.4596,
  south: 47.4919,
  east: -122.2244,
  north: 47.7341,
};

// Sentinel placeholder date used by the source for "unknown". Epoch ms for
// 2099-01-01. Any record with this value is treated as null.
const SENTINEL_DATE_MS = 4_070_908_800_000;

// Coded-value domains from the ArcGIS feature service schema. Hardcoded here
// so the clean GeoJSON is self-contained — no lookup needed at runtime.
const USE_CODES: Record<string, string> = {
  GB: 'Greenbelt / Natural Area',
  PF: 'Playfield',
  PG: 'Playground',
  PK: 'Park',
  BV: 'Boulevard',
  TR: 'Trail',
  BL: 'Boat Launch',
  VP: 'Viewpoint',
  TS: 'Triangle / Square',
  SP: 'Special Use',
  PP: 'P-Patch',
  GN: 'Garden',
  PL: 'Swimming Pool',
  GF: 'Golf Course',
  CS: 'Centerstrip',
  MT: 'Maintenance Facility',
  CC: 'Community Center',
  LE: 'Life Estate',
};

// Owner codes decoded directly to display-ready short names. These strings
// are what the inspect panel shows — no runtime shortening.
const OWNER_CODES: Record<string, string> = {
  DNR: 'WA DNR',
  DPR: 'Seattle Parks',
  'DPR/SPU': 'Seattle Parks & SPU',
  FINANCE: 'City Finance',
  JOINT: 'Joint Jurisdiction',
  KC: 'King County',
  OTHER: 'Other',
  Partial: 'Partial Jurisdiction',
  POS: 'Port of Seattle',
  SCL: 'Seattle City Light',
  SDOT: 'SDOT',
  'SDOT/DPR': 'SDOT & Parks',
  SHARED: 'Shared',
  SPD: 'SPD',
  SPU: 'Seattle Public Utilities',
  SSD1: 'Seattle Schools',
  STATE: 'State of WA',
  STO: "Seattle Treasurer's Office",
  'UP RR': 'Union Pacific Railroad',
  UW: 'UW',
  WSDOT: 'WSDOT',
};

// Raw field names from the source dataset.
interface RawParkProps {
  NAME: string | null;
  PMA_NAME: string | null;
  ADDRESS: string | null;
  USE_: string | null;
  OWNER: string | null;
  ACQ_DATE: number | null;
  LEASE: string | null;
  MAINT: string | null;
}

// Shape of the cleaned properties each feature gets after dissolve.
interface CleanParkProps {
  name: string;
  type: string;
  address: string | null;
  areaSqFt: number;
  areaAcres: number;
  acquiredYear: number | null;
  owner: string;
  parcelCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Title-case a string. Handles apostrophes, hyphens, and directional abbrevs. */
function titleCase(input: string): string {
  const titled = input
    .toLowerCase()
    .replace(/(^|\s|['-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
  // Restore uppercase for directional abbreviations
  return titled.replace(/\b(Ne|Nw|Se|Sw)\b/g, (d) => d.toUpperCase());
}

/** Normalize a park name for grouping (case/whitespace-insensitive). */
function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Clean a possibly-blank address into a non-empty string or null. */
function cleanAddress(addr: string | null | undefined): string | null {
  if (!addr) return null;
  const trimmed = addr.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Parse a (possibly-sentinel) ACQ_DATE epoch into a year, or null if unknown. */
function parseAcquiredYear(ms: number | null | undefined): number | null {
  if (ms == null) return null;
  if (ms === SENTINEL_DATE_MS) return null;
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  // Guard against other weird values (pre-1800 or post-current-year).
  if (year < 1800 || year > new Date().getUTCFullYear()) return null;
  return year;
}

/** Compute the centroid of a polygon or multipolygon geometry (rough). */
function computeCentroid(geom: Polygon | MultiPolygon): [number, number] | null {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  const rings: Position[][][] = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

  for (const poly of rings) {
    const outerRing = poly[0];
    if (!outerRing) continue;
    for (const [x, y] of outerRing) {
      sumX += x;
      sumY += y;
      count += 1;
    }
  }

  if (count === 0) return null;
  return [sumX / count, sumY / count];
}

function inSeattleBbox(point: [number, number]): boolean {
  const [lng, lat] = point;
  return (
    lng >= SEATTLE_BBOX.west &&
    lng <= SEATTLE_BBOX.east &&
    lat >= SEATTLE_BBOX.south &&
    lat <= SEATTLE_BBOX.north
  );
}

// ---------------------------------------------------------------------------
// Fetch all features (paginated)
// ---------------------------------------------------------------------------

async function fetchAllParks(): Promise<Feature<Polygon | MultiPolygon, RawParkProps>[]> {
  const all: Feature<Polygon | MultiPolygon, RawParkProps>[] = [];
  let offset = 0;

  for (;;) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: 'NAME,PMA_NAME,ADDRESS,USE_,OWNER,ACQ_DATE,LEASE,MAINT',
      outSR: '4326',
      f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
    });

    const url = `${ARC_BASE}?${params.toString()}`;
    process.stdout.write(`  fetching offset=${offset}... `);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`ArcGIS request failed: ${res.status} ${res.statusText}`);
    }
    const fc = (await res.json()) as FeatureCollection<Polygon | MultiPolygon, RawParkProps>;

    if (!fc.features || fc.features.length === 0) {
      console.log('done');
      break;
    }

    all.push(...fc.features);
    console.log(`got ${fc.features.length} features (total: ${all.length})`);

    if (fc.features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

// ---------------------------------------------------------------------------
// Dissolve by normalized park name
// ---------------------------------------------------------------------------

interface Group {
  displayName: string; // title-cased, shown to users
  features: Feature<Polygon | MultiPolygon, RawParkProps>[];
}

function groupByName(
  features: Feature<Polygon | MultiPolygon, RawParkProps>[]
): Map<string, Group> {
  const groups = new Map<string, Group>();

  for (const f of features) {
    const raw = f.properties?.NAME;
    if (!raw) continue;
    const key = normalizeName(raw);
    if (!groups.has(key)) {
      groups.set(key, { displayName: titleCase(raw.trim()), features: [] });
    }
    groups.get(key)!.features.push(f);
  }

  return groups;
}

function mergeGeometries(features: Feature<Polygon | MultiPolygon, RawParkProps>[]): MultiPolygon {
  const polygons: Position[][][] = [];
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') {
      polygons.push(g.coordinates);
    } else if (g.type === 'MultiPolygon') {
      polygons.push(...g.coordinates);
    }
  }
  return { type: 'MultiPolygon', coordinates: polygons };
}

/** Collapse the parcels of a single park into one clean Feature. */
function dissolveGroup(key: string, group: Group): Feature<MultiPolygon, CleanParkProps> | null {
  const { displayName, features } = group;

  const geometry = mergeGeometries(features);
  if (geometry.coordinates.length === 0) return null;

  const centroid = computeCentroid(geometry);
  if (!centroid || !inSeattleBbox(centroid)) {
    // Outside Seattle — skip. "Not making a state map."
    return null;
  }

  // Area: turf returns square meters for GeoJSON in WGS84.
  const areaSqMeters = area({ type: 'Feature', geometry, properties: {} });
  const areaSqFt = Math.round(areaSqMeters * 10.7639);
  const areaAcres = Math.round((areaSqFt / 43_560) * 10) / 10; // 1 decimal

  // Pick the most common USE_ code across parcels (mode). Falls back to first.
  const useFreq = new Map<string, number>();
  for (const f of features) {
    const u = f.properties?.USE_;
    if (!u) continue;
    useFreq.set(u, (useFreq.get(u) ?? 0) + 1);
  }
  const mostCommonUse = [...useFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const type = (mostCommonUse && USE_CODES[mostCommonUse]) || 'Park';

  // Owner: same approach — mode.
  const ownerFreq = new Map<string, number>();
  for (const f of features) {
    const o = f.properties?.OWNER;
    if (!o) continue;
    ownerFreq.set(o, (ownerFreq.get(o) ?? 0) + 1);
  }
  const mostCommonOwner = [...ownerFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const owner = (mostCommonOwner && OWNER_CODES[mostCommonOwner]) || 'Seattle Parks';

  // Address: first non-blank address we see.
  let address: string | null = null;
  for (const f of features) {
    const a = cleanAddress(f.properties?.ADDRESS);
    if (a) {
      address = a;
      break;
    }
  }

  // Acquired: earliest valid year across parcels.
  let earliestYear: number | null = null;
  for (const f of features) {
    const y = parseAcquiredYear(f.properties?.ACQ_DATE);
    if (y != null && (earliestYear == null || y < earliestYear)) {
      earliestYear = y;
    }
  }

  return {
    type: 'Feature',
    id: key,
    geometry,
    properties: {
      name: displayName,
      type,
      address,
      areaSqFt,
      areaAcres,
      acquiredYear: earliestYear,
      owner,
      parcelCount: features.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Stats aggregation
// ---------------------------------------------------------------------------

interface ParksStats {
  source: string;
  sourceUrl: string;
  computedAt: string;
  totalParks: number;
  totalParcels: number;
  totalAreaSqFt: number;
  totalAreaAcres: number;
  totalAreaSqMi: number;
  seattleLandAreaAcres: number;
  percentageOfSeattle: number;
  largestPark: { name: string; acres: number };
  countByType: Record<string, number>;
}

function computeStats(
  cleaned: Feature<MultiPolygon, CleanParkProps>[],
  rawParcelCount: number
): ParksStats {
  const totalAreaSqFt = cleaned.reduce((s, f) => s + f.properties.areaSqFt, 0);
  const totalAreaAcres = totalAreaSqFt / 43_560;
  const totalAreaSqMi = totalAreaAcres / 640;
  const percentageOfSeattle = (totalAreaAcres / SEATTLE_LAND_AREA_ACRES) * 100;

  let largest = cleaned[0];
  for (const f of cleaned) {
    if (f.properties.areaSqFt > largest.properties.areaSqFt) largest = f;
  }

  const countByType: Record<string, number> = {};
  for (const f of cleaned) {
    const t = f.properties.type;
    countByType[t] = (countByType[t] ?? 0) + 1;
  }

  return {
    source: 'Seattle Parks & Recreation — Park_Boundary_(details)',
    sourceUrl:
      'https://data-seattlecitygis.opendata.arcgis.com/datasets/SeattleCityGIS::park-boundary-details',
    computedAt: new Date().toISOString(),
    totalParks: cleaned.length,
    totalParcels: rawParcelCount,
    totalAreaSqFt: Math.round(totalAreaSqFt),
    totalAreaAcres: Math.round(totalAreaAcres * 10) / 10,
    totalAreaSqMi: Math.round(totalAreaSqMi * 100) / 100,
    seattleLandAreaAcres: SEATTLE_LAND_AREA_ACRES,
    percentageOfSeattle: Math.round(percentageOfSeattle * 10) / 10,
    largestPark: {
      name: largest.properties.name,
      acres: largest.properties.areaAcres,
    },
    countByType,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Run from project root: `bun run scripts/prepare-parks-data.ts`
  const root = process.cwd();
  const dataDir = path.join(root, 'data');
  await mkdir(dataDir, { recursive: true });

  console.log('Fetching parks data from Seattle GIS...');
  const raw = await fetchAllParks();
  console.log(`  → ${raw.length} raw parcel features\n`);

  console.log('Grouping by normalized park name...');
  const groups = groupByName(raw);
  console.log(`  → ${groups.size} distinct park names\n`);

  console.log('Dissolving + cleaning each group...');
  const cleaned: Feature<MultiPolygon, CleanParkProps>[] = [];
  let skipped = 0;
  for (const [key, group] of groups) {
    const feature = dissolveGroup(key, group);
    if (feature) {
      cleaned.push(feature);
    } else {
      skipped += 1;
    }
  }
  console.log(`  → ${cleaned.length} parks kept, ${skipped} skipped (outside Seattle bbox)\n`);

  // Sort largest-first. Mapbox preserves feature order, and larger polygons
  // on the bottom = less z-fighting for tiny overlaps.
  cleaned.sort((a, b) => b.properties.areaSqFt - a.properties.areaSqFt);

  const collection: FeatureCollection<MultiPolygon, CleanParkProps> = {
    type: 'FeatureCollection',
    features: cleaned,
  };

  const stats = computeStats(cleaned, raw.length);

  const geojsonPath = path.join(dataDir, 'seattle-parks-clean.geojson');
  const statsPath = path.join(dataDir, 'parks-stats.json');

  await writeFile(geojsonPath, JSON.stringify(collection));
  await writeFile(statsPath, JSON.stringify(stats, null, 2));

  console.log('Done.\n');
  console.log('Outputs:');
  console.log(`  ${path.relative(root, geojsonPath)}`);
  console.log(`  ${path.relative(root, statsPath)}\n`);

  console.log('Summary:');
  console.log(`  Total parks:       ${stats.totalParks.toLocaleString()}`);
  console.log(`  Total parcels:     ${stats.totalParcels.toLocaleString()}`);
  console.log(
    `  Total area:        ${stats.totalAreaAcres.toLocaleString()} acres (${stats.totalAreaSqMi} sq mi)`
  );
  console.log(
    `  % of Seattle:      ${stats.percentageOfSeattle}% of land area (${stats.seattleLandAreaAcres.toLocaleString()} acres)`
  );
  console.log(
    `  Largest park:      ${stats.largestPark.name} (${stats.largestPark.acres.toLocaleString()} acres)`
  );
  console.log('\n  Counts by type:');
  for (const [type, count] of Object.entries(stats.countByType).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${type.padEnd(32)} ${count}`);
  }
}

main().catch((err) => {
  console.error('\nScript failed:', err);
  process.exit(1);
});
