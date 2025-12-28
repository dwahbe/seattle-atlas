'use client';

import { useState, useCallback, useMemo } from 'react';
import { getProposalsByLayerId } from '@/lib/proposals';
import type { InspectedFeature, Proposal } from '@/types';

interface UseInspectProps {
  inspectedFeatureId: string | null;
  onInspectedFeatureIdChange: (featureId: string | null) => void;
}

export function useInspect({ inspectedFeatureId, onInspectedFeatureIdChange }: UseInspectProps) {
  const [inspectedFeature, setInspectedFeatureInternal] = useState<InspectedFeature | null>(null);

  const setInspectedFeature = useCallback(
    (feature: InspectedFeature | null) => {
      setInspectedFeatureInternal(feature);
      onInspectedFeatureIdChange(feature ? String(feature.id) : null);
    },
    [onInspectedFeatureIdChange]
  );

  const clearInspection = useCallback(() => {
    setInspectedFeatureInternal(null);
    onInspectedFeatureIdChange(null);
  }, [onInspectedFeatureIdChange]);

  // Get proposals related to the currently inspected feature's layer
  const relatedProposals: Proposal[] = useMemo(() => {
    if (!inspectedFeature) return [];
    return getProposalsByLayerId(inspectedFeature.layerId);
  }, [inspectedFeature]);

  return {
    inspectedFeatureId,
    inspectedFeature,
    setInspectedFeature,
    clearInspection,
    relatedProposals,
  };
}
