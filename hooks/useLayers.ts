'use client';

import { useMemo, useCallback } from 'react';
import { getLayers, getLayerGroups, getLayerById, validateLayerIds } from '@/lib/layers';
import type { LayerConfig, LayerGroup } from '@/types';

interface UseLayersProps {
  activeLayers: string[];
  onLayersChange: (layers: string[]) => void;
}

export function useLayers({ activeLayers, onLayersChange }: UseLayersProps) {
  const layers = useMemo(() => getLayers(), []);
  const layerGroups = useMemo(() => getLayerGroups(), []);

  // Validate active layers against available layers
  const validatedActiveLayers = useMemo(() => validateLayerIds(activeLayers), [activeLayers]);

  const toggleLayer = useCallback(
    (layerId: string) => {
      const newLayers = validatedActiveLayers.includes(layerId)
        ? validatedActiveLayers.filter((id) => id !== layerId)
        : [...validatedActiveLayers, layerId];
      onLayersChange(newLayers);
    },
    [validatedActiveLayers, onLayersChange]
  );

  const setActiveLayers = useCallback(
    (layerIds: string[]) => {
      const validated = validateLayerIds(layerIds);
      onLayersChange(validated);
    },
    [onLayersChange]
  );

  const getLayer = useCallback((layerId: string): LayerConfig | undefined => {
    return getLayerById(layerId);
  }, []);

  const isLayerActive = useCallback(
    (layerId: string): boolean => {
      return validatedActiveLayers.includes(layerId);
    },
    [validatedActiveLayers]
  );

  const getActiveLayerConfigs = useCallback((): LayerConfig[] => {
    return validatedActiveLayers
      .map((id) => getLayerById(id))
      .filter((layer): layer is LayerConfig => layer !== undefined);
  }, [validatedActiveLayers]);

  const enableAllInGroup = useCallback(
    (groupId: string) => {
      const group = layerGroups.find((g) => g.id === groupId);
      if (!group) return;

      const groupLayerIds = group.layers.map((l) => l.id);
      const newLayers = [...new Set([...validatedActiveLayers, ...groupLayerIds])];
      onLayersChange(newLayers);
    },
    [layerGroups, validatedActiveLayers, onLayersChange]
  );

  const disableAllInGroup = useCallback(
    (groupId: string) => {
      const group = layerGroups.find((g) => g.id === groupId);
      if (!group) return;

      const groupLayerIds = new Set(group.layers.map((l) => l.id));
      const newLayers = validatedActiveLayers.filter((id) => !groupLayerIds.has(id));
      onLayersChange(newLayers);
    },
    [layerGroups, validatedActiveLayers, onLayersChange]
  );

  return {
    layers,
    layerGroups,
    activeLayers: validatedActiveLayers,
    toggleLayer,
    setActiveLayers,
    getLayerById: getLayer,
    isLayerActive,
    getActiveLayerConfigs,
    enableAllInGroup,
    disableAllInGroup,
  };
}
