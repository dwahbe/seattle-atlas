import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Seattle Atlas – Seattle',
    template: '%s | Seattle Atlas – Seattle',
  },
  description:
    'An interactive zoning, transit, and fiscal atlas for Seattle. Explore what can be built where, what changes are proposed, and what transit serves each area.',
  keywords: [
    'Seattle',
    'zoning',
    'transit',
    'urban planning',
    'land use',
    'city planning',
    'civic data',
    'GIS',
    'maps',
  ],
  authors: [{ name: 'Seattle Atlas' }],
  openGraph: {
    title: 'Seattle Atlas – Seattle',
    description:
      'An interactive zoning, transit, and fiscal atlas for Seattle. Explore what can be built where, what changes are proposed, and what transit serves each area.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seattle Atlas – Seattle',
    description: 'An interactive zoning, transit, and fiscal atlas for Seattle.',
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
