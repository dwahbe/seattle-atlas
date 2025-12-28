'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { type Map as MapboxMap } from 'mapbox-gl';
import { getLayerPaint, getLayerLayout, buildFilterExpression } from '@/lib/mapbox';
import type { LayerConfig, FilterState } from '@/types';

interface MapLayersProps {
  map: MapboxMap | null;
  layerConfigs: LayerConfig[];
  activeLayers: string[];
  filters: FilterState;
}

export function MapLayers({ map, layerConfigs, activeLayers, filters }: MapLayersProps) {
  const addedSources = useRef<Set<string>>(new Set());
  const addedLayers = useRef<Set<string>>(new Set());

  // Add/remove layers based on active layers
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const handleStyleLoad = () => {
      // Remove layers that are no longer active
      for (const layerId of addedLayers.current) {
        if (!activeLayers.includes(layerId)) {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          addedLayers.current.delete(layerId);
        }
      }

      // Add layers that are now active
      for (const layerId of activeLayers) {
        const config = layerConfigs.find((l) => l.id === layerId);
        if (!config) continue;

        // Add source if not already added
        const sourceId = `source-${config.id}`;
        if (!addedSources.current.has(sourceId) && !map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'vector',
            url: config.tileset,
          });
          addedSources.current.add(sourceId);
        }

        // Add layer if not already added
        if (!addedLayers.current.has(layerId) && !map.getLayer(layerId)) {
          const layerSpec: mapboxgl.AnyLayer = {
            id: layerId,
            type: config.type,
            source: sourceId,
            'source-layer': config.sourceLayer,
            paint: getLayerPaint(config) as mapboxgl.AnyPaint,
            layout: getLayerLayout(config),
          };

          // Add min/max zoom if specified
          if (config.minZoom !== undefined) {
            layerSpec.minzoom = config.minZoom;
          }
          if (config.maxZoom !== undefined) {
            layerSpec.maxzoom = config.maxZoom;
          }

          map.addLayer(layerSpec);
          addedLayers.current.add(layerId);
        }
      }
    };

    // Check if style is already loaded
    if (map.isStyleLoaded()) {
      handleStyleLoad();
    }

    // Also listen for style.load event (for when style changes)
    map.on('style.load', handleStyleLoad);

    return () => {
      map.off('style.load', handleStyleLoad);
    };
  }, [map, activeLayers, layerConfigs]);

  // Apply filters to layers
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    for (const layerId of activeLayers) {
      if (!map.getLayer(layerId)) continue;

      const config = layerConfigs.find((l) => l.id === layerId);
      if (!config) continue;

      const layerFilters = filters[layerId];
      if (layerFilters) {
        const filterExpression = buildFilterExpression(
          config,
          layerFilters as Record<string, string[]>
        );
        if (filterExpression) {
          map.setFilter(layerId, filterExpression);
        } else {
          map.setFilter(layerId, null);
        }
      } else {
        map.setFilter(layerId, null);
      }
    }
  }, [map, activeLayers, layerConfigs, filters]);

  // Clean up sources and layers when unmounting
  useEffect(() => {
    return () => {
      if (!map) return;

      try {
        for (const layerId of addedLayers.current) {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        }

        for (const sourceId of addedSources.current) {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        }
      } catch {
        // Map may have been destroyed already
      }

      addedLayers.current.clear();
      addedSources.current.clear();
    };
  }, [map]);

  return null;
}
