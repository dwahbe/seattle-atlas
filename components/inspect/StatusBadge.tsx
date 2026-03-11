'use client';

import type { ProposalStatus } from '@/types';

interface StatusBadgeProps {
  status: ProposalStatus;
}

const statusConfig: Record<ProposalStatus, string> = {
  Adopted: 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Draft: 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  'Public Comment': 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Under Review': 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  Rejected: 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

const fallbackClassName = 'bg-secondary-bg text-text-secondary';

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${statusConfig[status] ?? fallbackClassName}`}
    >
      {status}
    </span>
  );
}
