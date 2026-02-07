'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-panel-bg">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-600 dark:text-red-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          Something went wrong
        </h1>
        <p className="text-text-secondary mb-8">
          We encountered an unexpected error. Please try again or return to the map.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary" size="lg">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = '/map')} variant="outline" size="lg">
            Go to Map
          </Button>
        </div>
      </div>
    </div>
  );
}
