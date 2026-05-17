import type { Map as MapboxMap } from 'mapbox-gl';
import { onIntroDone } from '@/lib/intro-state';

// A content hero sits above the full-screen map on the home page. Mapbox's
// scrollZoom would otherwise eat wheel events the moment the cursor crosses the
// map, trapping the page scroll. We keep scrollZoom disabled until the map is
// fully in view AND the intro splash is gone, then wait for the wheel to go
// idle so momentum-scrolling past the hero doesn't blast straight into a zoom.
const DEFAULT_SCROLL_ZOOM_IDLE_MS = 1500;
const DESKTOP_LAYOUT_MEDIA_QUERY = '(min-width: 1024px)';

interface ScrollZoomGateOptions {
  idleMs?: number;
}

export function setupScrollZoomGate(
  map: MapboxMap,
  container: HTMLElement,
  options: ScrollZoomGateOptions = {}
): () => void {
  const defaultIdleMs = window.matchMedia(DESKTOP_LAYOUT_MEDIA_QUERY).matches
    ? DEFAULT_SCROLL_ZOOM_IDLE_MS
    : 0;
  const idleMs = options.idleMs ?? defaultIdleMs;
  map.scrollZoom.disable();

  let observer: IntersectionObserver | null = null;
  let enableTimeout: number | null = null;
  let isMapFullyVisible = false;
  let isIntroDone = false;
  let lastWheelAt = 0;

  const clearEnableTimeout = () => {
    if (enableTimeout === null) return;
    window.clearTimeout(enableTimeout);
    enableTimeout = null;
  };

  const enableNow = () => {
    clearEnableTimeout();
    if (isMapFullyVisible && isIntroDone) map.scrollZoom.enable();
  };

  const enableAfterWheelIdle = () => {
    if (idleMs <= 0) {
      enableNow();
      return;
    }

    clearEnableTimeout();
    map.scrollZoom.disable();
    enableTimeout = window.setTimeout(enableNow, idleMs);
  };

  const disable = () => {
    clearEnableTimeout();
    map.scrollZoom.disable();
  };

  const sync = () => {
    if (!isMapFullyVisible || !isIntroDone) {
      disable();
      return;
    }
    if (idleMs > 0 && Date.now() - lastWheelAt < idleMs) {
      enableAfterWheelIdle();
    } else {
      enableNow();
    }
  };

  const handleWheel = () => {
    lastWheelAt = Date.now();
    // Only re-arm while we're already debouncing; once scrollZoom is live,
    // wheel events are the user zooming and must pass through untouched.
    if (enableTimeout !== null) enableAfterWheelIdle();
  };

  const unsubscribeIntroDone = onIntroDone(() => {
    isIntroDone = true;
    sync();
  });

  if ('IntersectionObserver' in window) {
    if (idleMs > 0) {
      window.addEventListener('wheel', handleWheel, { capture: true, passive: true });
    }
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const fullyVisible = entry.intersectionRatio >= 0.99;
        if (fullyVisible === isMapFullyVisible) return;
        isMapFullyVisible = fullyVisible;
        sync();
      },
      { threshold: [0, 0.99, 1] }
    );
    observer.observe(container);
  } else {
    map.scrollZoom.enable();
  }

  return () => {
    unsubscribeIntroDone();
    if (idleMs > 0) {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    }
    clearEnableTimeout();
    observer?.disconnect();
  };
}
