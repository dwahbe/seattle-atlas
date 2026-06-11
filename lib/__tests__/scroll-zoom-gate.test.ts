import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import type { Map as MapboxMap } from 'mapbox-gl';

// Stand-ins for lib/intro-state and lib/tour-state: the real modules' flags
// are one-way module globals, so tests mock them to get resettable copies.
let introDone = false;
let introSkipped = false;
const introListeners = new Set<(info: { skipped: boolean }) => void>();

mock.module('@/lib/intro-state', () => ({
  markIntroDone: (options?: { skipped?: boolean }) => {
    if (introDone) return;
    introDone = true;
    introSkipped = options?.skipped ?? false;
    for (const listener of introListeners) listener({ skipped: introSkipped });
    introListeners.clear();
  },
  onIntroDone: (cb: (info: { skipped: boolean }) => void) => {
    if (introDone) {
      cb({ skipped: introSkipped });
      return () => {};
    }
    introListeners.add(cb);
    return () => {
      introListeners.delete(cb);
    };
  },
}));

let tourDismissed = false;
const tourListeners = new Set<() => void>();

mock.module('@/lib/tour-state', () => ({
  markTourDismissed: () => {
    if (tourDismissed) return;
    tourDismissed = true;
    for (const listener of tourListeners) listener();
    tourListeners.clear();
  },
  onTourDismissed: (cb: () => void) => {
    if (tourDismissed) {
      cb();
      return () => {};
    }
    tourListeners.add(cb);
    return () => {
      tourListeners.delete(cb);
    };
  },
}));

const { setupScrollZoomGate } = await import('@/lib/scroll-zoom-gate');
const { markIntroDone } = await import('@/lib/intro-state');
const { markTourDismissed } = await import('@/lib/tour-state');

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: (entries: Array<{ intersectionRatio: number }>) => void;

  constructor(callback: (entries: Array<{ intersectionRatio: number }>) => void) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe() {}
  disconnect() {}

  trigger(intersectionRatio: number) {
    this.callback([{ intersectionRatio }]);
  }
}

const hadWindow = 'window' in globalThis;

beforeEach(() => {
  introDone = false;
  introSkipped = false;
  introListeners.clear();
  tourDismissed = false;
  tourListeners.clear();
  FakeIntersectionObserver.instances = [];
  (globalThis as unknown as { window: unknown }).window = globalThis;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    FakeIntersectionObserver;
});

afterAll(() => {
  if (!hadWindow) delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
});

function makeMap() {
  let enabled = true;
  const map = {
    scrollZoom: {
      enable: () => {
        enabled = true;
      },
      disable: () => {
        enabled = false;
      },
    },
  } as unknown as MapboxMap;
  return { map, isEnabled: () => enabled };
}

function makeContainer(): HTMLElement {
  return new EventTarget() as unknown as HTMLElement;
}

function firePointerDown(container: HTMLElement) {
  container.dispatchEvent(new Event('pointerdown'));
}

function fireWheel(container: HTMLElement, { ctrlKey = false } = {}) {
  const event = new Event('wheel');
  Object.defineProperty(event, 'ctrlKey', { value: ctrlKey });
  container.dispatchEvent(event);
}

function observer() {
  const instance = FakeIntersectionObserver.instances[0];
  if (!instance) throw new Error('gate did not create an IntersectionObserver');
  return instance;
}

describe('setupScrollZoomGate', () => {
  test('disables scrollZoom on setup', () => {
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    expect(isEnabled()).toBe(false);
  });

  test('stays disabled when visible and intro dismissed but no intent shown', () => {
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    observer().trigger(1);
    markIntroDone();
    expect(isEnabled()).toBe(false);
  });

  test('plain wheel scrolling never arms it', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    setupScrollZoomGate(map, container);
    observer().trigger(1);
    markIntroDone();
    fireWheel(container);
    fireWheel(container);
    fireWheel(container);
    expect(isEnabled()).toBe(false);
  });

  test('pointerdown on the map arms it', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    setupScrollZoomGate(map, container);
    observer().trigger(1);
    markIntroDone();
    firePointerDown(container);
    expect(isEnabled()).toBe(true);
  });

  test('trackpad pinch (ctrl+wheel) arms it', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    setupScrollZoomGate(map, container);
    observer().trigger(1);
    markIntroDone();
    fireWheel(container, { ctrlKey: true });
    expect(isEnabled()).toBe(true);
  });

  test('a skipped intro (returning visitor / deep link) waives intent', () => {
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    observer().trigger(1);
    markIntroDone({ skipped: true });
    expect(isEnabled()).toBe(true);
  });

  test('intro already skipped before setup enables on visibility alone', () => {
    markIntroDone({ skipped: true });
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    expect(isEnabled()).toBe(false);
    observer().trigger(1);
    expect(isEnabled()).toBe(true);
  });

  test('dismissing the onboarding tour releases the gate', () => {
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    observer().trigger(1);
    markIntroDone();
    expect(isEnabled()).toBe(false);
    markTourDismissed();
    expect(isEnabled()).toBe(true);
  });

  test('tour dismissed before setup counts as intent', () => {
    markTourDismissed();
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    observer().trigger(1);
    markIntroDone();
    expect(isEnabled()).toBe(true);
  });

  test('intent shown before the intro finishes enables once it does', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    setupScrollZoomGate(map, container);
    observer().trigger(1);
    firePointerDown(container);
    expect(isEnabled()).toBe(false);
    markIntroDone();
    expect(isEnabled()).toBe(true);
  });

  test('losing full visibility disables; regaining re-enables without new intent', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    setupScrollZoomGate(map, container);
    observer().trigger(1);
    markIntroDone();
    firePointerDown(container);
    expect(isEnabled()).toBe(true);
    observer().trigger(0.5);
    expect(isEnabled()).toBe(false);
    observer().trigger(1);
    expect(isEnabled()).toBe(true);
  });

  test('fails open when IntersectionObserver is unavailable', () => {
    delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    const { map, isEnabled } = makeMap();
    setupScrollZoomGate(map, makeContainer());
    expect(isEnabled()).toBe(true);
  });

  test('cleanup unsubscribes from intro/tour state and removes intent listeners', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    const cleanup = setupScrollZoomGate(map, container);
    observer().trigger(1);
    expect(introListeners.size).toBe(1);
    expect(tourListeners.size).toBe(1);
    cleanup();
    expect(introListeners.size).toBe(0);
    expect(tourListeners.size).toBe(0);
    markIntroDone();
    firePointerDown(container);
    expect(isEnabled()).toBe(false);
  });
});
