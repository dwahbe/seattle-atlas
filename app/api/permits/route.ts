import { NextRequest, NextResponse } from 'next/server';
import { permitsQuerySchema, parseSearchParams } from '@/lib/validation';
import { buildPermitsQueries, permitsSince } from '@/lib/permits';

export interface Permit {
  permit_number: string;
  permit_type: string;
  description: string;
  status: string;
  issue_date: string | null;
  address: string;
  value: number | null;
  link: string;
}

export interface PermitsResponse {
  permits: Permit[];
  total: number;
  error?: string;
}

/**
 * GET /api/permits?lat=47.6062&lng=-122.3321&radius=500
 *
 * Fetches building permits near a location from Seattle Open Data (SODA API).
 * No API key required.
 */
export async function GET(request: NextRequest): Promise<NextResponse<PermitsResponse>> {
  const parsed = parseSearchParams(permitsQuerySchema, request.nextUrl.searchParams);
  if (!parsed.success) {
    return parsed.response as NextResponse<PermitsResponse>;
  }

  const { lat, lng, radius, limit } = parsed.data;

  try {
    const { listUrl, countUrl } = buildPermitsQueries({
      lat,
      lng,
      radius,
      limit,
      since: permitsSince(new Date()),
    });

    const fetchOptions = {
      headers: { Accept: 'application/json' },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    };

    const [listResponse, countResponse] = await Promise.all([
      fetch(listUrl, fetchOptions),
      fetch(countUrl, fetchOptions),
    ]);

    if (!listResponse.ok) {
      throw new Error(`Seattle Open Data API returned ${listResponse.status}`);
    }

    const data = await listResponse.json();

    // Transform to our permit format
    // Field mapping based on current Seattle Open Data schema:
    // permitnum, permitclassmapped, permittypedesc, description, statuscurrent,
    // issueddate, originaladdress1, estprojectcost, link
    const permits: Permit[] = data.map((p: Record<string, unknown>) => {
      // link is a SODA URL-type column: { url: string }, not a string
      const linkUrl = (p.link as { url?: unknown } | null | undefined)?.url;
      return {
        permit_number: String(p.permitnum || ''),
        permit_type: String(p.permittypedesc || p.permitclassmapped || 'Building Permit'),
        description: String(p.description || '').slice(0, 500),
        status: String(p.statuscurrent || 'Unknown'),
        issue_date: p.issueddate ? String(p.issueddate).split('T')[0] : null,
        address: String(p.originaladdress1 || ''),
        value: p.estprojectcost ? Number(p.estprojectcost) : null,
        link:
          typeof linkUrl === 'string'
            ? linkUrl
            : `https://cosaccela.seattle.gov/Portal/Cap/CapDetail.aspx?Module=DPDPermits&capID1=${encodeURIComponent(String(p.permitnum || ''))}`,
      };
    });

    // Best-effort true total — SODA returns [{ total: "123" }] with the count
    // as a string. On any failure, fall back to the page length rather than
    // failing the whole request.
    let total = permits.length;
    if (countResponse.ok) {
      try {
        const countData = await countResponse.json();
        const parsedTotal = Number(countData?.[0]?.total);
        if (Number.isFinite(parsedTotal)) {
          total = Math.max(parsedTotal, permits.length);
        }
      } catch {
        // keep fallback
      }
    }

    return NextResponse.json({ permits, total });
  } catch (error) {
    console.error('Seattle Permits API error:', error);
    return NextResponse.json(
      {
        permits: [],
        total: 0,
        error: 'Failed to fetch permits',
      },
      { status: 500 }
    );
  }
}
