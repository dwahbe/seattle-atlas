import { Suspense } from 'react';
import Link from 'next/link';
import { MapContainer } from '@/components/map/MapContainer';

export const metadata = {
  title: 'Interactive Seattle Zoning Map',
  description:
    'Explore Seattle zoning, transit routes, and proposed land use changes on an interactive map. View what can be built on any parcel.',
  alternates: {
    canonical: '/map',
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

export default function MapPage() {
  return (
    <>
      <main className="w-full h-screen overflow-hidden">
        <Suspense fallback={<MapLoading />}>
          <MapContainer />
        </Suspense>
      </main>
      {/* Crawlable text for SEO - visually hidden but accessible to search engines */}
      <section className="sr-only">
        <h1>Seattle Zoning Map</h1>
        <p>
          Interactive map of Seattle zoning, transit, and land use. Explore what can be built on any
          parcel, view transit routes and bike infrastructure, and see proposed zoning changes
          including station area rezoning and the Comprehensive Plan 2044.
        </p>
        <p>
          Seattle Atlas combines zoning data from the City of Seattle, transit routes from King
          County Metro and Sound Transit, and bike infrastructure from SDOT.
        </p>
        <nav>
          <Link href="/seattle-zoning">Learn about Seattle zoning</Link>
          <Link href="/about">About Seattle Atlas</Link>
        </nav>
      </section>
    </>
  );
}
