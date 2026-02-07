'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
    description:
      'Click anywhere on the map to see zoning rules, Walk Score, permits, and more.',
    target: 'map',
  },
  {
    title: 'Toggle map layers',
    description: 'Switch between zoning, transit routes, and bike infrastructure layers.',
    target: 'layers',
  },
];

function getTargetRect(target: TourStep['target']): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  switch (target) {
    case 'search': {
      // Target the search input area in the control panel
      const el = document.querySelector('[data-tour="search"]') as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        return { top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 };
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
        return { top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 };
      }
      // Fallback: left panel layers area
      return { top: 140, left: 16, width: 296, height: 160 };
    }
  }
}

function getTooltipPosition(targetRect: ReturnType<typeof getTargetRect>) {
  const tooltipWidth = 300;
  const padding = 16;

  // Position tooltip to the right of the target, or below if not enough space
  const rightSpace = window.innerWidth - (targetRect.left + targetRect.width);
  if (rightSpace > tooltipWidth + padding * 2) {
    return {
      top: targetRect.top,
      left: targetRect.left + targetRect.width + padding,
    };
  }

  // Below the target
  return {
    top: targetRect.top + targetRect.height + padding,
    left: Math.max(padding, Math.min(targetRect.left, window.innerWidth - tooltipWidth - padding)),
  };
}

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has seen the tour
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    // Small delay so the map has time to render
    const timer = setTimeout(() => setCurrentStep(0), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setCurrentStep(null);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage not available
    }
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

  if (!mounted || currentStep === null) return null;

  const step = STEPS[currentStep];
  const targetRect = getTargetRect(step.target);
  const tooltipPos = getTooltipPosition(targetRect);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlay = (
    <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-label="Welcome tour">
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
