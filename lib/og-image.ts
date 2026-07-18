/**
 * The shared og:image entry for every page's `openGraph.images`, and the
 * single source for the social card's dimensions and alt text —
 * scripts/generate-og-map.ts renders app/opengraph-image.png at this size
 * and writes app/opengraph-image.alt.txt from this alt.
 *
 * Pages must reference it explicitly: a page-level `openGraph` metadata
 * export replaces the inherited object wholesale, silently dropping the
 * root file-convention image (observed on /about).
 */
export const OG_IMAGE = {
  url: '/opengraph-image.png',
  type: 'image/png',
  width: 1200,
  height: 630,
  alt: 'Seattle Atlas logo and wordmark on a soft gradient of zoning colors',
};
