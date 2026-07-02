import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb, Footer, PageHeader } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { getSiteUrl } from '@/lib/site-url';
import { getLegendCategories } from '@/lib/layers';
import { staticMapUrl, STATIC_MAP_WIDTH, STATIC_MAP_HEIGHT } from '@/lib/static-map';
import {
  NEIGHBORHOOD_PAGES,
  getNeighborhoodPage,
  getNeighborhoodBounds,
  neighborhoodMapHref,
} from '@/data/neighborhood-pages';

const siteUrl = getSiteUrl();
const zoningLegend = getLegendCategories('zoning');

export const dynamicParams = false;

export function generateStaticParams() {
  return NEIGHBORHOOD_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getNeighborhoodPage(slug);
  if (!page) return {};

  const title = `${page.name} Zoning Map`;
  return {
    title,
    description: page.description,
    alternates: {
      canonical: `/neighborhoods/${page.slug}`,
    },
    openGraph: {
      title: `${title} | Seattle Atlas`,
      description: page.description,
      url: `${siteUrl}/neighborhoods/${page.slug}`,
      siteName: 'Seattle Atlas',
      type: 'article',
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
      title: `${title} | Seattle Atlas`,
      description: page.description,
    },
  };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getNeighborhoodPage(slug);
  if (!page) notFound();

  const mapHref = neighborhoodMapHref(page);
  const bounds = getNeighborhoodBounds(page);
  const mapImageUrl = bounds ? staticMapUrl(bounds) : null;
  const others = NEIGHBORHOOD_PAGES.filter((p) => p.slug !== page.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${page.name} Zoning Map`,
        url: `${siteUrl}/neighborhoods/${page.slug}`,
        description: page.description,
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
          {
            '@type': 'ListItem',
            position: 3,
            name: page.name,
            item: `${siteUrl}/neighborhoods/${page.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-panel-bg flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader mapHref={mapHref} />

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <article>
          <header className="mb-8">
            <Breadcrumb
              items={[{ label: 'Neighborhoods', href: '/neighborhoods' }, { label: page.name }]}
            />
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-text-primary">
              {page.name} Zoning
            </h1>
          </header>

          <div className="space-y-8 text-text-secondary">
            {mapImageUrl && (
              <figure>
                <Link href={mapHref} aria-label={`Open ${page.name} in the Interactive Map`}>
                  <Image
                    src={mapImageUrl}
                    alt={`Zoning map of the ${page.name} area of Seattle`}
                    width={STATIC_MAP_WIDTH}
                    height={STATIC_MAP_HEIGHT}
                    unoptimized
                    priority
                    className="w-full h-auto rounded-lg border border-border"
                  />
                </Link>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Map Legend">
                  {zoningLegend.map((category) => (
                    <li
                      key={category.label}
                      className="flex items-center gap-1.5 text-xs text-text-secondary"
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-sm border border-border"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.label}
                    </li>
                  ))}
                </ul>
              </figure>
            )}

            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-3">At a Glance</h2>
              <dl className="space-y-3">
                {page.highlights.map((highlight) => (
                  <div key={highlight.label}>
                    <dt className="font-medium text-text-primary">{highlight.label}</dt>
                    <dd className="text-sm">{highlight.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="space-y-4">
              {page.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">See It on the Map</h2>
              <p>
                Open the interactive map centered on {page.name} to see every parcel&apos;s zoning,
                click for allowed uses and nearby permits, and toggle transit and bike layers. New
                to zone codes? Start with the{' '}
                <Link href="/seattle-zoning" className="text-accent hover:underline">
                  guide to Seattle zoning
                </Link>
                .
              </p>
              <div className="pt-2">
                <Link href={mapHref}>
                  <Button variant="primary" size="lg">
                    Open {page.name} in the Map
                  </Button>
                </Link>
              </div>
            </section>

            <section className="pt-4 border-t border-border">
              <h2 className="text-xl font-semibold text-text-primary mb-3">More Neighborhoods</h2>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/neighborhoods/${other.slug}`}
                      className="text-accent hover:underline"
                    >
                      {other.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-sm pt-4 border-t border-border">
              Seattle Atlas is not affiliated with the City of Seattle. Zoning data is sourced from
              official city datasets but may not reflect the most recent changes — verify with
              official sources for legal determinations.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
