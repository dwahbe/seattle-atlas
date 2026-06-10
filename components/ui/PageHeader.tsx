import Link from 'next/link';
import { Button } from './Button';

const NAV_ITEMS = [
  { href: '/neighborhoods', label: 'Neighborhoods' },
  { href: '/seattle-zoning', label: 'Zoning Guide' },
  { href: '/about', label: 'About' },
];

interface PageHeaderProps {
  /** Pathname of the current page; that item renders as a non-link with aria-current. */
  current?: string;
  /** View Map destination — neighborhood pages pass their map deep link. */
  mapHref?: string;
}

/**
 * Shared header for the standalone content pages (/about, /seattle-zoning,
 * /neighborhoods/*). The invisible bold copy inside each label reserves the
 * font-medium width so the row doesn't shift when a label becomes the
 * current page on navigation.
 */
export function PageHeader({ current, mapHref = '/' }: PageHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 min-h-[56px] flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center">
          <span className="text-lg font-bold leading-none text-text-primary group-hover:text-accent transition-colors">
            Seattle Atlas
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => {
            const label = (
              <span className="grid">
                <span aria-hidden="true" className="col-start-1 row-start-1 invisible font-medium">
                  {item.label}
                </span>
                <span
                  className={`col-start-1 row-start-1${item.href === current ? ' font-medium' : ''}`}
                >
                  {item.label}
                </span>
              </span>
            );
            return item.href === current ? (
              <span
                key={item.href}
                aria-current="page"
                className="h-9 hidden sm:flex items-center text-sm text-text-primary whitespace-nowrap"
              >
                {label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="h-9 hidden sm:flex items-center text-sm text-accent hover:text-text-primary transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            );
          })}
          <Link href={mapHref}>
            <Button variant="primary" size="md" className="whitespace-nowrap">
              View Map
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
