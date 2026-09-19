'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { type Map as MapboxMap } from 'mapbox-gl';
import {
  getLayerPaint,
  getLayerLayout,
  buildFilterExpression,
  restackBaseWater,
} from '@/lib/mapbox';
import { applyLabelClasses, type LabelStyleMemo, type LabelTheme } from '@/lib/map-labels';
import { BASE_LAYER_IDS, BASE_WATER_LAYER_ID } from '@/lib/constants';
import type { LayerConfig, FilterState } from '@/types';

interface MapLayersProps {
  map: MapboxMap | null;
  layerConfigs: LayerConfig[];
  activeLayers: string[];
  filters: FilterState;
  /** Picks the label inks while a base fill is active (see lib/map-labels.ts). */
  isDark: boolean;
}

export function MapLayers({ map, layerConfigs, activeLayers, filters, isDark }: MapLayersProps) {
  const addedSources = useRef<Set<string>>(new Set());
  const addedLayers = useRef<Set<string>>(new Set());
  // Whether the current base style has had its water lifted (see restackBaseWater).
  const restackedRef = useRef(false);
  // Theme the base labels are currently restyled for (null = untouched), plus
  // the untouched paint to restore; both reset with the style.
  const labelThemeRef = useRef<LabelTheme | null>(null);
  const labelMemoRef = useRef<LabelStyleMemo>(new Map());

  // Add/remove layers based on active layers
  useEffect(() => {
    if (!map) return;

    const handleStyleLoad = () => {
      // Lift the base water above the surface roads once per style, before any
      // fill is placed relative to it. A false return means the style isn't
      // there yet (mid-swap); style.load re-runs this.
      if (!restackedRef.current) {
        try {
          if (restackBaseWater(map)) restackedRef.current = true;
        } catch {
          // Style mid-swap; style.load re-runs this
        }
      }

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

      // Where a layer slots in: before the first active site layer of the same
      // kind (fill vs. line/circle) with a higher zOrder that's already on the
      // map. A fill with nothing above it goes beneath the base style's water
      // fill — which restackBaseWater has lifted above the surface roads — so
      // roads and buildings stay tinted under the fills while water, bridges,
      // and labels paint over them, and nothing colors the water (the city's
      // zoning covers platted tidelands, and the parks source has lots under
      // Puget Sound). A line or circle with nothing above it goes on top.
      const findBeforeId = (current: LayerConfig): string | undefined => {
        const isFill = current.type === 'fill';
        for (const id of sortedActiveLayers) {
          const cfg = layerConfigs.find((l) => l.id === id);
          if (
            cfg &&
            cfg.zOrder > current.zOrder &&
            (cfg.type === 'fill') === isFill &&
            map.getLayer(id)
          ) {
            // Return the casing layer if it exists (casing is below the main line)
            const casingId = `${id}-casing`;
            if (map.getLayer(casingId)) return casingId;
            return id;
          }
        }
        return isFill && map.getLayer(BASE_WATER_LAYER_ID) ? BASE_WATER_LAYER_ID : undefined;
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
          const beforeId = findBeforeId(config);

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
              } catch {
                // Layer may already exist after rapid style changes
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
            map.addLayer(layerSpec, beforeId);
            addedLayers.current.add(layerId);
          } catch {
            // Layer may already exist after rapid style changes
          }
        }
      }

      // The base labels draw above the tint now; while a base fill is active,
      // apply the site's label design to them (see lib/map-labels.ts).
      const baseFillActive = layerConfigs.some(
        (l) => BASE_LAYER_IDS.includes(l.id) && activeLayers.includes(l.id) && map.getLayer(l.id)
      );
      const labelTheme = baseFillActive ? (isDark ? 'dark' : 'light') : null;
      if (labelTheme !== labelThemeRef.current) {
        try {
          applyLabelClasses(map, labelTheme, labelMemoRef.current);
          labelThemeRef.current = labelTheme;
        } catch {
          // Style mid-swap; style.load re-runs this
        }
      }
    };

    // Run the sync immediately. `addLayer`/`removeLayer`/`addSource` are safe
    // to call after the map's `load` event (which is what gates the `map` prop
    // being set). Gating on `isStyleLoaded()` would skip the sync when any
    // source is mid-fetch — causing rapid-toggle races where a quick OFF click
    // after an ON click never gets processed (and `style.load` only fires on
    // setStyle, not on source loads).
    handleStyleLoad();

    // Also listen for style.load event (for when style changes via setStyle).
    // A fresh style needs its water lifted again before fills are placed.
    const onStyleLoad = () => {
      restackedRef.current = false;
      labelThemeRef.current = null;
      labelMemoRef.current.clear();
      handleStyleLoad();
    };
    map.on('style.load', onStyleLoad);

    return () => {
      map.off('style.load', onStyleLoad);
    };
  }, [map, activeLayers, layerConfigs, isDark]);

  // Apply filters to layers
  useEffect(() => {
    if (!map) return;

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
