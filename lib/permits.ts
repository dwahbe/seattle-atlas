/**
 * SoQL query builders for the Seattle Open Data building-permits dataset.
 * https://data.seattle.gov/Permitting/Building-Permits/76t5-zqzr
 */

export const PERMITS_DATASET_URL = 'https://data.seattle.gov/resource/76t5-zqzr.json';

/** How far back the "Nearby Activity" window reaches. */
export const PERMITS_WINDOW_YEARS = 2;

/**
 * Date-only cutoff (YYYY-MM-DD, UTC) so the fetch URL — and therefore Next's
 * fetch cache key — changes at most once a day.
 */
export function permitsSince(now: Date): string {
  const since = new Date(now);
  since.setUTCFullYear(since.getUTCFullYear() - PERMITS_WINDOW_YEARS);
  return since.toISOString().split('T')[0];
}

interface PermitsQueryParams {
  lat: number;
  lng: number;
  radius: number;
  limit: number;
  since: string;
}

/**
 * The list query returns the `limit` most recent permits; the count query
 * returns the true total for the same circle + window, so the UI can report
 * "N permits" without being capped at the page size.
 */
export function buildPermitsQueries({ lat, lng, radius, limit, since }: PermitsQueryParams): {
  listUrl: string;
  countUrl: string;
} {
  // The dataset's point column is location1, not location.
  const where = `within_circle(location1, ${lat}, ${lng}, ${radius}) AND issueddate >= '${since}'`;

  const listQuery = new URLSearchParams({
    $where: where,
    $order: 'issueddate DESC',
    $limit: String(limit),
  });

  const countQuery = new URLSearchParams({
    $select: 'count(*) as total',
    $where: where,
  });

  return {
    listUrl: `${PERMITS_DATASET_URL}?${listQuery}`,
    countUrl: `${PERMITS_DATASET_URL}?${countQuery}`,
  };
}
