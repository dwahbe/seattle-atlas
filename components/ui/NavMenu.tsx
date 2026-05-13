'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconMenu2, IconX } from '@tabler/icons-react';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/seattle-zoning', label: 'Seattle Zoning Guide' },
];

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
          touch-target-inline h-[46px] px-3 flex items-center justify-center rounded-lg
          bg-panel-bg border border-border
          hover:bg-secondary-bg transition-colors
        "
        aria-label="Navigation Menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <IconX className="w-4 h-4 text-text-primary" stroke={2} />
        ) : (
          <IconMenu2 className="w-4 h-4 text-text-primary" stroke={2} />
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
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    block px-4 py-2.5 text-sm
                    transition-colors
                    ${isActive ? 'text-accent bg-secondary-bg font-medium' : 'text-text-primary hover:bg-secondary-bg'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
