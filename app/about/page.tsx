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
    <div className="min-h-screen bg-panel-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 min-h-[56px] flex items-center justify-between gap-4">
          <Link href="/map" className="group flex items-center">
            <span className="text-lg font-bold leading-none text-text-primary group-hover:text-accent transition-colors">
              Seattle Atlas
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/map"
              className="h-9 flex items-center text-sm text-accent hover:text-text-primary transition-colors whitespace-nowrap"
            >
              View Map
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article>
          <h1 className="text-3xl font-bold text-text-primary mb-6">About Seattle Atlas</h1>

          <div className="space-y-6 text-text-secondary">
            <p className="text-sm">
              Seattle Atlas is an interactive map for exploring land use, transit, and urban
              planning in Seattle. View zoning rules, transit routes, bike infrastructure, and
              proposed development policies—all in one place.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                What&apos;s on the Map
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-text-primary mb-1">Zoning &amp; Land Use</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>
                      Simplified view showing what can be built (houses &amp; townhomes, apartments,
                      mixed-use, etc.)
                    </li>
                    <li>
                      Detailed technical zoning codes (NR, LR2, NC3, etc.), reflecting the Jan 21,
                      2026 adoption of One Seattle Plan Ordinance 127376
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1">Parks &amp; Open Space</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>
                      Public parks, greenbelts, and open space—488 parks covering 12.1% of
                      Seattle&apos;s land area
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1">Transit</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                    <li>Bus and ferry routes (King County Metro)</li>
                    <li>Link Light Rail and Sounder commuter rail (Sound Transit)</li>
                    <li>Bus stops and transit stations</li>
                    <li>
                      Bike infrastructure: protected lanes, greenways, trails, shared lanes,
                      sharrows
                    </li>
                  </ul>
                </div>

              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                How the Simplified View Works
              </h2>
              <p className="text-sm mb-4">
                Seattle&apos;s zoning code defines 30 distinct zone designations under Ordinance
                127376 (Jan 21, 2026). The Simplified view groups these into six everyday
                categories so you can see at a glance what&apos;s allowed in each neighborhood. The
                Technical view keeps each official code separate. Both draw from the same
                underlying data — only the coloring differs.
              </p>

              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: '#FCE8C8' }}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">
                      Homes &amp; Small Shops{' '}
                      <span className="font-normal text-text-tertiary">— 69.4% of Seattle</span>
                    </div>
                    <div className="text-text-secondary">
                      Low-density residential: houses, townhomes, small multiplexes, ADUs, and
                      corner cafes. Includes{' '}
                      <span className="font-mono text-xs">NR</span> (Neighborhood Residential),{' '}
                      <span className="font-mono text-xs">LR1</span> and{' '}
                      <span className="font-mono text-xs">LR2</span> (Lowrise 1 &amp; 2).
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: '#F4A261' }}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">
                      Midsize Buildings{' '}
                      <span className="font-normal text-text-tertiary">— 5.6% of Seattle</span>
                    </div>
                    <div className="text-text-secondary">
                      Apartment buildings roughly 3–7 stories. Includes{' '}
                      <span className="font-mono text-xs">LR3</span> (Lowrise 3) and{' '}
                      <span className="font-mono text-xs">MR</span> (Midrise).
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: '#B388EB' }}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">
                      Shops &amp; Mixed-Use{' '}
                      <span className="font-normal text-text-tertiary">— 10.1% of Seattle</span>
                    </div>
                    <div className="text-text-secondary">
                      Commercial corridors and urban villages where apartments sit above
                      storefronts. Includes{' '}
                      <span className="font-mono text-xs">NC1</span>,{' '}
                      <span className="font-mono text-xs">NC2</span>,{' '}
                      <span className="font-mono text-xs">NC3</span> (Neighborhood Commercial),{' '}
                      <span className="font-mono text-xs">C1</span>,{' '}
                      <span className="font-mono text-xs">C2</span> (Commercial),{' '}
                      <span className="font-mono text-xs">SM</span> (Seattle Mixed),{' '}
                      <span className="font-mono text-xs">UX</span> (Urban Center/Village), and{' '}
                      <span className="font-mono text-xs">MPC</span> (Master Planned Community).
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: '#7C5CBF' }}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">
                      Downtown &amp; Towers{' '}
                      <span className="font-normal text-text-tertiary">— 1.8% of Seattle</span>
                    </div>
                    <div className="text-text-secondary">
                      High-rise zones concentrated downtown, in the International District, and
                      Pike Market. Includes <span className="font-mono text-xs">HR</span>{' '}
                      (Highrise), <span className="font-mono text-xs">DMC</span>,{' '}
                      <span className="font-mono text-xs">DMR</span>,{' '}
                      <span className="font-mono text-xs">DOC1</span>,{' '}
                      <span className="font-mono text-xs">DOC2</span>,{' '}
                      <span className="font-mono text-xs">DRC</span>,{' '}
                      <span className="font-mono text-xs">DH1</span>,{' '}
                      <span className="font-mono text-xs">DH2</span> (Downtown zones),{' '}
                      <span className="font-mono text-xs">PSM</span> (Pioneer Square Mixed),{' '}
                      <span className="font-mono text-xs">IDM</span>,{' '}
                      <span className="font-mono text-xs">IDR</span> (International District), and{' '}
                      <span className="font-mono text-xs">PMM</span> (Pike Market Mixed).
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: '#7EC8E3' }}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">
                      Institutions{' '}
                      <span className="font-normal text-text-tertiary">— 2.2% of Seattle</span>
                    </div>
                    <div className="text-text-secondary">
                      Hospitals and university campuses with their own development standards.
                      Includes <span className="font-mono text-xs">MIO</span> (Major Institution
                      Overlay).
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: '#6B7280' }}
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-text-primary">
                      Industrial{' '}
                      <span className="font-normal text-text-tertiary">— 11.0% of Seattle</span>
                    </div>
                    <div className="text-text-secondary">
                      Manufacturing, maritime, and industrial land — mostly in SoDo, Ballard,
                      Interbay, and Georgetown. Includes{' '}
                      <span className="font-mono text-xs">IC</span> (Industrial Commercial),{' '}
                      <span className="font-mono text-xs">IB</span> (Industrial Buffer),{' '}
                      <span className="font-mono text-xs">MML</span> (Maritime
                      Manufacturing/Logistics), and{' '}
                      <span className="font-mono text-xs">II</span> (Industry &amp; Innovation).
                    </div>
                  </div>
                </li>
              </ul>

              <p className="text-xs text-text-tertiary mt-4">
                Percentages reflect each category&apos;s share of Seattle&apos;s zoned land area.
                Parks and open space (an additional 12.1%) render as a separate layer.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Data Sources</h2>
              <p className="text-sm mb-4">
                All data is sourced from official government agencies and public datasets. Each
                zone&apos;s detail view links directly to its governing code section.
              </p>

              <div className="space-y-5">
                <div>
                  <h3 className="font-medium text-text-primary mb-1.5">Zoning &amp; Land Use</h3>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                    <li>
                      <a
                        href="https://data.seattle.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        City of Seattle Open Data Portal
                      </a>{' '}
                      &mdash; zoning boundaries and classifications
                    </li>
                    <li>
                      <a
                        href="https://library.municode.com/wa/seattle/codes/municipal_code?nodeId=TIT23LAUSCO"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Seattle Municipal Code, Title 23
                      </a>{' '}
                      &mdash; zone classifications and development standards
                    </li>
                    <li>
                      <a
                        href="https://www.seattle.gov/sdci/codes/codes-we-enforce-(a-z)/land-use-code"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        SDCI Land Use Code
                      </a>{' '}
                      &mdash; official code descriptions and enforcement
                    </li>
                    <li>
                      <a
                        href="https://www.seattle.gov/dpd/Research/gis/webplots/legend.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        SDCI Map Books Legend (PDF)
                      </a>{' '}
                      &mdash; zone code reference for official maps
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1.5">Property &amp; Parcels</h3>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                    <li>
                      <a
                        href="https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels/MapServer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        King County GIS
                      </a>{' '}
                      &mdash; parcel boundaries, lot size, property use
                    </li>
                    <li>
                      <a
                        href="https://blue.kingcounty.com/Assessor/eRealProperty/Dashboard.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        King County Assessor
                      </a>{' '}
                      &mdash; assessed values, sales history
                    </li>
                    <li>
                      <a
                        href="https://data.seattle.gov/Permitting/Building-Permits/76t5-zqzr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Seattle Open Data &mdash; Building Permits
                      </a>{' '}
                      &mdash; nearby permits and project costs
                    </li>
                    <li>
                      <a
                        href="https://www.walkscore.com/professional/api.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Walk Score API
                      </a>{' '}
                      &mdash; walkability, transit, and bike scores
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1.5">Transit</h3>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                    <li>
                      <a
                        href="https://metro.kingcounty.gov/GTFS/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        King County Metro (GTFS)
                      </a>{' '}
                      &mdash; bus and ferry routes, stop locations
                    </li>
                    <li>
                      <a
                        href="https://www.soundtransit.org/help-contacts/business-information/open-transit-data-otd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Sound Transit (GTFS)
                      </a>{' '}
                      &mdash; Link Light Rail, Sounder commuter rail
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1.5">Bike Infrastructure</h3>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                    <li>
                      <a
                        href="https://data-seattlecitygis.opendata.arcgis.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Seattle Department of Transportation (SDOT)
                      </a>{' '}
                      &mdash; protected lanes, greenways, multi-use trails, sharrows
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1.5">Parks &amp; Open Space</h3>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                    <li>
                      <a
                        href="https://data-seattlecitygis.opendata.arcgis.com/datasets/SeattleCityGIS::park-boundary-details"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Seattle Parks &amp; Recreation
                      </a>{' '}
                      &mdash; park boundaries, names, types, and acquisition history
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-1.5">Planning &amp; Policy</h3>
                  <ul className="list-disc list-inside space-y-1.5 ml-2 text-sm">
                    <li>
                      <a
                        href="https://www.seattle.gov/opcd/one-seattle-plan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        One Seattle Plan / Comprehensive Plan 2044
                      </a>{' '}
                      &mdash; citywide growth and land use policies
                    </li>
                    <li>
                      <a
                        href="https://www.seattle.gov/opcd/station-area-planning"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Station Area Planning
                      </a>{' '}
                      &mdash; proposed rezones around light rail stations
                    </li>
                    <li>
                      <a
                        href="https://www.seattle.gov/sdci/codes/changes-to-code/accessory-dwelling-units-code-updates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        ADU Code Updates
                      </a>{' '}
                      &mdash; accessory dwelling unit policy changes
                    </li>
                    <li>
                      <a
                        href="https://www.seattle.gov/opcd/current-projects/industrial-and-maritime-strategy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Industrial &amp; Maritime Strategy
                      </a>{' '}
                      &mdash; industrial zone updates and protections
                    </li>
                    <li>
                      <a
                        href="https://www.soundtransit.org/system-expansion/ballard-link-extension"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Ballard Link Extension
                      </a>{' '}
                      &mdash; planned light rail expansion (Sound Transit)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Open Source</h2>
              <p className="text-sm mb-3">
                Seattle Atlas is open source. View the code on{' '}
                <a
                  href="https://github.com/dwahbe/seattle-atlas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  GitHub
                </a>
                .
              </p>
              <p className="text-sm mb-3">
                The app is built with{' '}
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Next.js
                </a>{' '}
                (App Router),{' '}
                <a
                  href="https://react.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  React
                </a>
                , and{' '}
                <a
                  href="https://www.typescriptlang.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  TypeScript
                </a>
                , styled with{' '}
                <a
                  href="https://tailwindcss.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Tailwind CSS
                </a>
                . Maps are rendered client-side with{' '}
                <a
                  href="https://docs.mapbox.com/mapbox-gl-js/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Mapbox GL JS
                </a>
                , with shareable map state (position, active layers, filters) synced to URL query
                params via{' '}
                <a
                  href="https://nuqs.47ng.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  nuqs
                </a>
                . API routes validate input with{' '}
                <a
                  href="https://zod.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Zod
                </a>
                .
              </p>
              <p className="text-sm">
                Source data is processed into vector tiles using{' '}
                <a
                  href="https://github.com/felt/tippecanoe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Tippecanoe
                </a>{' '}
                and hosted on Mapbox. The project uses{' '}
                <a
                  href="https://bun.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Bun
                </a>{' '}
                as its package manager and test runner, and is deployed on{' '}
                <a
                  href="https://vercel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Vercel
                </a>
                .
              </p>
            </section>

            <p className="text-sm pt-4 border-t border-border">
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
