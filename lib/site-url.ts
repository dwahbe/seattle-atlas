/**
 * Canonical site origin for metadata, sitemap, robots, and JSON-LD.
 *
 * Fallback order matters on Vercel: NEXT_PUBLIC_VERCEL_URL is the
 * per-deployment URL (e.g. seattle-atlas-abc123.vercel.app) even in
 * production, so prefer the project production domain when available.
 * Previews therefore canonicalize to the production domain, which is
 * what we want — Vercel noindexes preview deployments anyway.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return 'https://seattleatlas.org';
}
