import Link from 'next/link';
import { Footer } from '@/components/ui';

const siteUrl = 'https://seattleatlas.org';

export const metadata = {
  title: 'Seattle Zoning Map',
  description:
    'Seattle zoning map and planning atlas. Explore zoning, transit, and proposed changes across Seattle.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Seattle Atlas',
        url: siteUrl,
        image: `${siteUrl}/og.svg`,
      },
      {
        '@type': 'WebSite',
        name: 'Seattle Atlas',
        url: siteUrl,
        description:
          'Seattle zoning map and planning atlas. Explore zoning, transit, and proposed changes across Seattle.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-panel-bg flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-wide text-accent">Seattle zoning map</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                Seattle Atlas: zoning, transit, and land use in one map
              </h1>
              <p className="text-base sm:text-lg text-text-secondary">
                Search Seattle zoning by neighborhood, explore what can be built where, and see
                transit and proposed changes side by side. Seattle Atlas brings zoning, land use,
                transit, and development proposals into a single interactive map. Read our{' '}
                <Link href="/seattle-zoning" className="text-accent hover:underline">
                  guide to Seattle zoning
                </Link>{' '}
                or learn more{' '}
                <Link href="/about" className="text-accent hover:underline">
                  about the project
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-2">
              <Link
                href="/map"
                className="inline-flex items-center justify-center rounded-md bg-accent px-8 py-4 text-base sm:text-lg font-semibold text-white hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                Open the map
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
