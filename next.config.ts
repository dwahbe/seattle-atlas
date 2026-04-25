import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable strict mode for better error catching
  reactStrictMode: true,

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
    ],
  },

  // The map lives at `/`. Permanently redirect any links to the old `/map`
  // route (and anything nested beneath it) so inbound backlinks and shared
  // URLs keep working.
  async redirects() {
    return [
      {
        source: '/map',
        destination: '/',
        permanent: true,
      },
      {
        source: '/map/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Public civic data: allow third-party embeds (urbanist blogs,
          // news sites, City of Seattle pages) so the map can spread.
          // No auth, forms, or PII on the page → clickjacking risk is nil.
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *;',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
