'use client';

import { useState } from 'react';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Invisible expanded touch target for mobile */}
      <button
        type="button"
        className="touch-target-inline relative w-5 h-5 flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        {/* Expanded touch area (invisible) */}
        <span className="absolute inset-[-8px]" aria-hidden="true" />
        {/* Visual indicator - smaller on mobile */}
        <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[rgb(var(--text-tertiary))] text-[rgb(var(--panel-bg))] text-[10px] font-medium flex items-center justify-center hover:bg-[rgb(var(--text-secondary))] transition-colors pointer-events-none">
          ?
        </span>
      </button>
      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-40 md:w-48 p-2 text-xs text-[rgb(var(--text-primary))] bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] rounded-lg shadow-lg z-50">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[rgb(var(--border-color))]" />
        </div>
      )}
    </span>
  );
}
