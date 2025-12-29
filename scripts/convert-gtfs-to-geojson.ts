/**
 * Convert GTFS data to GeoJSON for Mapbox tileset upload
 *
 * Usage: bun run scripts/convert-gtfs-to-geojson.ts
 *
 * Outputs:
 *   - data/transit-routes.geojson (LineStrings for route shapes)
 *   - data/transit-stops.geojson (Points for stops)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GTFS_DIR = '/Users/dylan/Desktop/google seattle transit data';
const OUTPUT_DIR = join(import.meta.dir, '..', 'data');

// Route types from GTFS spec
const ROUTE_TYPE_NAMES: Record<number, string> = {
  0: 'streetcar', // Tram, Streetcar, Light rail
  1: 'subway', // Subway, Metro
  2: 'rail', // Rail (intercity/long-distance)
  3: 'bus', // Bus
  4: 'ferry', // Ferry
  5: 'cable_car', // Cable tram
  6: 'gondola', // Aerial lift
  7: 'funicular', // Funicular
  11: 'trolleybus', // Trolleybus
  12: 'monorail', // Monorail
};

interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  route_color: string;
  route_text_color: string;
}

interface ShapePoint {
  shape_id: string;
  lat: number;
  lon: number;
  sequence: number;
}

interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  location_type: number;
  parent_station: string;
}

interface Trip {
  route_id: string;
  shape_id: string;
}

function parseCSV<T>(filename: string): T[] {
  const content = readFileSync(join(GTFS_DIR, filename), 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || '';
    });
    return obj as T;
  });
}

// Handle CSV fields with quotes and commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function normalizeColor(color: string): string {
  if (!color) return '#888888';
  // Remove # if present, add it back
  const hex = color.replace('#', '');
  if (hex.length === 6) return `#${hex}`;
  return '#888888';
}

async function main() {
  console.log('Reading GTFS files...');

  // Parse all GTFS files
  const routes = parseCSV<Route>('routes.txt');
  const trips = parseCSV<Trip>('trips.txt');
  const stops = parseCSV<Stop>('stops.txt');

  console.log(`  ${routes.length} routes`);
  console.log(`  ${trips.length} trips`);
  console.log(`  ${stops.length} stops`);

  // Build route lookup
  const routeMap = new Map<string, Route>();
  for (const route of routes) {
    routeMap.set(route.route_id, route);
  }

  // Build shape_id -> route_id mapping (use first route for each shape)
  const shapeToRoute = new Map<string, string>();
  for (const trip of trips) {
    if (trip.shape_id && !shapeToRoute.has(trip.shape_id)) {
      shapeToRoute.set(trip.shape_id, trip.route_id);
    }
  }

  console.log(`  ${shapeToRoute.size} unique shapes`);

  // Parse shapes file (large file, stream-like processing)
  console.log('Parsing shapes...');
  const shapesContent = readFileSync(join(GTFS_DIR, 'shapes.txt'), 'utf-8');
  const shapeLines = shapesContent.trim().split('\n');
  const shapeHeaders = shapeLines[0].split(',').map((h) => h.trim());

  // Group points by shape_id
  const shapePoints = new Map<string, ShapePoint[]>();

  for (let i = 1; i < shapeLines.length; i++) {
    const values = shapeLines[i].split(',');
    const point: ShapePoint = {
      shape_id: values[shapeHeaders.indexOf('shape_id')],
      lat: parseFloat(values[shapeHeaders.indexOf('shape_pt_lat')]),
      lon: parseFloat(values[shapeHeaders.indexOf('shape_pt_lon')]),
      sequence: parseInt(values[shapeHeaders.indexOf('shape_pt_sequence')]),
    };

    if (!shapePoints.has(point.shape_id)) {
      shapePoints.set(point.shape_id, []);
    }
    shapePoints.get(point.shape_id)!.push(point);
  }

  console.log(`  ${shapePoints.size} shapes parsed`);

  // Build route features - deduplicate by combining shapes per route
  console.log('Building route GeoJSON...');

  // Group shapes by route
  const routeShapes = new Map<string, string[]>();
  for (const [shapeId, routeId] of shapeToRoute) {
    if (!routeShapes.has(routeId)) {
      routeShapes.set(routeId, []);
    }
    routeShapes.get(routeId)!.push(shapeId);
  }

  const routeFeatures: GeoJSON.Feature[] = [];

  for (const [routeId, shapeIds] of routeShapes) {
    const route = routeMap.get(routeId);
    if (!route) continue;

    // Use the longest shape for this route (most complete representation)
    let bestShapeId = shapeIds[0];
    let bestLength = 0;

    for (const shapeId of shapeIds) {
      const points = shapePoints.get(shapeId);
      if (points && points.length > bestLength) {
        bestLength = points.length;
        bestShapeId = shapeId;
      }
    }

    const points = shapePoints.get(bestShapeId);
    if (!points || points.length < 2) continue;

    // Sort by sequence and build coordinates
    points.sort((a, b) => a.sequence - b.sequence);
    const coordinates = points.map((p) => [p.lon, p.lat]);

    const routeType = parseInt(String(route.route_type)) || 3;
    const routeTypeName = ROUTE_TYPE_NAMES[routeType] || 'bus';

    // Determine display name
    const displayName = route.route_short_name || route.route_long_name || routeId;

    routeFeatures.push({
      type: 'Feature',
      properties: {
        route_id: routeId,
        name: displayName,
        long_name: route.route_long_name,
        route_type: routeTypeName,
        route_type_code: routeType,
        color: normalizeColor(route.route_color),
        text_color: normalizeColor(route.route_text_color),
      },
      geometry: {
        type: 'LineString',
        coordinates,
      },
    });
  }

  const routesGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: routeFeatures,
  };

  // Build stops GeoJSON
  console.log('Building stops GeoJSON...');

  const stopFeatures: GeoJSON.Feature[] = [];

  for (const stop of stops) {
    // Skip child stops (location_type 0 with parent) - only keep parent stations and standalone stops
    const locationType = parseInt(String(stop.location_type)) || 0;

    // location_type: 0 = stop, 1 = station, 2 = entrance
    // We want stops and stations, not entrances
    if (locationType === 2) continue;

    const lat = parseFloat(String(stop.stop_lat));
    const lon = parseFloat(String(stop.stop_lon));

    if (isNaN(lat) || isNaN(lon)) continue;

    stopFeatures.push({
      type: 'Feature',
      properties: {
        stop_id: stop.stop_id,
        name: stop.stop_name,
        is_station: locationType === 1,
      },
      geometry: {
        type: 'Point',
        coordinates: [lon, lat],
      },
    });
  }

  const stopsGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: stopFeatures,
  };

  // Write output files
  console.log('Writing GeoJSON files...');

  writeFileSync(join(OUTPUT_DIR, 'transit-routes.geojson'), JSON.stringify(routesGeoJSON), 'utf-8');

  writeFileSync(join(OUTPUT_DIR, 'transit-stops.geojson'), JSON.stringify(stopsGeoJSON), 'utf-8');

  console.log('\n✓ Done!');
  console.log(`  Routes: ${routeFeatures.length} features → data/transit-routes.geojson`);
  console.log(`  Stops: ${stopFeatures.length} features → data/transit-stops.geojson`);
  console.log('\nNext steps:');
  console.log('  1. Go to https://studio.mapbox.com/tilesets/');
  console.log('  2. Click "New tileset" → Upload transit-routes.geojson');
  console.log('  3. Click "New tileset" → Upload transit-stops.geojson');
  console.log('  4. Copy the tileset IDs and update data/layers.json');
}

main().catch(console.error);
