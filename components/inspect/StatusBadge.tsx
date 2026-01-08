'use client';

import type { ProposalStatus } from '@/types';

interface StatusBadgeProps {
  status: ProposalStatus;
}

const colors: Record<string, string> = {
  Adopted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Public Comment': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Under Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0 ${colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
    >
      {status}
    </span>
  );
}
