'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getStoredItem, setStoredItem } from '@/lib/storage';
import { onIntroDone } from '@/lib/intro-state';

const STORAGE_KEY = 'atlas-onboarding-seen';

interface TourStep {
  title: string;
  description: string;
  /** CSS selector or position hint for the spotlight target */
  target: 'search' | 'map' | 'layers';
}

const STEPS: TourStep[] = [
  {
    title: 'Search any address',
    description: 'Find any Seattle address or neighborhood to explore its zoning details.',
    target: 'search',
  },
  {
    title: 'Click a parcel',
    description: 'Click anywhere on the map to see zoning rules, Car-Free Score, permits, and more.',
    target: 'map',
  },
  {
    title: 'Toggle map layers',
    description: 'Switch between zoning, transit routes, and bike infrastructure layers.',
    target: 'layers',
  },
];

type Rect = { top: number; left: number; width: number; height: number };

// The control panel hugs the viewport's left edge, so an 8px-expanded highlight
// would bleed its rounded border off-screen. Keep the spotlight fully visible.
function clampRectToViewport(rect: Rect, margin = 8): Rect {
  const left = Math.max(margin, rect.left);
  const top = Math.max(margin, rect.top);
  const right = Math.min(rect.left + rect.width, window.innerWidth - margin);
  const bottom = Math.min(rect.top + rect.height, window.innerHeight - margin);
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function getTargetRect(target: TourStep['target']): Rect {
  switch (target) {
    case 'search': {
      // Target the search input area in the control panel
      const el = document.querySelector('[data-tour="search"]') as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        return clampRectToViewport({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
      }
      // Fallback: top-left area where search lives
      return { top: 60, left: 16, width: 296, height: 48 };
    }
    case 'map': {
      // Target center of the viewport
      const w = window.innerWidth;
      const h = window.innerHeight;
      const size = 200;
      return { top: h / 2 - size / 2, left: w / 2 - size / 2, width: size, height: size };
    }
    case 'layers': {
      // Target the layers section in the control panel
      const el = document.querySelector('[data-tour="layers"]') as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        // The panel hugs the viewport's left edge, so the left side has to be
        // pinned to a small margin. Mirror the right side about the section's
        // center so the spotlight reads as evenly inset on both sides. Tighter
        // vertical inset because the section already carries py-4 padding.
        const margin = 4;
        const left = Math.max(margin, rect.left - 8);
        const center = rect.left + rect.width / 2;
        return clampRectToViewport(
          {
            top: rect.top + 4,
            left,
            width: (center - left) * 2,
            height: rect.height - 8,
          },
          margin
        );
      }
      // Fallback: left panel layers area
      return { top: 140, left: 16, width: 296, height: 160 };
    }
  }
}

function getTooltipPosition(targetRect: ReturnType<typeof getTargetRect>) {
  const tooltipWidth = 300;
  // Estimated max tooltip height (padding + title + 3-line description + buttons).
  // Used only to keep the tooltip from clipping off the bottom of the viewport.
  const tooltipHeight = 200;
  const padding = 16;

  const clampTop = (top: number) =>
    Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

  // Position tooltip to the right of the target, or below if not enough space
  const rightSpace = window.innerWidth - (targetRect.left + targetRect.width);
  if (rightSpace > tooltipWidth + padding * 2) {
    return {
      top: clampTop(targetRect.top),
      left: targetRect.left + targetRect.width + padding,
    };
  }

  // Below the target
  return {
    top: clampTop(targetRect.top + targetRect.height + padding),
    left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - tooltipWidth - padding)),
  };
}

export function OnboardingTour() {
  // `currentStep` starts null and is only set via the delayed setTimeout below, so
  // the component always renders null during SSR and initial hydration. No separate
  // `mounted` flag needed — the `currentStep === null` gate handles SSR safety.
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  useEffect(() => {
    if (getStoredItem(STORAGE_KEY)) return;
    // Wait for the intro splash to finish before arming the tour — otherwise
    // the tooltip pops over the splash. Fires synchronously if the intro was
    // already skipped (deep link / returning visitor).
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = onIntroDone(() => {
      // Small delay so the map has time to render
      timer = setTimeout(() => setCurrentStep(0), 1500);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const dismiss = useCallback(() => {
    setCurrentStep(null);
    setStoredItem(STORAGE_KEY, 'true');
  }, []);

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev === null) return null;
      if (prev >= STEPS.length - 1) {
        dismiss();
        return null;
      }
      return prev + 1;
    });
  }, [dismiss]);

  // Keyboard handler
  useEffect(() => {
    if (currentStep === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, dismiss, next]);

  if (currentStep === null) return null;

  const step = STEPS[currentStep];
  const targetRect = getTargetRect(step.target);
  const tooltipPos = getTooltipPosition(targetRect);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlay = (
    <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-label="Welcome Tour">
      {/* Overlay with spotlight cutout using CSS clip-path */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
            ${targetRect.left}px ${targetRect.top}px,
            ${targetRect.left}px ${targetRect.top + targetRect.height}px,
            ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px,
            ${targetRect.left + targetRect.width}px ${targetRect.top}px,
            ${targetRect.left}px ${targetRect.top}px
          )`,
        }}
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Spotlight border ring */}
      <div
        className="absolute rounded-xl border-2 border-white/30 pointer-events-none"
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute w-[300px] bg-panel-bg rounded-xl shadow-2xl border border-border p-5"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          animation: prefersReducedMotion ? 'none' : 'fadeSlideIn 200ms ease-out',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
          <span className="text-xs text-text-tertiary shrink-0">
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>
        <p className="text-sm text-text-secondary mb-4">{step.description}</p>
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="px-4 py-1.5 text-sm font-medium bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {currentStep === STEPS.length - 1 ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(overlay, document.body);
}
