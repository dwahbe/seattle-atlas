'use client';

import { useState, useId } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Invisible expanded touch target for mobile */}
      <button
        type="button"
        className="touch-target-inline group relative w-5 h-5 flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More Information"
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {/* Expanded touch area (invisible) */}
        <span className="absolute inset-[-8px]" aria-hidden="true" />
        {/* Visual indicator - smaller on mobile */}
        <IconInfoCircle
          className="w-3.5 h-3.5 md:w-4 md:h-4 text-text-tertiary group-hover:text-text-secondary transition-colors pointer-events-none"
          aria-hidden="true"
        />
      </button>
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-40 md:w-48 p-2 text-xs text-text-primary bg-panel-bg border border-border rounded-lg shadow-lg z-50"
        >
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}
    </span>
  );
}
