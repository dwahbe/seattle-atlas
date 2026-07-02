import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';

export interface Crumb {
  label: string;
  /** Omit on the current page — it renders as non-link text with aria-current. */
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

/**
 * Wayfinding trail for nested content pages. The last item is the current page
 * — non-clickable, with aria-current — so people can see where they are and
 * step back up the hierarchy (per Apple HIG navigation + NN/g breadcrumb
 * guidance). Links keep a full touch target on coarse pointers, so no
 * `.touch-target-inline` opt-out here.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-x-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-accent hover:text-text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-medium text-text-primary"
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <IconChevronRight
                  size={14}
                  className="shrink-0 text-text-secondary"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
