import { NextRequest, NextResponse } from 'next/server';
import { walkscoreQuerySchema, parseSearchParams } from '@/lib/validation';

export interface WalkScoreResponse {
  walkscore: number | null;
  description: string | null;
  transit_score: number | null;
  bike_score: number | null;
  logo_url: string;
  more_info_link: string;
  error?: string;
}

/**
 * GET /api/walkscore?lat=47.6062&lng=-122.3321&address=...
 *
 * Proxies requests to Walk Score API to protect the API key.
 */
export async function GET(request: NextRequest): Promise<NextResponse<WalkScoreResponse>> {
  const parsed = parseSearchParams(walkscoreQuerySchema, request.nextUrl.searchParams);
  if (!parsed.success) {
    return parsed.response as NextResponse<WalkScoreResponse>;
  }

  const { lat, lng, address } = parsed.data;

  const apiKey = process.env.WALKSCORE_API_KEY;
  if (!apiKey) {
    console.error('WALKSCORE_API_KEY not configured');
    return NextResponse.json(
      {
        walkscore: null,
        description: null,
        transit_score: null,
        bike_score: null,
        logo_url: '',
        more_info_link: '',
        error: 'Walk Score API not configured',
      },
      { status: 500 }
    );
  }

  try {
    // Build Walk Score API URL
    // Docs: https://www.walkscore.com/professional/api.php
    const params = new URLSearchParams({
      format: 'json',
      lat: String(lat),
      lon: String(lng),
      transit: '1', // Include transit score
      bike: '1', // Include bike score
      wsapikey: apiKey,
    });

    // Add address if provided (improves accuracy)
    if (address) {
      params.set('address', address);
    }

    const apiUrl = `https://api.walkscore.com/score?${params.toString()}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 1 day - scores don't change frequently
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Walk Score API returned ${response.status}`);
    }

    const data = await response.json();

    // Check for API-level errors
    if (data.status !== 1) {
      // Status codes: 1=success, 2=score unavailable, other=error
      return NextResponse.json({
        walkscore: null,
        description: 'Score not available for this location',
        transit_score: null,
        bike_score: null,
        logo_url: data.logo_url || 'https://cdn.walk.sc/images/api-logo.png',
        more_info_link: data.ws_link || data.help_link || '',
      });
    }

    return NextResponse.json({
      walkscore: data.walkscore ?? null,
      description: data.description ?? null,
      transit_score: data.transit?.score ?? null,
      bike_score: data.bike?.score ?? null,
      logo_url: data.logo_url || 'https://cdn.walk.sc/images/api-logo.png',
      more_info_link: data.ws_link || data.help_link || '',
    });
  } catch (error) {
    console.error('Walk Score API error:', error);
    return NextResponse.json(
      {
        walkscore: null,
        description: null,
        transit_score: null,
        bike_score: null,
        logo_url: '',
        more_info_link: '',
        error: 'Failed to fetch Walk Score',
      },
      { status: 500 }
    );
  }
}
