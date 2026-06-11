// Cross-tree signal mirroring lib/intro-state.ts: OnboardingTour and the
// scroll-zoom gate (inside MapGL) have no shared React state. Dismissing the
// tour — "Got it" on the last step, "Skip tour", the overlay, or Escape — is
// an explicit click with no scroll momentum behind it, so the gate treats it
// as zoom intent and releases scrollZoom.

let dismissed = false;
const listeners = new Set<() => void>();

export function markTourDismissed(): void {
  if (dismissed) return;
  dismissed = true;
  for (const listener of listeners) listener();
  listeners.clear();
}

/**
 * Invokes `cb` once the tour has been dismissed. If it already was, `cb` runs
 * synchronously. Returns an unsubscribe function. Note the tour never runs on
 * mobile or for returning visitors — treat this as a release signal, never a
 * precondition.
 */
export function onTourDismissed(cb: () => void): () => void {
  if (dismissed) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
