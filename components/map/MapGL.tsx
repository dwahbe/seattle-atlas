'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMapbox, MAP_STYLES, MAPBOX_TOKEN } from '@/lib/mapbox';
import { HoverTooltip } from './HoverTooltip';
import type { MapViewState, InspectedFeature, LayerConfig } from '@/types';

interface HoverState {
  x: number;
  y: number;
  properties: Record<string, unknown>;
  layerId: string;
}

interface MapGLProps {
  viewState: MapViewState;
  onViewStateChange: (state: MapViewState) => void;
  onMapLoad: (map: mapboxgl.Map) => void;
  onFeatureClick: (feature: InspectedFeature | null, clickPoint: [number, number] | null) => void;
  activeLayers: string[];
  layerConfigs: LayerConfig[];
  isDark: boolean;
  inspectedFeature: InspectedFeature | null;
  highlightedBounds?: [number, number, number, number] | null;
  markerPosition?: [number, number] | null;
  showControls?: boolean;
}

const HIGHLIGHT_SOURCE_ID = 'neighborhood-highlight-source';
const HIGHLIGHT_LAYER_ID = 'neighborhood-highlight-layer';
const HIGHLIGHT_OUTLINE_LAYER_ID = 'neighborhood-highlight-outline';

export function MapGL({
  viewState,
  onViewStateChange,
  onMapLoad,
  onFeatureClick,
  activeLayers,
  layerConfigs,
  isDark,
  inspectedFeature,
  highlightedBounds,
  markerPosition,
  showControls = true,
}: MapGLProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const isInitialized = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const previousInspectedRef = useRef<{ source: string; id: string | number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || isInitialized.current) return;
    if (!MAPBOX_TOKEN) {
      console.error(
        'Mapbox token not found. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file.'
      );
      return;
    }

    initializeMapbox();
    isInitialized.current = true;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? MAP_STYLES.dark : MAP_STYLES.light,
      center: [viewState.lng, viewState.lat],
      zoom: viewState.zoom,
      attributionControl: false,
    });

    if (showControls) {
      // Add navigation control
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      // Add scale control
      mapInstance.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }),
        'bottom-right'
      );

      // Add attribution control
      mapInstance.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    }

    mapInstance.on('load', () => {
      map.current = mapInstance;
      setIsLoaded(true);
      onMapLoad(mapInstance);
    });

    // Track view state changes
    mapInstance.on('moveend', () => {
      const center = mapInstance.getCenter();
      const zoom = mapInstance.getZoom();
      onViewStateChange({
        lat: center.lat,
        lng: center.lng,
        zoom,
      });
    });

    return () => {
      mapInstance.remove();
      map.current = null;
      isInitialized.current = false;
      setIsLoaded(false);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle style changes (dark/light mode)
  useEffect(() => {
    if (!map.current) return;

    const newStyle = isDark ? MAP_STYLES.dark : MAP_STYLES.light;
    map.current.setStyle(newStyle);
  }, [isDark]);

  // Handle click events
  const handleClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!map.current) return;

      const clickPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: activeLayers.filter((id) => map.current?.getLayer(id)),
      });

      if (features.length > 0) {
        const feature = features[0];
        const layerId = feature.layer?.id ?? 'unknown';
        onFeatureClick(
          {
            id: feature.id ?? feature.properties?.id ?? `${layerId}-${Date.now()}`,
            layerId,
            properties: feature.properties as Record<string, unknown>,
            geometry: feature.geometry,
          },
          clickPoint
        );
      } else {
        onFeatureClick(null, clickPoint);
      }
    },
    [activeLayers, onFeatureClick]
  );

  // Handle cursor and hover tooltip
  const handleMouseMove = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!map.current) return;

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: activeLayers.filter((id) => map.current?.getLayer(id)),
      });

      map.current.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';

      if (features.length > 0) {
        const feature = features[0];
        setHoverState({
          x: e.point.x,
          y: e.point.y,
          properties: feature.properties as Record<string, unknown>,
          layerId: feature.layer?.id ?? '',
        });
      } else {
        setHoverState(null);
      }
    },
    [activeLayers]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoverState(null);
  }, []);

  // Handle drag start (clears tooltip on mobile when panning)
  const handleDragStart = useCallback(() => {
    setHoverState(null);
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const canvas = map.current.getCanvas();

    map.current.on('click', handleClick);
    map.current.on('mousemove', handleMouseMove);
    map.current.on('dragstart', handleDragStart);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (map.current) {
        map.current.off('click', handleClick);
        map.current.off('mousemove', handleMouseMove);
        map.current.off('dragstart', handleDragStart);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isLoaded, handleClick, handleMouseMove, handleMouseLeave, handleDragStart]);

  // Handle inspected feature highlight
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const mapInstance = map.current;

    // Clear previous highlight
    if (previousInspectedRef.current) {
      try {
        const { source, id } = previousInspectedRef.current;
        const layerConfig = layerConfigs.find((l) => l.id === source);
        if (layerConfig && mapInstance.getSource(`source-${source}`)) {
          mapInstance.setFeatureState(
            { source: `source-${source}`, sourceLayer: layerConfig.sourceLayer, id },
            { inspected: false }
          );
        }
      } catch {
        // Source may have been removed
      }
      previousInspectedRef.current = null;
    }

    // Set new highlight
    if (inspectedFeature) {
      const layerConfig = layerConfigs.find((l) => l.id === inspectedFeature.layerId);
      if (layerConfig && mapInstance.getSource(`source-${inspectedFeature.layerId}`)) {
        try {
          mapInstance.setFeatureState(
            {
              source: `source-${inspectedFeature.layerId}`,
              sourceLayer: layerConfig.sourceLayer,
              id: inspectedFeature.id,
            },
            { inspected: true }
          );
          previousInspectedRef.current = {
            source: inspectedFeature.layerId,
            id: inspectedFeature.id,
          };
        } catch (error) {
          console.warn('Failed to set feature state:', error);
        }
      }
    }
  }, [isLoaded, inspectedFeature, layerConfigs]);

  // Handle neighborhood boundary highlight
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const mapInstance = map.current;

    // Helper to remove existing highlight layers
    const removeHighlight = () => {
      if (mapInstance.getLayer(HIGHLIGHT_OUTLINE_LAYER_ID)) {
        mapInstance.removeLayer(HIGHLIGHT_OUTLINE_LAYER_ID);
      }
      if (mapInstance.getLayer(HIGHLIGHT_LAYER_ID)) {
        mapInstance.removeLayer(HIGHLIGHT_LAYER_ID);
      }
      if (mapInstance.getSource(HIGHLIGHT_SOURCE_ID)) {
        mapInstance.removeSource(HIGHLIGHT_SOURCE_ID);
      }
    };

    // Remove existing highlight first
    removeHighlight();

    // Add new highlight if bounds provided
    if (highlightedBounds) {
      const [west, south, east, north] = highlightedBounds;

      // Create a polygon from bounds
      const polygon: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south], // Close the polygon
            ],
          ],
        },
      };

      // Add source
      mapInstance.addSource(HIGHLIGHT_SOURCE_ID, {
        type: 'geojson',
        data: polygon,
      });

      // Add fill layer (subtle)
      mapInstance.addLayer({
        id: HIGHLIGHT_LAYER_ID,
        type: 'fill',
        source: HIGHLIGHT_SOURCE_ID,
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': 0.08,
        },
      });

      // Add outline layer (more visible)
      mapInstance.addLayer({
        id: HIGHLIGHT_OUTLINE_LAYER_ID,
        type: 'line',
        source: HIGHLIGHT_SOURCE_ID,
        paint: {
          'line-color': '#3B82F6',
          'line-width': 3,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2],
        },
      });
    }

    return () => {
      // Clean up on unmount or when bounds change
      if (map.current) {
        removeHighlight();
      }
    };
  }, [isLoaded, highlightedBounds]);

  // Handle marker for neighborhood centers
  useEffect(() => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if position provided and map is ready
    if (markerPosition && map.current) {
      const marker = new mapboxgl.Marker({
        color: '#3B82F6', // Match the highlight color
      })
        .setLngLat(markerPosition)
        .addTo(map.current);

      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [markerPosition, isLoaded]);

  // Get the layer config for the hovered feature
  const hoveredLayerConfig = hoverState
    ? layerConfigs.find((config) => config.id === hoverState.layerId) || null
    : null;

  return (
    <>
      <div
        ref={mapContainer}
        className="absolute inset-0 z-0"
        style={{ width: '100%', height: '100%' }}
      />
      {hoverState && hoveredLayerConfig && (
        <HoverTooltip
          x={hoverState.x}
          y={hoverState.y}
          properties={hoverState.properties}
          layerConfig={hoveredLayerConfig}
        />
      )}
    </>
  );
}
