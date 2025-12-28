import type { Proposal } from '@/types';
import proposalsData from '@/data/proposals.json';

// Load all proposals
export function getProposals(): Proposal[] {
  return proposalsData as Proposal[];
}

// Get proposals related to a specific layer
export function getProposalsByLayerId(layerId: string): Proposal[] {
  return getProposals().filter((proposal) => proposal.layers.includes(layerId));
}
