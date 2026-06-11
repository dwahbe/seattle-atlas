import type { Map as MapboxMap } from 'mapbox-gl';
import { onIntroDone } from '@/lib/intro-state';
import { onTourDismissed } from '@/lib/tour-state';

// A content hero sits above the full-screen map on the home page. Mapbox's
// scrollZoom would otherwise eat wheel events the moment the cursor crosses
// the map, trapping the page scroll — and the scroll that dismisses the intro
// splash would blast straight into a zoom. We keep scrollZoom disabled until
// the map is fully in view, the intro splash is gone, AND the user has shown
// zoom intent: a pointerdown on the map (click, drag, tap), a trackpad pinch
// (delivered as ctrl+wheel), or dismissing the onboarding tour. Plain wheel
// scrolling never arms it — a timing heuristic can't tell leftover scroll
// momentum from deliberate zoom, so any idle-window approach misfires on
// paused-then-resumed scrolling.
//
// The intent requirement exists solely to absorb that splash-dismiss scroll:
// when the splash never showed (returning visitor, deep link), the intro
// signal arrives with `skipped: true` and intent is waived.
export function setupScrollZoomGate(map: MapboxMap, container: HTMLElement): () => void {
  map.scrollZoom.disable();

  let observer: IntersectionObserver | null = null;
  let isMapFullyVisible = false;
  let isIntroDone = false;
  let hasIntent = false;

  const sync = () => {
    if (isMapFullyVisible && isIntroDone && hasIntent) {
      map.scrollZoom.enable();
    } else {
      map.scrollZoom.disable();
    }
  };

  // Intent is one-shot: once the user has engaged the map, scrollZoom only
  // re-gates on visibility/intro, never on interaction again.
  const markIntent = () => {
    hasIntent = true;
    removeIntentListeners();
    sync();
  };

  const handlePointerDown = () => markIntent();

  const handleWheel = (e: WheelEvent) => {
    // Trackpad pinches arrive as wheel events with ctrlKey set — unambiguous
    // zoom intent, unlike two-finger scrolling.
    if (e.ctrlKey) markIntent();
  };

  // Capture phase so enabling lands before Mapbox's own handler sees the same
  // event — the first pinch tick already zooms. Scoped to the map container,
  // so clicks on sibling panels and the intro splash never count as intent.
  const addIntentListeners = () => {
    container.addEventListener('pointerdown', handlePointerDown, { capture: true });
    container.addEventListener('wheel', handleWheel, { capture: true, passive: true });
  };
  const removeIntentListeners = () => {
    container.removeEventListener('pointerdown', handlePointerDown, { capture: true });
    container.removeEventListener('wheel', handleWheel, { capture: true });
  };

  const unsubscribeIntroDone = onIntroDone(({ skipped }) => {
    isIntroDone = true;
    // A skipped splash had no dismissal scroll to absorb — waive intent.
    if (skipped) markIntent();
    else sync();
  });
  const unsubscribeTourDismissed = onTourDismissed(markIntent);

  if ('IntersectionObserver' in window) {
    if (!hasIntent) addIntentListeners();
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
    unsubscribeTourDismissed();
    removeIntentListeners();
    observer?.disconnect();
  };
}
