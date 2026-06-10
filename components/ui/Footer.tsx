import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Map' },
  { href: '/neighborhoods', label: 'Neighborhoods' },
  { href: '/seattle-zoning', label: 'Zoning Guide' },
  { href: '/about', label: 'About' },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <nav className="flex w-full flex-wrap items-center justify-center gap-4 text-sm text-text-secondary sm:w-auto sm:justify-end">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <p className="text-sm text-text-secondary">
              Built by{' '}
              <a
                href="https://dylanwahbe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Dylan Wahbe
              </a>
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
