'use client';

import type { Proposal } from '@/types';
import { StatusBadge } from './StatusBadge';

interface ProposalsSectionProps {
  proposals: Proposal[];
  /** Compact mode for mobile */
  compact?: boolean;
}

export function ProposalsSection({ proposals, compact = false }: ProposalsSectionProps) {
  const maxProposals = compact ? 3 : proposals.length;

  if (proposals.length === 0) return null;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {proposals.slice(0, maxProposals).map((proposal) => (
        <div
          key={proposal.id}
          className={`bg-[rgb(var(--secondary-bg))] rounded-lg ${compact ? 'p-3' : 'p-3'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium text-[rgb(var(--text-primary))] ${compact ? 'text-sm line-clamp-1' : 'text-sm'}`}
            >
              {proposal.name}
            </h4>
            <StatusBadge status={proposal.status} />
          </div>
          <p
            className={`text-xs text-[rgb(var(--text-secondary))] ${compact ? 'mt-1 line-clamp-2' : 'mt-2 line-clamp-3'}`}
          >
            {proposal.summary}
          </p>
          {!compact && proposal.links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {proposal.links.slice(0, 2).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[rgb(var(--accent))] hover:underline"
                >
                  {link.title} →
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
