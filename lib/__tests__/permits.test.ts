import { describe, test, expect } from 'bun:test';
import { buildPermitsQueries, permitsSince, PERMITS_DATASET_URL } from '../permits';

describe('permitsSince', () => {
  test('returns a YYYY-MM-DD date two years back', () => {
    expect(permitsSince(new Date('2026-07-02T12:34:56Z'))).toBe('2024-07-02');
  });

  test('rolls leap day forward instead of producing an invalid date', () => {
    expect(permitsSince(new Date('2028-02-29T00:00:00Z'))).toBe('2026-03-01');
  });
});

describe('buildPermitsQueries', () => {
  const params = { lat: 47.6062, lng: -122.3321, radius: 300, limit: 10, since: '2024-07-02' };

  test('list query filters by circle and issue date, ordered and limited', () => {
    const { listUrl } = buildPermitsQueries(params);
    expect(listUrl.startsWith(PERMITS_DATASET_URL)).toBe(true);

    const url = new URL(listUrl);
    expect(url.searchParams.get('$where')).toBe(
      "within_circle(location1, 47.6062, -122.3321, 300) AND issueddate >= '2024-07-02'"
    );
    expect(url.searchParams.get('$order')).toBe('issueddate DESC');
    expect(url.searchParams.get('$limit')).toBe('10');
  });

  test('count query shares the same filter and selects a total', () => {
    const { listUrl, countUrl } = buildPermitsQueries(params);
    const list = new URL(listUrl);
    const count = new URL(countUrl);
    expect(count.searchParams.get('$select')).toBe('count(*) as total');
    expect(count.searchParams.get('$where')).toBe(list.searchParams.get('$where'));
    expect(count.searchParams.get('$limit')).toBeNull();
  });
});
