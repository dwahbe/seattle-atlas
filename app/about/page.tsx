import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata = {
  title: 'About',
  description:
    'About Seattle Atlas – an open civic data platform for understanding land use and transit.',
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
              Seattle Atlas is an interactive map for exploring Seattle&apos;s zoning and transit
              data. Built by{' '}
              <a
                href="https://dylanwahbe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgb(var(--accent))] hover:underline"
              >
                Dylan Wahbe
              </a>
              .
            </p>

            <section>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                Data Sources
              </h2>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Zoning:</strong> City of Seattle Open Data Portal
                </li>
                <li>
                  <strong>Transit:</strong> King County Metro GTFS
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-3">
                Methodology
              </h2>
              <p className="mb-3">
                Zoning boundaries are sourced from Seattle&apos;s official GIS data and follow
                Seattle Municipal Code Title 23 designations. Transit routes and stops come from
                GTFS data published by King County Metro.
              </p>
              <p>
                Source data is processed into vector tiles using Tippecanoe and hosted on Mapbox.
                The app is built with Next.js.
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

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--border-color))] mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Built by{' '}
              <a
                href="https://dylanwahbe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgb(var(--accent))] hover:underline"
              >
                Dylan Wahbe
              </a>
            </p>
            <Link
              href="/map"
              className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
            >
              Map
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
