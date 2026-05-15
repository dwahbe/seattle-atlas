'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { getLayerById } from '@/lib/layers';
import { MAP_STATE_PARAMS } from '@/lib/url-state';
import { getStoredItem, setStoredItem } from '@/lib/storage';

const STORAGE_KEY = 'atlas-intro-seen';
// Leave-transition duration (700ms in className) plus headroom. A fallback
// timer forces unmount if `transitionend` never fires — which is exactly the
// case for prefers-reduced-motion users (motion-reduce:transition-none).
const LEAVE_FALLBACK_MS = 800;

type IntroBlobStyle = React.CSSProperties &
  Record<'--orbit' | '--dur' | '--delay' | '--bdur' | '--bdelay', string>;

// Pull the simplified zoning palette straight from the map config so this
// backdrop stays in sync automatically if the legend colors ever change.
// One color per category, deduped by label, in legend order.
const ZONING_COLORS: string[] = (() => {
  const legend = getLayerById('zoning')?.legend ?? [];
  const seen = new Set<string>();
  const colors: string[] = [];
  for (const item of legend) {
    if (!seen.has(item.label)) {
      seen.add(item.label);
      colors.push(item.color);
    }
  }
  return colors.length > 0 ? colors : ['#FCE8C8'];
})();

// Static placement/motion per blob; color is sourced from the legend by index.
const BLOB_LAYOUT = [
  {
    position: { top: '-12%', left: '-8%' },
    size: '46vmax',
    orbit: 'intro-orbit-a',
    dur: '53s',
    delay: '0s',
    bdur: '19s',
    bdelay: '0s',
  },
  {
    position: { top: '-18%', right: '-10%' },
    size: '42vmax',
    orbit: 'intro-orbit-b',
    dur: '61s',
    delay: '-13s',
    bdur: '23s',
    bdelay: '-5s',
  },
  {
    position: { bottom: '-16%', left: '4%' },
    size: '44vmax',
    orbit: 'intro-orbit-c',
    dur: '47s',
    delay: '-7s',
    bdur: '29s',
    bdelay: '-11s',
  },
  {
    position: { bottom: '-20%', right: '-6%' },
    size: '40vmax',
    orbit: 'intro-orbit-a',
    dur: '67s',
    delay: '-23s',
    bdur: '17s',
    bdelay: '-3s',
  },
  {
    position: { top: '26%', left: '-14%' },
    size: '34vmax',
    orbit: 'intro-orbit-b',
    dur: '43s',
    delay: '-31s',
    bdur: '31s',
    bdelay: '-9s',
  },
] as const;

const BLOBS = BLOB_LAYOUT.map((slot, i) => ({
  ...slot,
  color: ZONING_COLORS[i % ZONING_COLORS.length],
}));

type Phase = 'visible' | 'leaving' | 'gone';

function shouldSkip(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (MAP_STATE_PARAMS.some((key) => params.has(key))) return true;
  } catch {
    return false;
  }
  return getStoredItem(STORAGE_KEY) === '1';
}

export function IntroHero() {
  const [phase, setPhase] = useState<Phase>('visible');
  const [entered, setEntered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, phase === 'visible');

  const dismiss = useCallback(() => {
    setPhase((current) => {
      if (current !== 'visible') return current;
      setStoredItem(STORAGE_KEY, '1');
      return 'leaving';
    });
  }, []);

  // Deep links and returning visitors skip the splash entirely; the
  // pre-hydration script in app/layout.tsx already hid it via CSS, so this
  // just unmounts. Otherwise gate the entrance one frame past first paint so
  // the heavy backdrop compositing doesn't contend with Mapbox WebGL init.
  useEffect(() => {
    if (shouldSkip()) {
      setPhase('gone');
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Fallback unmount: transitionend never fires under reduced motion.
  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = setTimeout(() => setPhase('gone'), LEAVE_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'visible') return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) dismiss();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ' || e.key === 'ArrowDown') {
        dismiss();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', dismiss, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', dismiss);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [phase, dismiss]);

  // useFocusTrap only constrains Tab; it doesn't move initial focus. Focus the
  // dialog itself (not the button) so screen readers enter the modal and
  // keyboard users can Tab to the dismiss control — focusing the button would
  // paint a visible focus ring on touch devices (iOS Safari) on every visit.
  useEffect(() => {
    if (phase === 'visible') containerRef.current?.focus();
  }, [phase]);

  if (phase === 'gone') return null;

  const leaving = phase === 'leaving';

  return (
    <div
      id="intro-hero"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Seattle Atlas"
      tabIndex={-1}
      onAnimationEnd={(e) => {
        // The iris is the longest track; child animations bubble here too, so
        // gate on its name. Reduced motion plays no animation — the JS
        // fallback timer unmounts instead.
        if (leaving && e.animationName === 'intro-iris') setPhase('gone');
      }}
      onTransitionEnd={() => {
        // Reduced-motion path: the leave is a plain opacity transition.
        if (leaving) setPhase('gone');
      }}
      className={`fixed inset-0 z-[60] flex flex-col items-center overflow-hidden bg-panel-bg px-6 text-center outline-none transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        entered ? 'intro-animate' : ''
      } ${
        leaving
          ? 'intro-leaving pointer-events-none'
          : entered
            ? 'translate-y-0 opacity-100'
            : 'translate-y-2 opacity-0'
      }`}
    >
      <div
        aria-hidden="true"
        className="intro-aurora pointer-events-none absolute inset-0 opacity-70 dark:opacity-40"
      >
        {BLOBS.map((b, i) => (
          <span
            key={i}
            className="intro-blob absolute rounded-full blur-[28px]"
            style={
              {
                ...b.position,
                background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, transparent 70%)`,
                width: b.size,
                height: b.size,
                '--orbit': b.orbit,
                '--dur': b.dur,
                '--delay': b.delay,
                '--bdur': b.bdur,
                '--bdelay': b.bdelay,
              } as IntroBlobStyle
            }
          />
        ))}
      </div>

      <div aria-hidden="true" className="intro-grain pointer-events-none absolute inset-0" />

      <div className="intro-content relative z-10 flex flex-1 flex-col items-center justify-center">
        <p className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl md:text-6xl">
          Seattle&rsquo;s zoning and transit simplified.
        </p>

        <p className="mt-6 max-w-xl text-balance text-base text-text-secondary sm:text-lg">
          Welcome to Seattle Atlas, an interactive map of Seattle&rsquo;s zoning, transit, and bike
          infrastructure.
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="intro-content relative z-10 flex flex-col items-center gap-2 pt-10 pb-12 text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:pb-16"
      >
        Scroll to See the Map
        <IconChevronDown size={20} stroke={1.5} className="animate-bounce" aria-hidden="true" />
      </button>
    </div>
  );
}
