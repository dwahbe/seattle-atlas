import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { NEIGHBORHOOD_PAGES } from '@/data/neighborhood-pages';

// Update when a page's user-visible content changes. Build-time stamps would
// claim every page changed on every deploy, which trains crawlers to ignore
// the field entirely.
const LAST_MODIFIED = {
  home: '2026-06-10',
  seattleZoning: '2026-05-15',
  about: '2026-05-15',
  neighborhoods: '2026-06-10',
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    { url: `${siteUrl}/`, lastModified: LAST_MODIFIED.home, priority: 1.0 },
    {
      url: `${siteUrl}/seattle-zoning`,
      lastModified: LAST_MODIFIED.seattleZoning,
      priority: 0.9,
    },
    { url: `${siteUrl}/about`, lastModified: LAST_MODIFIED.about },
    {
      url: `${siteUrl}/neighborhoods`,
      lastModified: LAST_MODIFIED.neighborhoods,
      priority: 0.8,
    },
    ...NEIGHBORHOOD_PAGES.map((page) => ({
      url: `${siteUrl}/neighborhoods/${page.slug}`,
      lastModified: LAST_MODIFIED.neighborhoods,
      priority: 0.7,
    })),
  ];
}
