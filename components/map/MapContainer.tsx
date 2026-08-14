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
import { queryInspectableFeature } from '@/lib/mapbox';
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
    pinPosition,
    shareableUrl,
    setViewState: setUrlViewState,
    setActiveLayers: setUrlActiveLayers,
    setFilter,
    setInspectedFeatureId,
    setPinPosition,
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

  // Searched address state - preserves exact address from search
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);

  // Whether the open inspection was restored from a deep link rather than a
  // user gesture — surfaces that would otherwise grab focus or move the sheet
  // out from under the reader stay put when nobody asked for the panel.
  const [autoOpened, setAutoOpened] = useState(false);

  // Wrap clearInspection to also clear the pin and search state
  const clearInspection = useCallback(() => {
    clearInspectionBase();
    setPinPosition(null);
    setSearchedAddress(null);
    setHighlightedBounds(null);
    setAutoOpened(false);
  }, [clearInspectionBase, setPinPosition]);

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
    (
      feature: InspectedFeature | null,
      clickPoint: [number, number] | null,
      options?: { restored?: boolean }
    ) => {
      // A deep-link restore re-reports state the URL already holds; only a real
      // click invalidates the searched address.
      if (!options?.restored) setSearchedAddress(null);
      setAutoOpened(options?.restored === true);
      setInspectedFeature(feature);

      // Set the pin at the click location (or clear if no feature)
      if (feature && clickPoint) {
        setPinPosition(clickPoint);
      } else {
        setPinPosition(null);
      }
    },
    [setInspectedFeature, setPinPosition]
  );

  // Search handler
  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      // Clear any existing highlight
      setHighlightedBounds(null);

      // Helper to query and inspect feature at location after map settles.
      // Address searches prefer the zoning parcel over overlays sitting above it.
      const inspectFeatureAtLocation = () => {
        if (!mapInstance) return;

        const feature = queryInspectableFeature(mapInstance, result.center, activeLayers, {
          preferZoning: true,
        });

        if (feature) {
          setInspectedFeature(feature);
        } else {
          // Nothing inspectable here (zoning toggled off, water, outside
          // coverage). Clear the inspect target rather than leaving the
          // previously inspected feature paired with the new pin point —
          // or an orphaned, undismissable pin. The neighborhood highlight
          // stays; it marks the searched area independently of the panel.
          setInspectedFeature(null);
          setPinPosition(null);
          setSearchedAddress(null);
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

      // Branch-specific state: neighborhood highlight and header text
      if (result.type === 'neighborhood' && result.bbox) {
        setHighlightedBounds(result.bbox);
        setSearchedAddress(result.name); // Show neighborhood name in header
      } else if (result.type === 'address') {
        setSearchedAddress(result.name); // Preserve the exact searched address
      } else {
        setSearchedAddress(null);
      }

      // Shared tail for every result type. The pin doubles as the
      // clickPoint for parcel/reverse-geocode lookups — without it they fall
      // back to the zoning polygon's centroid, which can sit in a neighboring
      // parcel (or reuse a stale point from an earlier map click).
      setPinPosition(result.center);
      if (result.bbox) {
        fitBounds(result.bbox);
      } else {
        flyTo(result.center, result.type === 'address' ? 17 : 16);
      }
      waitAndInspect();
    },
    [flyTo, fitBounds, mapInstance, activeLayers, setInspectedFeature, setPinPosition]
  );

  // Clear neighborhood highlight when clicking on map (the pin is managed by handleFeatureClick)
  const handleMapClick = useCallback(() => {
    if (highlightedBounds) {
      setHighlightedBounds(null);
    }
  }, [highlightedBounds]);

  // Memoized so MapGL's listener and restore effects don't re-register on
  // every render of this component (it re-renders on every map move).
  const handleMapFeatureClick = useCallback(
    (
      feature: InspectedFeature | null,
      clickPoint: [number, number] | null,
      options?: { restored?: boolean }
    ) => {
      handleFeatureClick(feature, clickPoint, options);
      // A restore reports state the URL already held; it isn't a map click, so
      // it must not clear the neighborhood highlight a search just set.
      if (!options?.restored) handleMapClick();
    },
    [handleFeatureClick, handleMapClick]
  );

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
        onFeatureClick={handleMapFeatureClick}
        activeLayers={activeLayers}
        layerConfigs={layers}
        isDark={resolvedTheme === 'dark'}
        inspectedFeature={inspectedFeature}
        highlightedBounds={highlightedBounds}
        pinPosition={pinPosition}
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
            clickPoint={pinPosition}
            autoOpened={autoOpened}
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
            clickPoint={pinPosition}
            shareUrl={shareableUrl}
            autoFocus={!autoOpened}
          />
        </>
      )}

      {/* Onboarding tour for first-time desktop users */}
      {!isMobile && <OnboardingTour />}
    </div>
  );
}
