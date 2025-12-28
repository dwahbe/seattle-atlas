import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata = {
  title: 'Methodology',
  description: 'Data sources, methodology, and technical documentation for Civic Atlas – Seattle.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--panel-bg))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--border-color))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
          <Link href="/map" className="group shrink-0">
            <h1 className="text-lg font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
              Civic Atlas
            </h1>
            <p className="text-xs text-[rgb(var(--text-secondary))]">Seattle</p>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 pt-0.5">
            <Link
              href="/map"
              className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--text-primary))] transition-colors whitespace-nowrap"
            >
              ← Back to Map
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">Methodology</h1>
          <p className="text-lg text-[rgb(var(--text-secondary))] mb-8">
            Documentation of data sources, processing methods, and update schedules.
          </p>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Data Sources
            </h2>

            <div className="space-y-6">
              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">Zoning Data</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Source</dt>
                    <dd className="text-[rgb(var(--text-primary))]">
                      City of Seattle Open Data Portal
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Update Frequency</dt>
                    <dd className="text-[rgb(var(--text-primary))]">Quarterly</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Last Updated</dt>
                    <dd className="text-[rgb(var(--text-primary))]">January 2025</dd>
                  </div>
                </dl>
                <p className="text-sm text-[rgb(var(--text-secondary))] mt-4">
                  Zoning boundaries are sourced from Seattle&apos;s official GIS data. Zone
                  classifications follow the Seattle Municipal Code Title 23 designations. We
                  process raw shapefiles into vector tiles for efficient rendering.
                </p>
              </div>

              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">Transit Data</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Source</dt>
                    <dd className="text-[rgb(var(--text-primary))]">
                      King County Metro & Sound Transit GTFS
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Update Frequency</dt>
                    <dd className="text-[rgb(var(--text-primary))]">Monthly</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Last Updated</dt>
                    <dd className="text-[rgb(var(--text-primary))]">January 2025</dd>
                  </div>
                </dl>
                <p className="text-sm text-[rgb(var(--text-secondary))] mt-4">
                  Transit stops and routes are derived from General Transit Feed Specification
                  (GTFS) data published by regional transit agencies. Station walkshed buffers are
                  calculated using network-based walking distances, not simple circular buffers.
                </p>
              </div>

              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Neighborhood Boundaries
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Source</dt>
                    <dd className="text-[rgb(var(--text-primary))]">City of Seattle GIS</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[rgb(var(--text-secondary))]">Update Frequency</dt>
                    <dd className="text-[rgb(var(--text-primary))]">As needed</dd>
                  </div>
                </dl>
                <p className="text-sm text-[rgb(var(--text-secondary))] mt-4">
                  Neighborhood boundaries reflect the City&apos;s official district map used for
                  planning purposes. These boundaries may differ from commonly used neighborhood
                  names.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Derived Analysis
            </h2>

            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>
                The &quot;Transit-Rich, Low Density&quot; layer is a derived dataset created by
                Civic Atlas. It identifies parcels that meet both of the following criteria:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  Located within ½ mile walking distance of a high-capacity transit station (Link
                  Light Rail or Stride BRT)
                </li>
                <li>
                  Currently zoned for single-family residential (SF 5000, SF 7200, SF 9600) or
                  Lowrise 1
                </li>
              </ol>
              <p>
                This analysis is intended to identify potential areas for transit-oriented
                development and inform policy discussions. It does not represent any official city
                proposal or recommendation.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Proposal Tracking
            </h2>

            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>We track zoning and land use proposals from the following official sources:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Seattle Office of Planning & Community Development (OPCD)</li>
                <li>Seattle City Council legislation</li>
                <li>Seattle Department of Construction & Inspections (SDCI)</li>
                <li>Sound Transit system expansion planning</li>
              </ul>
              <p>
                Proposal status is updated weekly. All proposal information links to official
                government sources. Civic Atlas does not editorialize or advocate for specific
                proposals.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Technical Implementation
            </h2>

            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>
                Civic Atlas uses vector tiles hosted on Mapbox for efficient map rendering at all
                zoom levels. Data processing pipeline:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Source data downloaded from official portals (GeoJSON, Shapefile)</li>
                <li>Data cleaned and standardized using GDAL/OGR</li>
                <li>Converted to MBTiles using Tippecanoe</li>
                <li>Uploaded to Mapbox as hosted tilesets</li>
                <li>Styled and served via Mapbox GL JS</li>
              </ol>
              <p>
                The application is built with Next.js and deployed on Vercel. All code is open
                source.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Limitations & Disclaimers
            </h2>

            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  This tool is for informational purposes only. Always verify zoning with the
                  Seattle Department of Construction & Inspections for official determinations.
                </li>
                <li>
                  Data may not reflect the most recent changes. Check the &quot;Last Updated&quot;
                  date for each layer.
                </li>
                <li>
                  Boundary accuracy is limited by source data resolution. Parcel-level
                  determinations require official surveys.
                </li>
                <li>
                  Proposal information represents our best understanding of current status and may
                  change as legislative processes evolve.
                </li>
              </ul>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--border-color))] mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[rgb(var(--text-secondary))]">Civic Atlas – Seattle</p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/about"
                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                About
              </Link>
              <Link
                href="/map"
                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                Map
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
