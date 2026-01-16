import Link from 'next/link';
import { ThemeToggle, Footer } from '@/components/ui';

export const metadata = {
  title: 'About',
  description:
    'About Seattle Atlas – an open civic data platform for understanding land use and transit.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--panel-bg))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--border-color))]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/map" className="group">
            <h1 className="text-lg font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
              Seattle Atlas
            </h1>
          </Link>
          <div className="flex items-center gap-4">
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-6">
            About Seattle Atlas
          </h1>

          <div className="space-y-6 text-[rgb(var(--text-secondary))]">
            <p>
              Seattle Atlas is an interactive map for exploring land use, transit, and urban
              planning in Seattle. View zoning rules, transit routes, bike infrastructure, and
              proposed development policies—all in one place.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                What&apos;s on the Map
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-[rgb(var(--text-primary))] mb-1">
                    Zoning &amp; Land Use
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>
                      Simplified view showing what can be built (houses, apartments, mixed-use,
                      etc.)
                    </li>
                    <li>Detailed technical zoning codes (NR1, LR2, NC3, etc.)</li>
                    <li>Urban Villages—areas designated for growth</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-[rgb(var(--text-primary))] mb-1">Transit</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Bus and ferry routes (King County Metro, Sound Transit)</li>
                    <li>Transit stops across Seattle</li>
                    <li>
                      Bike infrastructure: protected lanes, greenways, trails, shared lanes,
                      sharrows
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-[rgb(var(--text-primary))] mb-1">
                    Development Proposals
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Station area rezoning around light rail</li>
                    <li>ADU policy updates</li>
                    <li>Comprehensive Plan 2044</li>
                    <li>Industrial &amp; maritime strategy</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                Data Sources
              </h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Zoning &amp; Urban Villages:</strong> City of Seattle Open Data Portal
                </li>
                <li>
                  <strong>Transit Routes &amp; Stops:</strong> King County Metro GTFS, Sound Transit
                </li>
                <li>
                  <strong>Bike Infrastructure:</strong> Seattle Department of Transportation (SDOT)
                </li>
                <li>
                  <strong>Development Proposals:</strong> Seattle Office of Planning &amp; Community
                  Development (OPCD)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                Methodology
              </h2>
              <p className="mb-3">
                All geographic data is sourced from official government datasets. Zoning boundaries
                follow Seattle Municipal Code Title 23 designations. Transit data comes from GTFS
                feeds published by transit agencies. Bike infrastructure reflects SDOT&apos;s master
                plan.
              </p>
              <p>
                Source data is processed into vector tiles using Tippecanoe and hosted on Mapbox.
                The app is built with Next.js, React, and TypeScript.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                Open Source
              </h2>
              <p>
                Seattle Atlas is open source. View the code on{' '}
                <a
                  href="https://github.com/dwahbe/seattle-atlas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgb(var(--accent))] hover:underline"
                >
                  GitHub
                </a>
                .
              </p>
            </section>

            <p className="text-sm pt-4 border-t border-[rgb(var(--border-color))]">
              Seattle Atlas is not affiliated with the City of Seattle, King County, or any
              government agency. Data may not reflect the most recent changes—verify with official
              sources for legal determinations.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
