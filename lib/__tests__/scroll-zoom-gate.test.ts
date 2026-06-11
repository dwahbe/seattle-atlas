import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import type { Map as MapboxMap } from 'mapbox-gl';

// Stand-in for lib/intro-state: the real module's `done` flag is a one-way
// module global, so tests mock it to get a resettable copy per test.
let introDone = false;
const introListeners = new Set<() => void>();

mock.module('@/lib/intro-state', () => ({
  markIntroDone: () => {
    if (introDone) return;
    introDone = true;
    for (const listener of introListeners) listener();
    introListeners.clear();
  },
  onIntroDone: (cb: () => void) => {
    if (introDone) {
      cb();
      return () => {};
    }
    introListeners.add(cb);
    return () => {
      introListeners.delete(cb);
    };
  },
}));

const { setupScrollZoomGate } = await import('@/lib/scroll-zoom-gate');
const { markIntroDone } = await import('@/lib/intro-state');

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
  introListeners.clear();
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

  test('stays disabled when visible and intro done but no intent shown', () => {
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

  test('cleanup unsubscribes from intro state and removes intent listeners', () => {
    const { map, isEnabled } = makeMap();
    const container = makeContainer();
    const cleanup = setupScrollZoomGate(map, container);
    observer().trigger(1);
    expect(introListeners.size).toBe(1);
    cleanup();
    expect(introListeners.size).toBe(0);
    markIntroDone();
    firePointerDown(container);
    expect(isEnabled()).toBe(false);
  });
});
