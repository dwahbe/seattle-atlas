'use client';

import { useState, useCallback, useRef } from 'react';
import type { Map as MapboxMap, LngLatLike } from 'mapbox-gl';
import type { MapViewState } from '@/types';

export function useMapState(initialViewState: MapViewState) {
  const mapRef = useRef<MapboxMap | null>(null);
  const [viewState, setViewStateInternal] = useState<MapViewState>(initialViewState);

  const setMap = useCallback((map: MapboxMap | null) => {
    mapRef.current = map;
  }, []);

  const setViewState = useCallback((state: MapViewState) => {
    setViewStateInternal(state);
  }, []);

  const flyTo = useCallback(
    (center: LngLatLike, zoom?: number) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center,
          zoom: zoom ?? viewState.zoom,
          duration: 1500,
        });
      }
    },
    [viewState.zoom]
  );

  const easeTo = useCallback(
    (center: LngLatLike, zoom?: number) => {
      if (mapRef.current) {
        mapRef.current.easeTo({
          center,
          zoom: zoom ?? viewState.zoom,
          duration: 500,
        });
      }
    },
    [viewState.zoom]
  );

  const fitBounds = useCallback((bounds: [number, number, number, number], padding?: number) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        {
          padding: padding ?? 50,
          duration: 1000,
        }
      );
    }
  }, []);

  const getMap = useCallback(() => mapRef.current, []);

  return {
    map: mapRef.current,
    getMap,
    setMap,
    viewState,
    setViewState,
    flyTo,
    easeTo,
    fitBounds,
  };
}
