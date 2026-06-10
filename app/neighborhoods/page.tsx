import Link from 'next/link';
import { Footer, PageHeader } from '@/components/ui';
import { getSiteUrl } from '@/lib/site-url';
import { NEIGHBORHOOD_PAGES } from '@/data/neighborhood-pages';

const siteUrl = getSiteUrl();

const indexTitle = 'Seattle Zoning by Neighborhood';
const indexDescription =
  'Browse Seattle zoning neighborhood by neighborhood — Capitol Hill, Ballard, West Seattle, and more — with maps of what can be built under the 2026 rules.';

export const metadata = {
  title: indexTitle,
  description: indexDescription,
  alternates: {
    canonical: '/neighborhoods',
  },
  openGraph: {
    title: `${indexTitle} | Seattle Atlas`,
    description: indexDescription,
    url: `${siteUrl}/neighborhoods`,
    siteName: 'Seattle Atlas',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Seattle Atlas — Seattle zoning, transit, and land use in one map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${indexTitle} | Seattle Atlas`,
    description: indexDescription,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: indexTitle,
      url: `${siteUrl}/neighborhoods`,
      description: indexDescription,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: NEIGHBORHOOD_PAGES.map((page, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: page.name,
          url: `${siteUrl}/neighborhoods/${page.slug}`,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Neighborhoods',
          item: `${siteUrl}/neighborhoods`,
        },
      ],
    },
  ],
};

export default function NeighborhoodsIndexPage() {
  return (
    <div className="min-h-screen bg-panel-bg flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader current="/neighborhoods" />

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <article>
          <header className="mb-8 border-b border-border pb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{indexTitle}</h1>
            <p className="text-lg text-text-secondary">
              Zoning shapes every Seattle neighborhood differently. Pick one to see its zoning
              pattern, commercial corridors, and transit — and jump into the interactive map for
              parcel-level detail.
            </p>
          </header>

          <ul className="space-y-6 text-text-secondary">
            {NEIGHBORHOOD_PAGES.map((page) => (
              <li key={page.slug}>
                <h2 className="text-xl font-semibold">
                  <Link
                    href={`/neighborhoods/${page.slug}`}
                    className="text-text-primary hover:text-accent transition-colors"
                  >
                    {page.name}
                  </Link>
                </h2>
                <p className="text-sm mt-1">{page.lede}</p>
              </li>
            ))}
          </ul>

          <p className="text-sm mt-10 pt-4 border-t border-border text-text-secondary">
            Looking for somewhere else? The{' '}
            <Link href="/" className="text-accent hover:underline">
              interactive map
            </Link>{' '}
            covers every parcel in Seattle — search any address or neighborhood.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
