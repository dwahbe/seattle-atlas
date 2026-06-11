// Cross-tree signal: IntroHero (in app/page.tsx) and OnboardingTour (in
// MapContainer) are siblings with no shared React ancestor. The onboarding tour
// must not start until the intro splash is fully gone — whether it was scrolled
// away, skipped via deep link, or skipped for a returning visitor.
//
// `skipped` distinguishes the exits: true means the splash never showed
// (returning visitor, deep link), so no dismissal scroll happened. The
// scroll-zoom gate uses this — only a real dismissal has wheel momentum that
// needs absorbing.

type IntroDoneInfo = { skipped: boolean };
type IntroDoneListener = (info: IntroDoneInfo) => void;

let done = false;
let skipped = false;
const listeners = new Set<IntroDoneListener>();

export function markIntroDone(options?: { skipped?: boolean }): void {
  if (done) return;
  done = true;
  skipped = options?.skipped ?? false;
  for (const listener of listeners) listener({ skipped });
  listeners.clear();
}

/**
 * Invokes `cb` once the intro is done. If it's already done, `cb` runs
 * synchronously. Returns an unsubscribe function.
 */
export function onIntroDone(cb: IntroDoneListener): () => void {
  if (done) {
    cb({ skipped });
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
