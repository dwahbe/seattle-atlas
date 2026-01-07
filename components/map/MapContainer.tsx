'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { MapGL } from './MapGL';
import { MapLayers } from './MapLayers';
import { ControlPanel } from '@/components/panels/ControlPanel';
import { InspectPanel } from '@/components/panels/InspectPanel';
import { ShareBar } from '@/components/panels/ShareBar';
import { SearchBar } from '@/components/search/SearchBar';
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
    setInspectedFeatureId,
  } = useUrlState();

  // Map state
  const { setMap, flyTo, fitBounds } = useMapState(urlViewState);
  const [mapInstance, setMapInstance] = useState<MapboxMap | null>(null);

  // Layer state
  const { layers, layerGroups, activeLayers, toggleLayer, getActiveLayerConfigs } = useLayers({
    activeLayers: urlActiveLayers,
    onLayersChange: setUrlActiveLayers,
  });

  // Inspect state
  const { inspectedFeature, setInspectedFeature, clearInspection, relatedProposals } = useInspect({
    inspectedFeatureId,
    onInspectedFeatureIdChange: setInspectedFeatureId,
  });

  // Theme
  const { resolvedTheme } = useTheme();

  // Responsive
  const isMobile = useIsMobile();

  // Panel collapse state
  const [controlPanelCollapsed, setControlPanelCollapsed] = useState(false);

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
      if (result.bbox) {
        fitBounds(result.bbox);
      } else {
        flyTo(result.center, 16);
      }
    },
    [flyTo, fitBounds]
  );

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

  // Copy URL handler
  const handleCopyUrl = useCallback(() => {
    const fullUrl = window.location.origin + shareableUrl;
    navigator.clipboard.writeText(fullUrl);
  }, [shareableUrl]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map */}
      <MapGL
        viewState={urlViewState}
        onViewStateChange={handleViewStateChange}
        onMapLoad={handleMapLoad}
        onFeatureClick={handleFeatureClick}
        activeLayers={activeLayers}
        layerConfigs={layers}
        isDark={resolvedTheme === 'dark'}
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
          {/* Floating Search Bar */}
          <div className="absolute top-0 left-0 right-0 z-[5] p-3 pt-[env(safe-area-inset-top)] touch-scroll-lock">
            <div className="pt-3">
              <SearchBar onSelect={handleSearchSelect} placeholder="Search Seattle..." />
            </div>
          </div>

          <MobileDrawer
            layers={layers}
            layerGroups={layerGroups}
            activeLayers={activeLayers}
            onLayerToggle={toggleLayer}
            onBaseLayerChange={handleBaseLayerChange}
            onTransitToggle={handleTransitToggle}
            inspectedFeature={inspectedFeature}
            proposals={relatedProposals.length > 0 ? relatedProposals : allProposals}
            onCloseInspect={clearInspection}
            layerConfigs={activeLayerConfigs}
          />
        </>
      ) : (
        /* Desktop Layout */
        <>
          {/* Search Bar (top) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[5] w-full max-w-md px-4">
            <SearchBar onSelect={handleSearchSelect} />
          </div>

          {/* Control Panel (left) */}
          <ControlPanel
            layers={layers}
            layerGroups={layerGroups}
            activeLayers={activeLayers}
            onLayerToggle={toggleLayer}
            onBaseLayerChange={handleBaseLayerChange}
            onTransitToggle={handleTransitToggle}
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
