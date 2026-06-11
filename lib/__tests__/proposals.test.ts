import { describe, test, expect } from 'bun:test';
import { getProposals, getProposalsByLayerId } from '../proposals';
import layersData from '@/data/layers.json';

// The inspect panel joins proposals to features by layer id
// (useInspectData filters on p.layers.includes(feature.layerId)), so a
// proposal whose layers don't name real layer ids is invisible to users.
const layerIds = new Set(layersData.map((layer) => layer.id));

describe('proposal layer joins', () => {
  test('every proposal references at least one real layer id', () => {
    const proposals = getProposals();
    expect(proposals.length).toBeGreaterThan(0);
    for (const proposal of proposals) {
      expect(proposal.layers.length).toBeGreaterThan(0);
      for (const id of proposal.layers) {
        expect(layerIds.has(id)).toBe(true);
      }
    }
  });

  test('zoning inspects surface proposals', () => {
    expect(getProposalsByLayerId('zoning').length).toBeGreaterThan(0);
    expect(getProposalsByLayerId('zoning_detailed').length).toBeGreaterThan(0);
  });
});
