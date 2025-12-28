'use client';

import { useState, useEffect } from 'react';

interface ShareBarProps {
  url: string;
  onCopy: () => void;
}

export function ShareBar({ url, onCopy }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    setFullUrl(window.location.origin + url);
  }, [url]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--panel-bg))] border border-[rgb(var(--border-color))] rounded-full shadow-lg">
        <svg
          className="w-4 h-4 text-[rgb(var(--text-secondary))]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="text-xs text-[rgb(var(--text-secondary))] max-w-xs truncate hidden sm:inline">
          {fullUrl}
        </span>
        <span className="text-xs text-[rgb(var(--text-secondary))] sm:hidden">Share this view</span>
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors
            ${
              copied
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))]'
            }
          `}
        >
          {copied ? (
            <>
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
