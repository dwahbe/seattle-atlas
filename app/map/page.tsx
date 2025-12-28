import { Suspense } from 'react';
import { MapContainer } from '@/components/map/MapContainer';

export const metadata = {
  title: 'Map',
  description: 'Explore Seattle zoning, transit, and proposed changes on an interactive map.',
};

function MapLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[rgb(var(--panel-bg))]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[rgb(var(--text-secondary))]">Loading map...</p>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <Suspense fallback={<MapLoading />}>
        <MapContainer />
      </Suspense>
    </main>
  );
}
