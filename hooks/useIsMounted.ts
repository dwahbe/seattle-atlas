'use client';

import { useSyncExternalStore } from 'react';

// Server and first client render return `false`; after hydration switches to
// `true`. Used as a gate for client-only APIs like `document` in `createPortal`.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
