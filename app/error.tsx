'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { IconAlertTriangle } from '@tabler/icons-react';

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
          <IconAlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" stroke={2} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Something went wrong</h1>
        <p className="text-text-secondary mb-8">
          We encountered an unexpected error. Please try again or return to the map.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary" size="lg">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline" size="lg">
            Go to Map
          </Button>
        </div>
      </div>
    </div>
  );
}
