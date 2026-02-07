import { NextRequest, NextResponse } from 'next/server';
import { permitsQuerySchema, parseSearchParams } from '@/lib/validation';

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
    // Seattle Open Data - Building Permits dataset
    // https://data.seattle.gov/Permitting/Building-Permits/76t5-zqzr
    const baseUrl = 'https://data.seattle.gov/resource/76t5-zqzr.json';

    // Build SoQL query
    // within_circle finds points within radius meters of lat/lng
    // Note: column is location1, not location
    const query = new URLSearchParams({
      $where: `within_circle(location1, ${lat}, ${lng}, ${radius})`,
      $order: 'issueddate DESC',
      $limit: String(limit),
    });

    const apiUrl = `${baseUrl}?${query.toString()}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Seattle Open Data API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform to our permit format
    // Field mapping based on current Seattle Open Data schema:
    // permitnum, permitclassmapped, permittypedesc, description, statuscurrent,
    // issueddate, originaladdress1, estprojectcost, link
    const permits: Permit[] = data.map((p: Record<string, unknown>) => ({
      permit_number: String(p.permitnum || ''),
      permit_type: String(p.permittypedesc || p.permitclassmapped || 'Building Permit'),
      description: String(p.description || '').slice(0, 200),
      status: String(p.statuscurrent || 'Unknown'),
      issue_date: p.issueddate ? String(p.issueddate).split('T')[0] : null,
      address: String(p.originaladdress1 || ''),
      value: p.estprojectcost ? Number(p.estprojectcost) : null,
      link: p.link
        ? String(p.link)
        : `https://cosaccela.seattle.gov/Portal/Cap/CapDetail.aspx?Module=DPDPermits&capID1=${encodeURIComponent(String(p.permitnum || ''))}`,
    }));

    return NextResponse.json({
      permits,
      total: permits.length,
    });
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
