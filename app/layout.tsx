import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Instrument_Sans } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Seattle Atlas – Seattle Zoning Map',
    template: '%s | Seattle Atlas',
  },
  description:
    'Interactive Seattle zoning map and planning atlas. Explore zoning rules, transit routes, and proposed land use changes across Seattle neighborhoods.',
  authors: [{ name: 'Seattle Atlas' }],
  openGraph: {
    title: 'Seattle Atlas – Seattle Zoning Map',
    description:
      'Interactive Seattle zoning map and planning atlas. Explore zoning rules, transit routes, and proposed land use changes.',
    url: siteUrl,
    siteName: 'Seattle Atlas',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seattle Atlas – Seattle Zoning Map',
    description: 'Interactive Seattle zoning map. Explore zoning, transit, and proposed changes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0C0E' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variable classes must sit on <html>: globals.css defines
    // --font-stack-sans on :root, and a custom property resolves its var()
    // references where it's declared — on <body> the fonts never apply.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('civic-atlas-theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  }
                  // Mirror of MAP_STATE_PARAMS in lib/url-state.ts — an inline
                  // pre-hydration script can't import. Keep this list in sync.
                  var p = new URLSearchParams(window.location.search);
                  var mapKeys = ['lat','lng','z','layers','filters','inspect','compare'];
                  var hasMapState = mapKeys.some(function(k){ return p.has(k); });
                  if (hasMapState || localStorage.getItem('atlas-intro-seen') === '1') {
                    document.documentElement.classList.add('intro-seen');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to content
        </a>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Analytics />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgb(var(--panel-bg))',
              color: 'rgb(var(--text-primary))',
              border: '1px solid rgb(var(--border-color))',
            },
          }}
        />
      </body>
    </html>
  );
}
