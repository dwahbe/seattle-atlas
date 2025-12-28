import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata = {
  title: 'About',
  description:
    'About Civic Atlas – Seattle, an open civic data platform for understanding land use and transit.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--panel-bg))]">
      {/* Header */}
      <header className="border-b border-[rgb(var(--border-color))]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/map" className="group">
            <h1 className="text-lg font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent))] transition-colors">
              Civic Atlas
            </h1>
            <p className="text-xs text-[rgb(var(--text-secondary))]">Seattle</p>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/map"
              className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
            >
              ← Back to Map
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            About Civic Atlas
          </h1>
          <p className="text-lg text-[rgb(var(--text-secondary))] mb-8">
            An open platform for understanding Seattle's land use, zoning, and transit systems.
          </p>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Mission
            </h2>
            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>
                Civic Atlas exists to make Seattle's land use and transit data accessible,
                understandable, and useful for everyone—residents, policymakers, journalists,
                researchers, and advocates alike.
              </p>
              <p>
                We believe that informed civic participation requires access to clear, accurate
                information about how our city is shaped. Zoning codes and transit plans are public
                documents, but they're often difficult to interpret without specialized knowledge.
                Civic Atlas bridges that gap.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              What We Provide
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <div className="w-10 h-10 bg-[rgb(var(--accent))] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Current Zoning
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Interactive visualization of Seattle's zoning designations, from single-family
                  zones to downtown cores.
                </p>
              </div>

              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <div className="w-10 h-10 bg-[rgb(var(--accent))] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Transit Access
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Stops, routes, and station walksheds for Link Light Rail, RapidRide, and frequent
                  transit service.
                </p>
              </div>

              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <div className="w-10 h-10 bg-[rgb(var(--accent))] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Proposed Changes
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Tracking active zoning proposals and comprehensive plan updates as they move
                  through the legislative process.
                </p>
              </div>

              <div className="bg-[rgb(var(--secondary-bg))] p-6 rounded-lg">
                <div className="w-10 h-10 bg-[rgb(var(--accent))] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-2">
                  Shareable Links
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Every map view generates a unique URL you can share, bookmark, or embed in
                  presentations and articles.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Editorial Independence
            </h2>
            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>
                Civic Atlas presents factual data without advocacy. We do not take positions on
                policy debates or endorse specific proposals. Our role is to provide accurate,
                contextualized information that enables informed discussion.
              </p>
              <p>
                When displaying proposal information, we link directly to official government
                sources and clearly distinguish between adopted policy and pending legislation.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Open Source
            </h2>
            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>
                Civic Atlas is built with open-source technology and our code is publicly available.
                We believe civic tools should be transparent and auditable.
              </p>
              <p>
                The data visualization layers, analysis methodology, and application code can be
                inspected, forked, and adapted for other cities facing similar information
                accessibility challenges.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Data Sources
            </h2>
            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>All data displayed on Civic Atlas comes from official public sources:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>City of Seattle Open Data Portal</li>
                <li>King County GIS Center</li>
                <li>Sound Transit GTFS feeds</li>
                <li>King County Metro GTFS feeds</li>
                <li>Seattle Office of Planning & Community Development</li>
              </ul>
              <p>
                See our{' '}
                <Link href="/methodology" className="text-[rgb(var(--accent))] hover:underline">
                  Methodology
                </Link>{' '}
                page for detailed documentation of data processing and update schedules.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-4 pb-2 border-b border-[rgb(var(--border-color))]">
              Contact
            </h2>
            <div className="space-y-4 text-[rgb(var(--text-secondary))]">
              <p>
                For data corrections, feature requests, or general inquiries, please open an issue
                on our GitHub repository or contact us via email.
              </p>
              <p>
                Civic Atlas is not affiliated with the City of Seattle, King County, Sound Transit,
                or any government agency.
              </p>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgb(var(--border-color))] mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[rgb(var(--text-secondary))]">Civic Atlas – Seattle</p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/methodology"
                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                Methodology
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
