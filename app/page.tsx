import { Suspense } from 'react';
import Link from 'next/link';
import { MapDeepLinkScroller } from '@/components/map/MapDeepLinkScroller';
import { MapContainer } from '@/components/map/MapContainer';
import { IntroHero } from '@/components/ui/IntroHero';
import { getSiteUrl } from '@/lib/site-url';
import { OG_IMAGE } from '@/lib/og-image';

const siteUrl = getSiteUrl();

const homeTitle = 'Seattle Atlas – Seattle Zoning Map';
const homeDescription =
  'Interactive map of Seattle zoning, transit, parks, and bike infrastructure. Search any address to see what can be built — with the latest 2026 zoning rules.';

export const metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: `${siteUrl}/`,
    siteName: 'Seattle Atlas',
    type: 'website',
    locale: 'en_US',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
  },
};

function MapLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-panel-bg">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-text-secondary">Loading map...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Seattle Atlas',
        url: siteUrl,
        logo: `${siteUrl}/icon-512.png`,
        image: `${siteUrl}${OG_IMAGE.url}`,
        sameAs: ['https://github.com/dwahbe/seattle-atlas'],
      },
      {
        '@type': 'WebSite',
        name: 'Seattle Atlas',
        url: siteUrl,
        description:
          'Interactive Seattle zoning map and planning atlas. Explore zoning, transit routes, and proposed land use changes across Seattle neighborhoods.',
      },
      {
        '@type': 'WebApplication',
        name: 'Seattle Atlas',
        url: siteUrl,
        applicationCategory: 'Maps',
        operatingSystem: 'Web',
        description:
          'Interactive Seattle zoning map and planning atlas. Explore zoning, transit routes, and proposed land use changes across Seattle neighborhoods.',
        browserRequirements: 'Requires JavaScript and WebGL',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MapDeepLinkScroller />
      <main id="main-content" className="w-full h-screen overflow-hidden">
        <Suspense fallback={<MapLoading />}>
          <MapContainer />
        </Suspense>
      </main>
      <IntroHero />
      {/* Crawlable text for SEO — visually hidden, accessible to search engines and screen readers. */}
      <section className="sr-only">
        <h1>Seattle&rsquo;s zoning and transit simplified</h1>
        <p>
          Search Seattle zoning by neighborhood, explore what can be built where, and see transit
          and proposed changes side by side. Seattle Atlas brings zoning, land use, transit, and
          development proposals into a single interactive map.
        </p>
        <p>
          Seattle Atlas combines zoning data from the City of Seattle, transit routes from King
          County Metro and Sound Transit, and bike infrastructure from SDOT. Click any parcel to see
          allowed uses, nearby permits, Car-Free Score, and proposed zoning changes from the
          Comprehensive Plan 2044 (One Seattle Plan) and Ordinance 127376 — including the new
          Neighborhood Residential zone, station area rezoning, ADU and DADU expansion, missing
          middle housing, and Centers and Corridors legislation.
        </p>

        <h2>Explore zoning by Seattle neighborhood</h2>
        <p>
          Use the search to jump straight to a neighborhood — Capitol Hill, Ballard, Fremont, Queen
          Anne, Wallingford, the University District, South Lake Union, Downtown, West Seattle,
          Beacon Hill, Columbia City, and Greenwood are one keystroke away — or look up any Seattle
          address to see how its parcel is zoned.
        </p>

        <h2>Zone codes and land use designations</h2>
        <p>
          Seattle Atlas covers every zone in the Seattle Municipal Code Title 23, including
          Neighborhood Residential (NR); Lowrise 1, 2, and 3 (LR1, LR2, LR3); Midrise (MR); Highrise
          (HR); Neighborhood Commercial 1, 2, and 3 (NC1, NC2, NC3); Commercial 1 and 2 (C1, C2);
          Seattle Mixed (SM); Master Planned Community (MPC); Downtown zones DMC, DMR, DOC1, DOC2,
          DRC, DH1, DH2; Pioneer Square Mixed (PSM); International District Mixed and Residential
          (IDM, IDR); Pike Market Mixed (PMM); Major Institution Overlay (MIO); and the industrial
          zones Industrial Commercial (IC), Industrial Buffer (IB), Maritime Manufacturing/Logistics
          (MML), Industry &amp; Innovation (II), and Urban Industrial (UI).
        </p>

        <h2>Map layers</h2>
        <ul>
          <li>
            Simplified zoning — what can be built (homes and small shops, midsize residential and
            shops, large buildings, downtown and highrise — including the tower-zoned Seattle Mixed
            areas in the U District, South Lake Union, and Northgate — institutions, and industrial)
          </li>
          <li>Detailed technical zoning — every official Seattle zone code</li>
          <li>Parks and open space — 488 Seattle parks, greenbelts, and trails</li>
          <li>
            Transit — King County Metro bus and ferry routes, Sound Transit Link Light Rail and
            Sounder commuter rail, bus stops
          </li>
          <li>
            Bike infrastructure — protected lanes, neighborhood greenways, multi-use trails,
            sharrows from SDOT
          </li>
        </ul>

        <nav aria-label="Site">
          <Link href="/neighborhoods">Seattle zoning by neighborhood</Link>
          <Link href="/seattle-zoning">Guide to Seattle zoning</Link>
          <Link href="/about">About Seattle Atlas</Link>
        </nav>
      </section>
    </>
  );
}
