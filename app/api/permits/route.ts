import { NextRequest, NextResponse } from 'next/server';

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
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '300'; // Default 300 meters
  const limit = searchParams.get('limit') || '10';

  // Validate required params
  if (!lat || !lng) {
    return NextResponse.json(
      {
        permits: [],
        total: 0,
        error: 'Missing required parameters: lat, lng',
      },
      { status: 400 }
    );
  }

  try {
    // Seattle Open Data - Building Permits dataset
    // https://data.seattle.gov/Permitting/Building-Permits/76t5-zqzr
    const baseUrl = 'https://data.seattle.gov/resource/76t5-zqzr.json';

    // Build SoQL query
    // within_circle finds points within radius meters of lat/lng
    const query = new URLSearchParams({
      $where: `within_circle(location, ${lat}, ${lng}, ${radius})`,
      $order: 'issue_date DESC',
      $limit: limit,
      // Only get permits from last 2 years
      $q: '', // Empty full-text search
    });

    // Add date filter for recent permits (last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const dateFilter = `issue_date >= '${twoYearsAgo.toISOString().split('T')[0]}'`;
    query.set('$where', `within_circle(location, ${lat}, ${lng}, ${radius}) AND ${dateFilter}`);

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
    const permits: Permit[] = data.map((p: Record<string, unknown>) => ({
      permit_number: String(p.application_permit_number || p.permit_number || ''),
      permit_type: String(p.permit_type || p.category || 'Building Permit'),
      description: String(p.description || p.work_type || '').slice(0, 200),
      status: String(p.status || 'Unknown'),
      issue_date: p.issue_date ? String(p.issue_date).split('T')[0] : null,
      address: String(p.address || p.original_address || ''),
      value: p.value ? Number(p.value) : null,
      link: `https://cosaccela.seattle.gov/Portal/Cap/CapDetail.aspx?Module=DPDPermits&capID1=${encodeURIComponent(String(p.application_permit_number || ''))}`,
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
