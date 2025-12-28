import type { LayerConfig, LayerGroup } from '@/types';
import layersData from '@/data/layers.json';

// Load all layer configurations
export function getLayers(): LayerConfig[] {
  return layersData as LayerConfig[];
}

// Get a single layer by ID
export function getLayerById(layerId: string): LayerConfig | undefined {
  return getLayers().find((layer) => layer.id === layerId);
}

// Get layers grouped by category
export function getLayerGroups(): LayerGroup[] {
  const layers = getLayers();

  const groups: Record<string, LayerConfig[]> = {
    base: [],
    transit: [],
    derived: [],
    proposals: [],
  };

  for (const layer of layers) {
    if (groups[layer.group]) {
      groups[layer.group].push(layer);
    }
  }

  return [
    { id: 'base', name: 'Base Layers', layers: groups.base },
    { id: 'transit', name: 'Transit', layers: groups.transit },
    { id: 'derived', name: 'Analysis', layers: groups.derived },
    { id: 'proposals', name: 'Proposals', layers: groups.proposals },
  ].filter((group) => group.layers.length > 0);
}

// Get all layer IDs
export function getAllLayerIds(): string[] {
  return getLayers().map((layer) => layer.id);
}

// Validate layer IDs
export function validateLayerIds(layerIds: string[]): string[] {
  const validIds = new Set(getAllLayerIds());
  return layerIds.filter((id) => validIds.has(id));
}
