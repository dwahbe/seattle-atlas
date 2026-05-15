// Cross-tree signal: IntroHero (in app/page.tsx) and OnboardingTour (in
// MapContainer) are siblings with no shared React ancestor. The onboarding tour
// must not start until the intro splash is fully gone — whether it was scrolled
// away, skipped via deep link, or skipped for a returning visitor.

let done = false;
const listeners = new Set<() => void>();

export function markIntroDone(): void {
  if (done) return;
  done = true;
  for (const listener of listeners) listener();
  listeners.clear();
}

/**
 * Invokes `cb` once the intro is done. If it's already done, `cb` runs
 * synchronously. Returns an unsubscribe function.
 */
export function onIntroDone(cb: () => void): () => void {
  if (done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
