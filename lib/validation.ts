/**
 * API Input Validation Schemas
 *
 * Shared Zod schemas for validating API route query parameters.
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';

// ============================================================================
// Schemas
// ============================================================================

/** Latitude/longitude coordinate pair */
export const coordsSchema = z.object({
  lat: z.coerce.number().min(-90, 'Latitude must be between -90 and 90').max(90),
  lng: z.coerce.number().min(-180, 'Longitude must be between -180 and 180').max(180),
});

/** Permits endpoint query parameters */
export const permitsQuerySchema = coordsSchema.extend({
  radius: z.coerce.number().min(1).max(5000).default(300),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/** Walk Score endpoint query parameters */
export const walkscoreQuerySchema = coordsSchema.extend({
  address: z.string().max(200).optional().default(''),
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse URL search params against a Zod schema.
 * Returns the parsed data on success, or a NextResponse error on failure.
 */
export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  // Convert URLSearchParams to a plain object
  // Only include keys that are present (so defaults work correctly)
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    raw[key] = value;
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    const errors = result.error.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid parameters', details: errors },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}
