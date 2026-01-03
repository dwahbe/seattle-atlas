'use client';

import { useState } from 'react';

interface ShareBarProps {
  onCopy: () => void;
}

export function ShareBar({ onCopy }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all
          ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--secondary-bg))]'
          }
        `}
        aria-label="Share this view"
      >
        {copied ? (
          <>
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm font-medium">Copied!</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </>
        )}
      </button>
    </div>
  );
}
