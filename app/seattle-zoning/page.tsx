import type { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle, Footer } from '@/components/ui';

const siteUrl = 'https://seattleatlas.org';

export const metadata = {
  title: 'Seattle Zoning Explained',
  description:
    'Understanding Seattle zoning: how land use rules shape housing, density, and neighborhoods. Explore what can be built where and why it matters.',
  alternates: {
    canonical: '/seattle-zoning',
  },
  openGraph: {
    title: 'Seattle Zoning Explained | Seattle Atlas',
    description:
      'Understanding Seattle zoning: how land use rules shape housing, density, and neighborhoods.',
  },
};

const faqs = [
  {
    question: 'What is zoning?',
    answer:
      'Zoning is a set of land use regulations that determine what can be built on each parcel of land. In Seattle, zoning controls building height, density, and permitted uses—dictating whether an area can have single-family homes, apartments, retail, or industrial uses.',
  },
  {
    question: 'Why does Seattle have so much single-family zoning?',
    answer:
      'Historically, Seattle—like most American cities—adopted single-family zoning in the early 20th century. These rules were often designed to maintain neighborhood character and, in some cases, to exclude certain populations. A large share of Seattle residential land has historically been reserved for detached single-family homes. [1][2]',
  },
  {
    question: 'What is missing middle housing?',
    answer:
      'Missing middle housing refers to building types between single-family homes and large apartment complexes: duplexes, triplexes, fourplexes, townhouses, and small apartment buildings. These housing types were common before modern zoning but are now prohibited in most Seattle neighborhoods. [5]',
  },
  {
    question: 'How does zoning affect housing costs?',
    answer:
      'By restricting the supply of housing in high-demand areas, exclusionary zoning contributes to higher housing costs. When only one home can be built on a lot that could support four or more units, fewer people can live in desirable neighborhoods with good transit and jobs access. [3][4]',
  },
  {
    question: 'What zoning changes is Seattle considering?',
    answer:
      'Seattle is evaluating several zoning reforms as part of its Comprehensive Plan 2044, including expanding allowances for ADUs (accessory dwelling units), increasing density near transit stations, and potentially allowing more housing types in traditionally single-family zones. [8][10]',
  },
];

const footnoteRegex = /\[(\d+)\]/g;

function renderAnswerWithFootnotes(answer: string) {
  const nodes: (string | ReactNode)[] = [];
  let lastIndex = 0;

  for (const match of answer.matchAll(footnoteRegex)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      nodes.push(answer.slice(lastIndex, matchIndex));
    }

    const footnoteNumber = match[1];
    nodes.push(
      <sup key={`${footnoteNumber}-${matchIndex}`}>
        [
        <a href={`#fn-${footnoteNumber}`} className="text-accent hover:underline">
          {footnoteNumber}
        </a>
        ]
      </sup>
    );

    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < answer.length) {
    nodes.push(answer.slice(lastIndex));
  }

  return nodes;
}

export default function SeattleZoningPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Seattle Zoning Explained',
        url: `${siteUrl}/seattle-zoning`,
        description:
          'Understanding Seattle zoning: how land use rules shape housing, density, and neighborhoods.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-panel-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          <header className="mb-8">
            <p className="text-sm uppercase tracking-wide text-accent mb-2">Land use guide</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Seattle Zoning Explained
            </h1>
            <p className="text-lg text-text-secondary">
              How land use rules shape what gets built—and what doesn&apos;t—across Seattle.
            </p>
          </header>

          <div className="space-y-8 text-text-secondary">
            {/* Introduction */}
            <section className="space-y-4">
              <p>
                Seattle faces a housing affordability crisis, and zoning plays a central role. The
                city&apos;s land use code determines where housing can be built, how dense it can
                be, and what types of buildings are permitted. Many of these rules trace back to
                mid-20th-century zoning practices and have significant consequences for housing
                supply, neighborhood composition, and transportation patterns.
                <sup>
                  <a href="#fn-1" className="text-accent hover:underline">
                    1
                  </a>
                </sup>
              </p>
              <p>
                Understanding zoning is essential for anyone interested in Seattle&apos;s housing
                debate. This page provides an overview of how Seattle&apos;s zoning works, why it
                matters, and what changes are being considered.
              </p>
            </section>

            {/* The Scale of Single-Family Zoning */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                The scale of single-family zoning
              </h2>
              <p>
                A large share of Seattle&apos;s residential land has historically been zoned
                exclusively for detached single-family homes. This means that on much of
                Seattle&apos;s residential land, it is illegal to build a duplex, a small apartment
                building, or even—until recently—an accessory dwelling unit.
                <sup>
                  <a href="#fn-2" className="text-accent hover:underline">
                    2
                  </a>
                </sup>
              </p>
              <p>
                This pattern is not unique to Seattle. Most American cities adopted similar zoning
                codes in the early-to-mid 1900s. However, the consequences have become increasingly
                apparent: by restricting housing supply in desirable areas, single-family zoning
                contributes to higher housing costs, longer commutes, and increased car dependence.
                <sup>
                  <a href="#fn-1" className="text-accent hover:underline">
                    1
                  </a>
                </sup>
              </p>
              <p>
                Research in urban economics consistently shows that restrictive zoning is associated
                with higher housing prices. When demand for housing in a neighborhood increases but
                supply cannot respond, prices rise. The people priced out are typically those with
                lower incomes, often workers in service industries who must then commute long
                distances to their jobs.
                <sup>
                  <a href="#fn-3" className="text-accent hover:underline">
                    3
                  </a>{' '}
                  <a href="#fn-4" className="text-accent hover:underline">
                    4
                  </a>
                </sup>
              </p>
            </section>

            {/* Missing Middle */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">The missing middle</h2>
              <p>
                Before modern zoning, American cities featured a diversity of housing types:
                duplexes, triplexes, row houses, courtyard apartments, and small apartment
                buildings. These &quot;missing middle&quot; housing types provided naturally
                affordable options and allowed neighborhoods to accommodate residents at different
                life stages and income levels.
                <sup>
                  <a href="#fn-5" className="text-accent hover:underline">
                    5
                  </a>
                </sup>
              </p>
              <p>
                Seattle&apos;s zoning largely eliminated this diversity. The result is a bifurcated
                housing market: expensive single-family homes in most neighborhoods, and larger
                apartment buildings concentrated along arterials and in urban villages. The gentle
                density that once characterized urban neighborhoods has been regulated out of
                existence.
              </p>
              <p>
                Recent policy changes have begun to address this. Seattle now allows accessory
                dwelling units (ADUs) in single-family zones, and the city is considering broader
                reforms. However, the pace of change remains slow relative to the scale of the
                housing shortage.
              </p>
            </section>

            {/* Transit and Land Use */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">Transit and land use</h2>
              <p>
                Zoning and transportation are deeply interconnected. Low-density zoning makes public
                transit financially unviable—there simply aren&apos;t enough riders per square mile
                to justify frequent service. This creates a feedback loop: without good transit,
                residents depend on cars; with car dependence entrenched, there&apos;s less
                political will to increase density.
                <sup>
                  <a href="#fn-6" className="text-accent hover:underline">
                    6
                  </a>
                </sup>
              </p>
              <p>
                Seattle has invested heavily in light rail, yet much of the land near stations
                remains zoned for low-density uses. This represents a significant missed
                opportunity. Transit-oriented development—higher density housing near transit
                stations—is one of the most effective ways to reduce car dependence and create
                sustainable urban neighborhoods.
                <sup>
                  <a href="#fn-7" className="text-accent hover:underline">
                    7
                  </a>
                </sup>
              </p>
              <p>
                The{' '}
                <Link href="/map" className="text-accent hover:underline">
                  Seattle Atlas map
                </Link>{' '}
                lets you explore this relationship: toggle between zoning and transit layers to see
                how current land use rules align (or don&apos;t) with transit investment.
              </p>
            </section>

            {/* What's Changing */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">What&apos;s changing</h2>
              <p>
                Seattle is in the midst of updating its Comprehensive Plan, the document that guides
                land use policy for the next 20 years. Several zoning reforms are under
                consideration:
                <sup>
                  <a href="#fn-8" className="text-accent hover:underline">
                    8
                  </a>
                </sup>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Station area rezoning:</strong> Increasing allowed density near light rail
                  stations
                </li>
                <li>
                  <strong>ADU expansion:</strong> Making it easier to build backyard cottages and
                  basement apartments
                </li>
                <li>
                  <strong>Missing middle legalization:</strong> Allowing duplexes, triplexes, and
                  small apartments in more areas
                </li>
                <li>
                  <strong>Urban village expansion:</strong> Extending areas designated for growth
                </li>
              </ul>
              <p>
                These changes face political opposition from some homeowners who prefer to maintain
                existing neighborhood character. The debate reflects a fundamental tension in urban
                policy: the interests of current residents versus the needs of future residents and
                the broader region.
              </p>
              <p>
                Similar debates are playing out nationally as cities reconsider zoning to increase
                housing supply and reuse underutilized space.
                <sup>
                  <a href="#fn-9" className="text-accent hover:underline">
                    9
                  </a>
                </sup>
              </p>
            </section>

            {/* Using Seattle Atlas */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Explore with Seattle Atlas
              </h2>
              <p>
                Seattle Atlas provides an interactive way to explore these issues. The map combines
                zoning data, transit routes, and proposed changes in a single interface. You can:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>View current zoning designations for any parcel</li>
                <li>See simplified &quot;what can be built&quot; categories</li>
                <li>Explore transit routes and bike infrastructure</li>
                <li>Toggle proposed zoning changes to see what&apos;s being considered</li>
                <li>Click any parcel for detailed information</li>
              </ul>
              <div className="pt-4">
                <Link
                  href="/map"
                  className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Open the map
                </Link>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium text-text-primary">{faq.question}</h3>
                    <p className="text-sm">{renderAnswerWithFootnotes(faq.answer)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Sources */}
            <section className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                Sources and further reading
              </h2>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
                <li id="fn-1">
                  New York Times (The Upshot),{' '}
                  <a
                    href="https://www.nytimes.com/interactive/2019/06/18/upshot/cities-across-america-question-single-family-zoning.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Cities Start to Question an American Ideal: A House With a Yard on Every Lot
                  </a>
                </li>
                <li id="fn-2">
                  New York Times (The Upshot),{' '}
                  <a
                    href="https://www.nytimes.com/interactive/2019/06/18/upshot/cities-across-america-question-single-family-zoning.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Single-family zoning share by city (interactive map)
                  </a>
                </li>
                <li id="fn-3">
                  Gyourko, J. & Molloy, R. (2015),{' '}
                  <a
                    href="https://www.nber.org/papers/w20536"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Regulation and Housing Supply
                  </a>
                </li>
                <li id="fn-4">
                  Hsieh, C.-T. & Moretti, E. (2019),{' '}
                  <a
                    href="https://www.nber.org/papers/w21154"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Housing Constraints and Spatial Misallocation
                  </a>
                </li>
                <li id="fn-5">
                  Parolek, D. (2020),{' '}
                  <a
                    href="https://islandpress.org/books/missing-middle-housing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Missing Middle Housing
                  </a>
                </li>
                <li id="fn-6">
                  Ewing, R. & Cervero, R. (2010),{' '}
                  <a
                    href="https://doi.org/10.1080/01944361003766766"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Travel and the Built Environment: A Meta-Analysis
                  </a>
                </li>
                <li id="fn-7">
                  National Academies Press,{' '}
                  <a
                    href="https://nap.nationalacademies.org/catalog/23360/transit-oriented-development-in-the-united-states-experiences-challenges-and"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Transit-Oriented Development in the United States
                  </a>
                </li>
                <li id="fn-8">
                  City of Seattle,{' '}
                  <a
                    href="https://www.seattle.gov/opcd/ongoing-initiatives/comprehensive-plan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Comprehensive Plan 2044
                  </a>
                </li>
                <li id="fn-9">
                  Financial Times,{' '}
                  <a
                    href="https://www.ft.com/content/e0e73796-f3db-47d9-aa8c-7e25ab6b81a8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Go zone — New York is building, baby, building
                  </a>
                </li>
                <li id="fn-10">
                  Seattle Municipal Code,{' '}
                  <a
                    href="https://library.municode.com/wa/seattle/codes/municipal_code?nodeId=TIT23LAUSCO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Title 23 – Land Use Code
                  </a>
                </li>
                <li id="fn-11">
                  Sightline Institute,{' '}
                  <a
                    href="https://www.sightline.org/series/legalizing-inexpensive-housing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Legalizing Inexpensive Housing
                  </a>
                </li>
                <li id="fn-12">
                  The Urbanist,{' '}
                  <a
                    href="https://www.theurbanist.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Seattle-focused urban policy coverage
                  </a>
                </li>
              </ol>
            </section>

            {/* Disclaimer */}
            <p className="text-sm pt-4 border-t border-border">
              Seattle Atlas is an independent project and is not affiliated with the City of
              Seattle. Zoning data is sourced from official city datasets but may not reflect the
              most recent changes. Always verify with official sources for legal determinations.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
