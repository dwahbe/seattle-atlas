import proj4 from 'proj4';
import { readFileSync, writeFileSync } from 'fs';

// Define EPSG:2926 (Washington State Plane North, US feet)
proj4.defs(
  'EPSG:2926',
  '+proj=lcc +lat_1=47.5 +lat_2=48.73333333333333 +lat_0=47 +lon_0=-120.8333333333333 +x_0=500000.0001016001 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs'
);

// Map CATEGORY values to PRIMARYFACILITYTYPE
const categoryMap: Record<string, string> = {
  'BKF-PBL': 'PBL', // Protected Bike Lane
  'BKF-BBL': 'PBL', // Buffered Bike Lane -> Protected
  'BKF-BL': 'BL', // Bike Lane
  'BKF-CLMB': 'BL', // Climbing Lane -> Bike Lane
  'BKF-NGW': 'NGW', // Neighborhood Greenway
  'BKF-SHW': 'SHR', // Sharrow
  'BKF-OFFST': 'MUT', // Off-street -> Multi-Use Trail
};

interface Feature {
  type: 'Feature';
  id?: number;
  geometry: {
    type: string;
    coordinates: number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

function reprojectCoords(coords: number[]): number[] {
  const [x, y] = coords;
  return proj4('EPSG:2926', 'EPSG:4326', [x, y]);
}

function reprojectGeometry(geometry: Feature['geometry']): Feature['geometry'] {
  if (geometry.type === 'LineString') {
    return {
      type: 'LineString',
      coordinates: (geometry.coordinates as number[][]).map(reprojectCoords),
    };
  } else if (geometry.type === 'MultiLineString') {
    return {
      type: 'MultiLineString',
      coordinates: (geometry.coordinates as number[][][]).map((line) => line.map(reprojectCoords)),
    };
  }
  return geometry;
}

function processFeature(feature: Feature, categoryMapping: Record<string, string>): Feature | null {
  const category = feature.properties.CATEGORY as string;
  const facilityType = categoryMapping[category];

  if (!facilityType) {
    // Unknown category, skip or use default
    console.warn(`Unknown category: ${category}`);
    return null;
  }

  return {
    type: 'Feature',
    geometry: reprojectGeometry(feature.geometry),
    properties: {
      PRIMARYFACILITYTYPE: facilityType,
      UNITDESC: feature.properties.UNITDESC,
      CURRENT_STATUS: feature.properties.CURRENT_STATUS,
      INSTALL_DATE: feature.properties.INSTALL_DATE,
      CATEGORY_ORIGINAL: category,
    },
  };
}

function processTrailFeature(feature: Feature): Feature {
  return {
    type: 'Feature',
    geometry: reprojectGeometry(feature.geometry),
    properties: {
      PRIMARYFACILITYTYPE: 'MUT',
      UNITDESC: feature.properties.SNDSEG_NAM || feature.properties.UNITDESC,
      CURRENT_STATUS: 'INSVC',
      CATEGORY_ORIGINAL: 'Trail',
    },
  };
}

async function main() {
  const dataDir = './data';

  console.log('Reading existing bike facilities...');
  const existingRaw = readFileSync(`${dataDir}/seattle-existing-bike-facilities.geojson`, 'utf-8');
  const existing: FeatureCollection = JSON.parse(existingRaw);

  console.log('Reading multi-use trails...');
  const trailsRaw = readFileSync(`${dataDir}/seattle-multiuse-trails.geojson`, 'utf-8');
  const trails: FeatureCollection = JSON.parse(trailsRaw);

  const allFeatures: Feature[] = [];

  // Process existing bike facilities
  console.log(`Processing ${existing.features.length} existing facilities...`);
  for (const feature of existing.features) {
    const processed = processFeature(feature, categoryMap);
    if (processed) {
      allFeatures.push(processed);
    }
  }

  // Process trails
  console.log(`Processing ${trails.features.length} trails...`);
  for (const feature of trails.features) {
    allFeatures.push(processTrailFeature(feature));
  }

  const output: FeatureCollection = {
    type: 'FeatureCollection',
    features: allFeatures,
  };

  const outputPath = `${dataDir}/seattle-bike-facilities-merged.geojson`;
  writeFileSync(outputPath, JSON.stringify(output));

  console.log(`\n✅ Done! Wrote ${allFeatures.length} features to ${outputPath}`);

  // Print summary
  const typeCounts: Record<string, number> = {};
  for (const f of allFeatures) {
    const type = f.properties.PRIMARYFACILITYTYPE as string;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  console.log('\nFeature breakdown:');
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    const labels: Record<string, string> = {
      SHR: 'Sharrow',
      BL: 'Bike Lane',
      NGW: 'Neighborhood Greenway',
      PBL: 'Protected Bike Lane',
      MUT: 'Multi-Use Trail',
    };
    console.log(`  ${labels[type] || type}: ${count}`);
  }
}

main().catch(console.error);
