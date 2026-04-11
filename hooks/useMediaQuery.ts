'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query. Uses `useSyncExternalStore` so the snapshot
 * is read during render (not in an effect), which avoids the one-frame flash
 * between initial render and effect-driven state updates.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // During SSR there's no media query to read — default to `false`. Clients will
  // re-render with the real value after hydration.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const getServerSnapshot = () => false;

// Convenience hook for mobile detection
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}
