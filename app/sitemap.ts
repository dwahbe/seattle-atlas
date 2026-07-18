import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { NEIGHBORHOOD_PAGES } from '@/data/neighborhood-pages';

// Update when a page's user-visible content changes. Build-time stamps would
// claim every page changed on every deploy, which trains crawlers to ignore
// the field entirely.
// 2026-06-11: simplified zoning categories renamed (Downtown & Highrise,
// Midsize Residential & Shops, Large Buildings) and tower-zoned
// SM areas split into Downtown & Highrise — legend appears on every page.
// Same day: Blueprint rebrand — new zoning/parks/bike palette, cool
// near-black dark mode, cobalt accent — also touches every page.
// 2026-06-22: added six neighborhood pages (First Hill, Pioneer Square,
// Chinatown-International District, Belltown, Georgetown, Northgate) and
// the new entries on the /neighborhoods index.
// 2026-07-18: /seattle-zoning footnote markers standardized to bracketed
// [n] style (adjacent bare superscripts previously read as "210").
// Same day: site font switched to Instrument Sans (the intended Geist never
// actually applied) — touches every page; neighborhood pages also got the
// glued "Capitol Hillto" text fix.
const LAST_MODIFIED = {
  home: '2026-07-18',
  seattleZoning: '2026-07-18',
  about: '2026-07-18',
  neighborhoods: '2026-07-18',
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
