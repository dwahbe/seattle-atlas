'use client';

import { useQueryStates, parseAsFloat, parseAsString, parseAsBoolean } from 'nuqs';
import { useCallback, useMemo } from 'react';
import {
  SEATTLE_CENTER,
  parseLayersParam,
  serializeLayersParam,
  parseFiltersParam,
  serializeFiltersParam,
  parsePinParam,
  serializePinParam,
  buildShareableUrl,
} from '@/lib/url-state';
import type { MapStateParam } from '@/lib/url-state';
import type { MapViewState, FilterState } from '@/types';

// `satisfies Record<MapStateParam, unknown>` makes the build fail if these
// keys ever drift from MAP_STATE_PARAMS (the list the intro-skip logic uses).
const urlParsers = {
  lat: parseAsFloat.withDefault(SEATTLE_CENTER.lat),
  lng: parseAsFloat.withDefault(SEATTLE_CENTER.lng),
  z: parseAsFloat.withDefault(SEATTLE_CENTER.zoom),
  layers: parseAsString, // No default - we handle it in parseLayersParam
  filters: parseAsString.withDefault(''),
  inspect: parseAsString.withDefault(''),
  pin: parseAsString.withDefault(''),
  compare: parseAsBoolean.withDefault(false),
} satisfies Record<MapStateParam, unknown>;

export function useUrlState() {
  const [params, setParams] = useQueryStates(urlParsers, {
    history: 'replace',
    shallow: true,
    throttleMs: 100,
  });

  // Parsed state values
  const viewState: MapViewState = useMemo(
    () => ({
      lat: params.lat,
      lng: params.lng,
      zoom: params.z,
    }),
    [params.lat, params.lng, params.z]
  );

  const activeLayers = useMemo(() => parseLayersParam(params.layers), [params.layers]);

  const filters = useMemo(
    () => parseFiltersParam(params.filters) as unknown as FilterState,
    [params.filters]
  );

  const inspectedFeatureId = params.inspect || null;
  // The inspect marker / click point ([lng, lat]); see MapGL's deep-link restore.
  const pinPosition = useMemo(() => parsePinParam(params.pin), [params.pin]);
  const compareMode = params.compare;

  // Setters
  const setViewState = useCallback(
    (state: MapViewState) => {
      setParams({
        lat: state.lat,
        lng: state.lng,
        z: state.zoom,
      });
    },
    [setParams]
  );

  const setActiveLayers = useCallback(
    (layers: string[]) => {
      setParams({ layers: serializeLayersParam(layers) });
    },
    [setParams]
  );

  const setFilter = useCallback(
    (layerId: string, filterId: string, values: string[]) => {
      const currentFilters = parseFiltersParam(params.filters);
      if (!currentFilters[layerId]) {
        currentFilters[layerId] = {};
      }
      currentFilters[layerId][filterId] = values;
      setParams({ filters: serializeFiltersParam(currentFilters) });
    },
    [params.filters, setParams]
  );

  const setInspectedFeatureId = useCallback(
    (featureId: string | null) => {
      setParams({ inspect: featureId || '' });
    },
    [setParams]
  );

  const setPinPosition = useCallback(
    (position: [number, number] | null) => {
      setParams({ pin: serializePinParam(position) });
    },
    [setParams]
  );

  const setCompareMode = useCallback(
    (compare: boolean) => {
      setParams({ compare });
    },
    [setParams]
  );

  // Build shareable URL
  const shareableUrl = useMemo(
    () =>
      buildShareableUrl({
        lat: viewState.lat,
        lng: viewState.lng,
        zoom: viewState.zoom,
        layers: activeLayers,
        filters: parseFiltersParam(params.filters),
        inspectedFeatureId,
        pinPosition,
        compare: compareMode,
      }),
    [viewState, activeLayers, params.filters, inspectedFeatureId, pinPosition, compareMode]
  );

  return {
    // State
    viewState,
    activeLayers,
    filters,
    inspectedFeatureId,
    pinPosition,
    compareMode,
    shareableUrl,

    // Setters
    setViewState,
    setActiveLayers,
    setFilter,
    setInspectedFeatureId,
    setPinPosition,
    setCompareMode,
  };
}
