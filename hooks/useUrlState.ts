'use client';

import { useQueryStates, parseAsFloat, parseAsString, parseAsBoolean } from 'nuqs';
import { useCallback, useMemo } from 'react';
import {
  SEATTLE_CENTER,
  parseLayersParam,
  serializeLayersParam,
  parseFiltersParam,
  serializeFiltersParam,
  buildShareableUrl,
} from '@/lib/url-state';
import type { MapViewState, FilterState } from '@/types';

const urlParsers = {
  lat: parseAsFloat.withDefault(SEATTLE_CENTER.lat),
  lng: parseAsFloat.withDefault(SEATTLE_CENTER.lng),
  z: parseAsFloat.withDefault(SEATTLE_CENTER.zoom),
  layers: parseAsString, // No default - we handle it in parseLayersParam
  filters: parseAsString.withDefault(''),
  inspect: parseAsString.withDefault(''),
  compare: parseAsBoolean.withDefault(false),
};

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

  const toggleLayer = useCallback(
    (layerId: string) => {
      const newLayers = activeLayers.includes(layerId)
        ? activeLayers.filter((id) => id !== layerId)
        : [...activeLayers, layerId];
      setActiveLayers(newLayers);
    },
    [activeLayers, setActiveLayers]
  );

  const setFilters = useCallback(
    (newFilters: FilterState) => {
      setParams({
        filters: serializeFiltersParam(newFilters as Record<string, Record<string, string[]>>),
      });
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
        compare: compareMode,
      }),
    [viewState, activeLayers, params.filters, inspectedFeatureId, compareMode]
  );

  return {
    // State
    viewState,
    activeLayers,
    filters,
    inspectedFeatureId,
    compareMode,
    shareableUrl,

    // Setters
    setViewState,
    setActiveLayers,
    toggleLayer,
    setFilters,
    setFilter,
    setInspectedFeatureId,
    setCompareMode,
  };
}
