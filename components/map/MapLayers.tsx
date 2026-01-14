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
      // Style changes reset the map sources/layers, so prune stale caches
      for (const sourceId of addedSources.current) {
        if (!map.getSource(sourceId)) {
          addedSources.current.delete(sourceId);
        }
      }
      for (const layerId of addedLayers.current) {
        if (!map.getLayer(layerId)) {
          addedLayers.current.delete(layerId);
        }
      }

      // Remove layers that are no longer active
      for (const layerId of addedLayers.current) {
        // Skip casing layers - they're managed with their parent
        if (layerId.endsWith('-casing')) continue;

        if (!activeLayers.includes(layerId)) {
          // Remove casing layer first if it exists
          const casingId = `${layerId}-casing`;
          if (map.getLayer(casingId)) {
            map.removeLayer(casingId);
            addedLayers.current.delete(casingId);
          }

          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          addedLayers.current.delete(layerId);
        }
      }

      // Sort active layers by zOrder to determine proper insertion order
      const sortedActiveLayers = [...activeLayers].sort((a, b) => {
        const configA = layerConfigs.find((l) => l.id === a);
        const configB = layerConfigs.find((l) => l.id === b);
        return (configA?.zOrder ?? 0) - (configB?.zOrder ?? 0);
      });

      // Helper to find the first layer with a higher zOrder that's already on the map
      const findBeforeId = (currentZOrder: number): string | undefined => {
        for (const id of sortedActiveLayers) {
          const cfg = layerConfigs.find((l) => l.id === id);
          if (cfg && cfg.zOrder > currentZOrder && map.getLayer(id)) {
            // Return the casing layer if it exists (casing is below the main line)
            const casingId = `${id}-casing`;
            if (map.getLayer(casingId)) return casingId;
            return id;
          }
        }
        return undefined;
      };

      // Add layers that are now active (in zOrder)
      for (const layerId of sortedActiveLayers) {
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
          const beforeId = findBeforeId(config.zOrder);

          // For line layers (transit routes), add a subtle casing layer for legibility
          if (config.type === 'line') {
            const casingId = `${layerId}-casing`;
            if (!map.getLayer(casingId)) {
              const casingSpec: mapboxgl.AnyLayer = {
                id: casingId,
                type: 'line',
                source: sourceId,
                'source-layer': config.sourceLayer,
                paint: {
                  'line-color': 'rgba(255, 255, 255, 0.5)', // Subtle white casing
                  'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.8, 14, 2.5, 18, 4],
                  'line-opacity': 1,
                },
                layout: {
                  'line-cap': 'round',
                  'line-join': 'round',
                },
              };
              if (config.minZoom !== undefined) casingSpec.minzoom = config.minZoom;
              if (config.maxZoom !== undefined) casingSpec.maxzoom = config.maxZoom;

              try {
                map.addLayer(casingSpec, beforeId);
                addedLayers.current.add(casingId);
              } catch (error) {
                console.error(`[MapLayers] Failed to add casing: ${casingId}`, error);
              }
            }
          }

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

          try {
            // For line layers, insert after the casing (so main layer is above casing)
            const insertBeforeId = config.type === 'line' ? beforeId : beforeId;
            map.addLayer(layerSpec, insertBeforeId);
            addedLayers.current.add(layerId);
          } catch (error) {
            console.error(`[MapLayers] Failed to add layer: ${layerId}`, error);
          }
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
    const layersRef = addedLayers.current;
    const sourcesRef = addedSources.current;

    return () => {
      if (!map) return;

      try {
        for (const layerId of layersRef) {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        }

        for (const sourceId of sourcesRef) {
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        }
      } catch {
        // Map may have been destroyed already
      }

      layersRef.clear();
      sourcesRef.clear();
    };
  }, [map]);

  return null;
}
