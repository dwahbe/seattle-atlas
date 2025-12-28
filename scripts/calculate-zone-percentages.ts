import { readFileSync, writeFileSync } from 'fs';
import * as turf from '@turf/turf';

const geojsonPath = './GeoJSON.geojson';
const layersPath = './data/layers.json';

console.log('Reading GeoJSON...');
const geojson = JSON.parse(readFileSync(geojsonPath, 'utf-8'));

console.log(`Processing ${geojson.features.length} features...`);

// Calculate areas by CATEGORY_DESC (simplified) and ZONELUT (technical)
const areaByCategory: Record<string, number> = {};
const areaByZonelut: Record<string, number> = {};
let totalArea = 0;

for (const feature of geojson.features) {
  if (!feature.geometry || feature.geometry.type === 'Point') continue;

  try {
    const area = turf.area(feature);
    totalArea += area;

    const category = feature.properties?.CATEGORY_DESC;
    const zonelut = feature.properties?.ZONELUT;

    if (category) {
      areaByCategory[category] = (areaByCategory[category] || 0) + area;
    }
    if (zonelut) {
      areaByZonelut[zonelut] = (areaByZonelut[zonelut] || 0) + area;
    }
  } catch (e) {
    // Skip invalid geometries
  }
}

// Convert to percentages
const categoryPercentages: Record<string, number> = {};
const zonelutPercentages: Record<string, number> = {};

for (const [key, area] of Object.entries(areaByCategory)) {
  categoryPercentages[key] = Math.round((area / totalArea) * 1000) / 10; // 1 decimal
}

for (const [key, area] of Object.entries(areaByZonelut)) {
  zonelutPercentages[key] = Math.round((area / totalArea) * 1000) / 10;
}

console.log('\n=== CATEGORY_DESC (Simplified View) ===');
console.log(JSON.stringify(categoryPercentages, null, 2));

console.log('\n=== ZONELUT (Technical View) ===');
console.log(JSON.stringify(zonelutPercentages, null, 2));

// Update layers.json with percentages
const layers = JSON.parse(readFileSync(layersPath, 'utf-8'));

for (const layer of layers) {
  const percentMap = layer.id === 'zoning' ? categoryPercentages : zonelutPercentages;

  for (const legendItem of layer.legend) {
    const pct = percentMap[legendItem.value];
    if (pct !== undefined) {
      legendItem.percentage = pct;
    }
  }
}

writeFileSync(layersPath, JSON.stringify(layers, null, 2) + '\n');
console.log('\n✓ Updated layers.json with percentages');
