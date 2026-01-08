'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { MapGL } from './MapGL';
import { MapLayers } from './MapLayers';
import { ControlPanel } from '@/components/panels/ControlPanel';
import { InspectPanel } from '@/components/panels/InspectPanel';
import { ShareBar } from '@/components/panels/ShareBar';
import { CommandPalette } from '@/components/search';
import { MobileDrawer } from '@/components/mobile/MobileDrawer';
import { useUrlState } from '@/hooks/useUrlState';
import { useMapState } from '@/hooks/useMapState';
import { useLayers } from '@/hooks/useLayers';
import { useInspect } from '@/hooks/useInspect';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { getProposals } from '@/lib/proposals';
import type { InspectedFeature, SearchResult } from '@/types';

export function MapContainer() {
  // URL state (source of truth)
  const {
    viewState: urlViewState,
    activeLayers: urlActiveLayers,
    filters,
    inspectedFeatureId,
    shareableUrl,
    setViewState: setUrlViewState,
    setActiveLayers: setUrlActiveLayers,
    setFilter,
    setInspectedFeatureId,
  } = useUrlState();

  // Map state
  const { setMap, flyTo, fitBounds } = useMapState(urlViewState);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);

  // Layer state
  const { layers, activeLayers, getActiveLayerConfigs } = useLayers({
    activeLayers: urlActiveLayers,
    onLayersChange: setUrlActiveLayers,
  });

  // Inspect state
  const {
    inspectedFeature,
    setInspectedFeature,
    clearInspection: clearInspectionBase,
    relatedProposals,
  } = useInspect({
    inspectedFeatureId,
    onInspectedFeatureIdChange: setInspectedFeatureId,
  });

  // Theme
  const { resolvedTheme, setTheme } = useTheme();

  // Responsive
  const isMobile = useIsMobile();

  // Panel collapse state
  const [controlPanelCollapsed, setControlPanelCollapsed] = useState(false);

  // Neighborhood highlight state
  const [highlightedBounds, setHighlightedBounds] = useState<
    [number, number, number, number] | null
  >(null);

  // Marker position for neighborhood centers
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  // Searched address state - preserves exact address from search
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);

  // Wrap clearInspection to also clear marker and search state
  const clearInspection = useCallback(() => {
    clearInspectionBase();
    setMarkerPosition(null);
    setSearchedAddress(null);
    setHighlightedBounds(null);
  }, [clearInspectionBase]);

  // All proposals for inspect panel
  const allProposals = useMemo(() => getProposals(), []);

  // Get active layer configs
  const activeLayerConfigs = useMemo(() => getActiveLayerConfigs(), [getActiveLayerConfigs]);

  // Map event handlers
  const handleMapLoad = useCallback(
    (map: MapboxMap) => {
      setMapInstance(map);
      setMap(map);
    },
    [setMap]
  );

  const handleViewStateChange = useCallback(
    (state: { lat: number; lng: number; zoom: number }) => {
      setUrlViewState(state);
    },
    [setUrlViewState]
  );

  const handleFeatureClick = useCallback(
    (feature: InspectedFeature | null, clickPoint: [number, number] | null) => {
      // Clear searched address when clicking directly on map
      setSearchedAddress(null);
      setInspectedFeature(feature);

      // Set marker at the click location (or clear if no feature)
      if (feature && clickPoint) {
        setMarkerPosition(clickPoint);
      } else {
        setMarkerPosition(null);
      }
    },
    [setInspectedFeature]
  );

  // Search handler
  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      // Clear any existing highlight
      setHighlightedBounds(null);

      // Helper to query and inspect feature at location after map settles
      const inspectFeatureAtLocation = () => {
        if (!mapInstance) return;

        // Convert lng/lat to screen coordinates
        const point = mapInstance.project(result.center);

        // Query features at this point, prioritizing zoning layers
        const queryLayers = activeLayers.filter((id) => mapInstance.getLayer(id));
        const features = mapInstance.queryRenderedFeatures(point, {
          layers: queryLayers,
        });

        if (features.length > 0) {
          // Prefer zoning layers for address searches
          const zoningFeature = features.find(
            (f) => f.layer?.id === 'zoning' || f.layer?.id === 'zoning_detailed'
          );
          const feature = zoningFeature || features[0];
          const layerId = feature.layer?.id ?? 'unknown';

          setInspectedFeature({
            id: feature.id ?? feature.properties?.id ?? `${layerId}-${Date.now()}`,
            layerId,
            properties: feature.properties as Record<string, unknown>,
            geometry: feature.geometry,
          });
        }
      };

      // Wait for map animation to complete, then tiles to load before querying
      const waitAndInspect = () => {
        if (!mapInstance) return;
        // Use moveend for animation, then idle for tile loading
        const onMoveEnd = () => {
          // Give tiles a moment to load, then query
          mapInstance.once('idle', inspectFeatureAtLocation);
        };
        mapInstance.once('moveend', onMoveEnd);
      };

      // If it's a neighborhood with bounds, show the highlight and inspect at center
      if (result.type === 'neighborhood' && result.bbox) {
        setHighlightedBounds(result.bbox);
        setMarkerPosition(result.center); // Show pin at neighborhood center
        setSearchedAddress(result.name); // Show neighborhood name in header
        fitBounds(result.bbox);
        waitAndInspect(); // Query and show inspect panel for center location
      } else if (result.type === 'address') {
        // For addresses, preserve the exact searched address
        setSearchedAddress(result.name);
        if (result.bbox) {
          fitBounds(result.bbox);
        } else {
          flyTo(result.center, 17);
        }
        waitAndInspect();
      } else {
        // For other places
        setSearchedAddress(null);
        if (result.bbox) {
          fitBounds(result.bbox);
        } else {
          flyTo(result.center, 16);
        }
        waitAndInspect();
      }
    },
    [flyTo, fitBounds, mapInstance, activeLayers, setInspectedFeature]
  );

  // Clear neighborhood highlight when clicking on map (marker is managed by handleFeatureClick)
  const handleMapClick = useCallback(() => {
    if (highlightedBounds) {
      setHighlightedBounds(null);
    }
  }, [highlightedBounds]);

  // Base layer change handler (mutually exclusive)
  const handleBaseLayerChange = useCallback(
    (layerId: string | null) => {
      const baseLayerIds = ['zoning', 'zoning_detailed'];
      // Remove all base layers first
      const withoutBaseLayers = activeLayers.filter((id) => !baseLayerIds.includes(id));
      // Add the new base layer if specified
      if (layerId) {
        setUrlActiveLayers([layerId, ...withoutBaseLayers]);
      } else {
        setUrlActiveLayers(withoutBaseLayers);
      }
    },
    [activeLayers, setUrlActiveLayers]
  );

  // Transit toggle handler (combines routes and stops)
  const handleTransitToggle = useCallback(
    (enabled: boolean) => {
      const transitLayerIds = ['transit_routes', 'transit_stops', 'light_rail'];
      const withoutTransit = activeLayers.filter((id) => !transitLayerIds.includes(id));
      if (enabled) {
        setUrlActiveLayers([...withoutTransit, ...transitLayerIds]);
      } else {
        setUrlActiveLayers(withoutTransit);
      }
    },
    [activeLayers, setUrlActiveLayers]
  );

  // Bike infrastructure toggle handler
  const handleBikeToggle = useCallback(
    (enabled: boolean) => {
      const bikeLayerId = 'bike_facilities';
      const withoutBike = activeLayers.filter((id) => id !== bikeLayerId);
      if (enabled) {
        setUrlActiveLayers([...withoutBike, bikeLayerId]);
      } else {
        setUrlActiveLayers(withoutBike);
      }
    },
    [activeLayers, setUrlActiveLayers]
  );

  // Copy URL handler
  const handleCopyUrl = useCallback(() => {
    const fullUrl = window.location.origin + shareableUrl;
    navigator.clipboard.writeText(fullUrl);
  }, [shareableUrl]);

  // Command palette action handler
  const handleCommandAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'toggle-transit': {
          const transitLayerIds = ['transit_routes', 'transit_stops', 'light_rail'];
          const isTransitActive = transitLayerIds.some((id) => activeLayers.includes(id));
          handleTransitToggle(!isTransitActive);
          break;
        }
        case 'toggle-theme':
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          break;
      }
    },
    [activeLayers, handleTransitToggle, resolvedTheme, setTheme]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Command Palette (Cmd+K) */}
      <CommandPalette onSelect={handleSearchSelect} onAction={handleCommandAction} />

      {/* Map */}
      <MapGL
        viewState={urlViewState}
        onViewStateChange={handleViewStateChange}
        onMapLoad={handleMapLoad}
        onFeatureClick={(feature, clickPoint) => {
          handleFeatureClick(feature, clickPoint);
          handleMapClick();
        }}
        activeLayers={activeLayers}
        layerConfigs={layers}
        isDark={resolvedTheme === 'dark'}
        inspectedFeature={inspectedFeature}
        highlightedBounds={highlightedBounds}
        markerPosition={markerPosition}
      />

      {/* Map Layers Manager */}
      <MapLayers
        map={mapInstance}
        layerConfigs={layers}
        activeLayers={activeLayers}
        filters={filters}
      />

      {isMobile ? (
        /* Mobile Layout */
        <>
          <MobileDrawer
            layers={layers}
            activeLayers={activeLayers}
            filters={filters}
            onBaseLayerChange={handleBaseLayerChange}
            onTransitToggle={handleTransitToggle}
            onBikeToggle={handleBikeToggle}
            onFilterChange={setFilter}
            inspectedFeature={inspectedFeature}
            proposals={relatedProposals.length > 0 ? relatedProposals : allProposals}
            onCloseInspect={clearInspection}
            layerConfigs={activeLayerConfigs}
            searchedAddress={searchedAddress}
          />
        </>
      ) : (
        /* Desktop Layout */
        <>
          {/* Control Panel (left) */}
          <ControlPanel
            layers={layers}
            activeLayers={activeLayers}
            filters={filters}
            onBaseLayerChange={handleBaseLayerChange}
            onTransitToggle={handleTransitToggle}
            onBikeToggle={handleBikeToggle}
            onFilterChange={setFilter}
            isCollapsed={controlPanelCollapsed}
            onToggleCollapse={() => setControlPanelCollapsed(!controlPanelCollapsed)}
          />

          {/* Inspect Panel (right) */}
          <InspectPanel
            feature={inspectedFeature}
            proposals={relatedProposals.length > 0 ? relatedProposals : allProposals}
            onClose={clearInspection}
            isOpen={inspectedFeature !== null}
            layerConfigs={activeLayerConfigs}
            searchedAddress={searchedAddress}
          />

          {/* Share Bar (bottom) */}
          <ShareBar onCopy={handleCopyUrl} />
        </>
      )}
    </div>
  );
}
