'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { MapGL } from './MapGL';
import { MapLayers } from './MapLayers';
import { ControlPanel } from '@/components/panels/ControlPanel';
import { InspectPanel } from '@/components/panels/InspectPanel';
import { MobileDrawer } from '@/components/mobile/MobileDrawer';
import {
  BASE_LAYER_IDS,
  TRANSIT_LAYER_IDS,
  BIKE_LAYER_ID,
  PARKS_LAYER_ID,
  INSTITUTIONS_LAYER_ID,
} from '@/lib/constants';
import { getInstitutionInfo } from '@/lib/institutions';
import { PanelSearch } from '@/components/search';
import { NavMenu } from '@/components/ui';
import dynamic from 'next/dynamic';

const OnboardingTour = dynamic(
  () => import('@/components/ui/OnboardingTour').then((mod) => mod.OnboardingTour),
  { ssr: false }
);
import { useUrlState } from '@/hooks/useUrlState';
import { useMapState } from '@/hooks/useMapState';
import { useLayers } from '@/hooks/useLayers';
import { useInspect } from '@/hooks/useInspect';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { InspectedFeature, SearchResult } from '@/types';

export function MapContainer() {
  useEffect(() => {
    document.documentElement.classList.add('scroll-lock');
    document.body.classList.add('scroll-lock');

    return () => {
      document.documentElement.classList.remove('scroll-lock');
      document.body.classList.remove('scroll-lock');
    };
  }, []);

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
  const { resolvedTheme } = useTheme();

  // Responsive
  const isMobile = useIsMobile();

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

          // Separate query for the institutions overlay — it has fill-opacity 0
          // and a different layerId, so it's not the primary feature but we
          // attach its data when the click point falls inside one.
          const institutionFeature = mapInstance.getLayer(INSTITUTIONS_LAYER_ID)
            ? mapInstance.queryRenderedFeatures(point, { layers: [INSTITUTIONS_LAYER_ID] })[0]
            : undefined;
          const institution = institutionFeature
            ? (getInstitutionInfo(
                institutionFeature.properties?.OVERLAY,
                institutionFeature.properties?.DESCRIPTION
              ) ?? undefined)
            : undefined;

          setInspectedFeature({
            id: feature.id ?? feature.properties?.id ?? `${layerId}-${Date.now()}`,
            layerId,
            properties: feature.properties as Record<string, unknown>,
            geometry: feature.geometry,
            ...(institution && { institution }),
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

  // Base layer change handler (mutually exclusive). Parks and the institutions
  // overlay both ride along with zoning — they turn on when zoning turns on
  // and off when zoning turns off.
  const handleBaseLayerChange = useCallback(
    (layerId: string | null) => {
      // Strip existing base layers, parks, and institutions so we can rewrite cleanly.
      const withoutBase = activeLayers.filter(
        (id) =>
          !BASE_LAYER_IDS.includes(id) && id !== PARKS_LAYER_ID && id !== INSTITUTIONS_LAYER_ID
      );
      if (layerId) {
        setUrlActiveLayers([layerId, PARKS_LAYER_ID, INSTITUTIONS_LAYER_ID, ...withoutBase]);
      } else {
        setUrlActiveLayers(withoutBase);
      }
    },
    [activeLayers, setUrlActiveLayers]
  );

  // Transit toggle handler (combines routes and stops)
  const handleTransitToggle = useCallback(
    (enabled: boolean) => {
      const withoutTransit = activeLayers.filter((id) => !TRANSIT_LAYER_IDS.includes(id));
      if (enabled) {
        setUrlActiveLayers([...withoutTransit, ...TRANSIT_LAYER_IDS]);
      } else {
        setUrlActiveLayers(withoutTransit);
      }
    },
    [activeLayers, setUrlActiveLayers]
  );

  // Bike infrastructure toggle handler
  const handleBikeToggle = useCallback(
    (enabled: boolean) => {
      const withoutBike = activeLayers.filter((id) => id !== BIKE_LAYER_ID);
      if (enabled) {
        setUrlActiveLayers([...withoutBike, BIKE_LAYER_ID]);
      } else {
        setUrlActiveLayers(withoutBike);
      }
    },
    [activeLayers, setUrlActiveLayers]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
        showControls={!isMobile}
        showHoverTooltip={!isMobile}
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
          {/* Floating search bar and nav at top */}
          {/* z-40 sits above the drawer (z-30) so the search backdrop can cover
              and block drawer dragging while search is open; when closed this
              bar only occupies the top strip so the drawer stays interactive.
              pointer-events-auto: the always-open vaul drawer puts the body in
              pointer-events:none (Radix DismissableLayer), so this floating bar
              must opt back in or taps never reach the search/nav. */}
          <div className="pointer-events-auto absolute top-4 left-4 right-4 z-40 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <PanelSearch onSelect={handleSearchSelect} variant="mobile" />
            </div>
            <NavMenu />
          </div>

          <MobileDrawer
            layers={layers}
            activeLayers={activeLayers}
            filters={filters}
            onBaseLayerChange={handleBaseLayerChange}
            onTransitToggle={handleTransitToggle}
            onBikeToggle={handleBikeToggle}
            onFilterChange={setFilter}
            inspectedFeature={inspectedFeature}
            proposals={relatedProposals}
            onCloseInspect={clearInspection}
            layerConfigs={activeLayerConfigs}
            searchedAddress={searchedAddress}
            clickPoint={markerPosition}
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
            onSearchSelect={handleSearchSelect}
          />

          {/* Inspect Panel (right) */}
          <InspectPanel
            feature={inspectedFeature}
            proposals={relatedProposals}
            onClose={clearInspection}
            isOpen={inspectedFeature !== null}
            layerConfigs={activeLayerConfigs}
            searchedAddress={searchedAddress}
            clickPoint={markerPosition}
            shareUrl={shareableUrl}
          />
        </>
      )}

      {/* Onboarding tour for first-time desktop users */}
      {!isMobile && <OnboardingTour />}
    </div>
  );
}
