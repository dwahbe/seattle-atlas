/**
 * Shared Mapbox REST helper for the upload scripts. The token rides in the
 * query string (Mapbox does not accept header auth), so request URLs are
 * never included in error output.
 */

const MAPBOX_API = 'https://api.mapbox.com';

export async function mapboxFetch<T>(
  token: string,
  apiPath: string,
  init?: RequestInit,
  query: Record<string, string> = {}
): Promise<T> {
  const url = new URL(apiPath, MAPBOX_API);
  url.searchParams.set('access_token', token);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Mapbox ${init?.method ?? 'GET'} ${apiPath} failed: ${res.status} ${text.slice(0, 500)}`
    );
  }
  return JSON.parse(text) as T;
}
