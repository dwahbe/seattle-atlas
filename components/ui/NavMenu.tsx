'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/seattle-zoning', label: 'Seattle Zoning Guide' },
  { href: '/about', label: 'About' },
];

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          touch-target-inline h-[42px] px-3 flex items-center justify-center rounded-lg
          bg-panel-bg border border-border
          hover:bg-secondary-bg transition-colors
        "
        aria-label="Navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            className="w-4 h-4 text-text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="
            absolute top-full right-0 mt-2 w-48
            bg-panel-bg border border-border
            rounded-lg shadow-lg overflow-hidden
          "
        >
          <nav className="py-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="
                  block px-4 py-2.5 text-sm
                  text-text-primary hover:bg-secondary-bg
                  transition-colors
                "
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
