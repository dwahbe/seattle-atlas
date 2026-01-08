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
  const { inspectedFeature, setInspectedFeature, clearInspection, relatedProposals } = useInspect({
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
    (feature: InspectedFeature | null) => {
      setInspectedFeature(feature);
    },
    [setInspectedFeature]
  );

  // Search handler
  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      // If it's a neighborhood with bounds, show the highlight
      if (result.type === 'neighborhood' && result.bbox) {
        setHighlightedBounds(result.bbox);
        fitBounds(result.bbox);
      } else if (result.bbox) {
        setHighlightedBounds(null);
        fitBounds(result.bbox);
      } else {
        setHighlightedBounds(null);
        flyTo(result.center, 16);
      }
    },
    [flyTo, fitBounds]
  );

  // Clear highlight when clicking on map
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
      const transitLayerIds = ['transit_routes', 'transit_stops'];
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
          const transitLayerIds = ['transit_routes', 'transit_stops'];
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
        onFeatureClick={(feature) => {
          handleFeatureClick(feature);
          handleMapClick();
        }}
        activeLayers={activeLayers}
        layerConfigs={layers}
        isDark={resolvedTheme === 'dark'}
        inspectedFeature={inspectedFeature}
        highlightedBounds={highlightedBounds}
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
          />

          {/* Share Bar (bottom) */}
          <ShareBar onCopy={handleCopyUrl} />
        </>
      )}
    </div>
  );
}
