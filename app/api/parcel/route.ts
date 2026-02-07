import { NextRequest, NextResponse } from 'next/server';
import { coordsSchema, parseSearchParams } from '@/lib/validation';

export interface ParcelResponse {
  pin: string;
  acres: number | null;
  lotSqFt: number | null;
  zoning: string | null;
  presentUse: string | null;
  assessorUrl: string;
  error?: string;
}

/**
 * GET /api/parcel?lat=47.6062&lng=-122.3321
 *
 * Fetches parcel data from King County GIS ArcGIS REST API.
 * Returns property information for the parcel at the given coordinates.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ParcelResponse>> {
  const parsed = parseSearchParams(coordsSchema, request.nextUrl.searchParams);
  if (!parsed.success) {
    return parsed.response as NextResponse<ParcelResponse>;
  }

  const { lat, lng } = parsed.data;

  try {
    // King County GIS ArcGIS REST API - Parcels layer (has full coverage)
    const parcelsUrl =
      'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_Parcels/MapServer/0/query';

    // Build query params for point intersection
    const params = new URLSearchParams({
      geometry: `${lng},${lat}`,
      geometryType: 'esriGeometryPoint',
      inSR: '4326', // WGS84 coordinate system
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'PIN,Shape.STArea()',
      returnGeometry: 'false',
      f: 'json',
    });

    const response = await fetch(`${parcelsUrl}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`King County GIS API returned ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      throw new Error(data.error.message || 'API error');
    }

    // Check if we got any features back
    if (!data.features || data.features.length === 0) {
      return NextResponse.json({
        pin: '',
        acres: null,
        lotSqFt: null,
        zoning: null,
        presentUse: null,
        assessorUrl: '',
        error: 'No parcel found at this location',
      });
    }

    // Get the first feature
    const feature = data.features[0];
    const attrs = feature.attributes || {};

    // Extract PIN and area
    const pin = String(attrs.PIN || '').trim();
    // Shape.STArea() is in square feet (State Plane coordinate system)
    const areaKey = Object.keys(attrs).find((k) => k.includes('STArea'));
    const areaSqFt = areaKey ? Number(attrs[areaKey]) : null;
    const lotSqFt = areaSqFt ? Math.round(areaSqFt) : null;
    const acres = lotSqFt ? lotSqFt / 43560 : null;

    // Try to get additional property info from PropertyInfo layer
    let presentUse: string | null = null;
    let zoning: string | null = null;

    try {
      const propertyInfoUrl =
        'https://gismaps.kingcounty.gov/arcgis/rest/services/Property/KingCo_PropertyInfo/MapServer/0/query';
      const propParams = new URLSearchParams({
        geometry: `${lng},${lat}`,
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: 'PREUSE_DESC,KCA_ZONING',
        returnGeometry: 'false',
        f: 'json',
      });

      const propResponse = await fetch(`${propertyInfoUrl}?${propParams.toString()}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });

      if (propResponse.ok) {
        const propData = await propResponse.json();
        if (propData.features && propData.features.length > 0) {
          const propAttrs = propData.features[0].attributes || {};
          presentUse = propAttrs.PREUSE_DESC ? String(propAttrs.PREUSE_DESC).trim() : null;
          zoning = propAttrs.KCA_ZONING ? String(propAttrs.KCA_ZONING).trim() : null;
        }
      }
    } catch {
      // Property info is optional, continue without it
    }

    // Build King County Assessor URL
    const assessorUrl = pin
      ? `https://blue.kingcounty.com/Assessor/eRealProperty/Dashboard.aspx?ParcelNbr=${pin.replace(/-/g, '')}`
      : '';

    return NextResponse.json({
      pin,
      acres,
      lotSqFt,
      zoning,
      presentUse,
      assessorUrl,
    });
  } catch (error) {
    console.error('King County Parcel API error:', error);
    return NextResponse.json(
      {
        pin: '',
        acres: null,
        lotSqFt: null,
        zoning: null,
        presentUse: null,
        assessorUrl: '',
        error: 'Failed to fetch parcel data',
      },
      { status: 500 }
    );
  }
}
