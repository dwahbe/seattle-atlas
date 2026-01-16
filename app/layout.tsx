import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'https://seattleatlas.org');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Seattle Atlas – Seattle Zoning Map',
    template: '%s | Seattle Atlas',
  },
  description:
    'Interactive Seattle zoning map and planning atlas. Explore zoning rules, transit routes, and proposed land use changes across Seattle neighborhoods.',
  keywords: [
    'Seattle zoning',
    'Seattle zoning map',
    'Seattle land use',
    'Seattle transit',
    'Seattle urban planning',
    'Seattle housing',
    'Seattle comprehensive plan',
    'Seattle neighborhoods',
    'zoning map',
    'GIS',
  ],
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
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css" rel="stylesheet" />
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
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Analytics />
      </body>
    </html>
  );
}
