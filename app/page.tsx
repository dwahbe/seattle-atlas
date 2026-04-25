import { Suspense } from 'react';
import Link from 'next/link';
import { MapContainer } from '@/components/map/MapContainer';

const siteUrl = 'https://seattleatlas.org';

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
        image: `${siteUrl}/og.svg`,
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
      <main id="main-content" className="w-full h-screen overflow-hidden">
        <Suspense fallback={<MapLoading />}>
          <MapContainer />
        </Suspense>
      </main>
      {/* Crawlable text for SEO — visually hidden, accessible to search engines and screen readers. */}
      <section className="sr-only">
        <h1>Seattle Atlas: zoning, transit, and land use in one map</h1>
        <p>
          Search Seattle zoning by neighborhood, explore what can be built where, and see transit
          and proposed changes side by side. Seattle Atlas brings zoning, land use, transit, and
          development proposals into a single interactive map.
        </p>
        <p>
          Seattle Atlas combines zoning data from the City of Seattle, transit routes from King
          County Metro and Sound Transit, and bike infrastructure from SDOT. Click any parcel to see
          allowed uses, nearby permits, Walk Score, and proposed zoning changes from the
          Comprehensive Plan 2044 (One Seattle Plan) and Ordinance 127376 — including the new
          Neighborhood Residential zone, station area rezoning, ADU and DADU expansion, missing
          middle housing, and Centers and Corridors legislation.
        </p>

        <h2>Explore zoning by Seattle neighborhood</h2>
        <ul>
          <li>Capitol Hill zoning</li>
          <li>Ballard zoning</li>
          <li>Beacon Hill zoning</li>
          <li>West Seattle zoning</li>
          <li>South Lake Union zoning</li>
          <li>Belltown zoning</li>
          <li>Queen Anne zoning</li>
          <li>Fremont zoning</li>
          <li>Wallingford zoning</li>
          <li>University District zoning</li>
          <li>Greenwood and Phinney Ridge zoning</li>
          <li>Ravenna and Roosevelt zoning</li>
          <li>Northgate zoning</li>
          <li>Lake City zoning</li>
          <li>Magnolia zoning</li>
          <li>Interbay zoning</li>
          <li>Georgetown zoning</li>
          <li>SoDo zoning</li>
          <li>Pioneer Square zoning</li>
          <li>International District / Chinatown zoning</li>
          <li>First Hill zoning</li>
          <li>Central District zoning</li>
          <li>Madison Park, Madrona, and Leschi zoning</li>
          <li>Mount Baker zoning</li>
          <li>Columbia City and Hillman City zoning</li>
          <li>Rainier Valley zoning</li>
          <li>Downtown Seattle zoning</li>
          <li>Pike Market and Waterfront zoning</li>
        </ul>

        <h2>Zone codes and land use designations</h2>
        <p>
          Seattle Atlas covers every zone in the Seattle Municipal Code Title 23, including
          Neighborhood Residential (NR); Lowrise 1, 2, and 3 (LR1, LR2, LR3); Midrise (MR); Highrise
          (HR); Neighborhood Commercial 1, 2, and 3 (NC1, NC2, NC3); Commercial 1 and 2 (C1, C2);
          Seattle Mixed (SM); Urban Center / Village (UX); Master Planned Community (MPC); Downtown
          zones DMC, DMR, DOC1, DOC2, DRC, DH1, DH2; Pioneer Square Mixed (PSM); International
          District Mixed and Residential (IDM, IDR); Pike Market Mixed (PMM); Major Institution
          Overlay (MIO); and the industrial zones Industrial Commercial (IC), Industrial Buffer
          (IB), Maritime Manufacturing/Logistics (MML), and Industry &amp; Innovation (II).
        </p>

        <h2>Map layers</h2>
        <ul>
          <li>
            Simplified zoning — what can be built (houses &amp; townhomes, apartments, mixed-use,
            towers, institutions, industrial)
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
          <Link href="/seattle-zoning">Guide to Seattle zoning</Link>
          <Link href="/about">About Seattle Atlas</Link>
        </nav>
      </section>
    </>
  );
}
