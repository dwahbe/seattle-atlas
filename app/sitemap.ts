import type { MetadataRoute } from 'next';

const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'https://seattleatlas.org');

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    { url: `${siteUrl}/`, lastModified },
    { url: `${siteUrl}/map`, lastModified },
    { url: `${siteUrl}/seattle-zoning`, lastModified, priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified },
  ];
}
