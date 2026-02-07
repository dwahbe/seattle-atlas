import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Rate Limiting Proxy
//
// Simple sliding-window rate limiter for /api/* routes.
// Uses an in-memory Map — state resets on each cold start in serverless
// environments. This provides best-effort per-instance protection, not a
// global rate limit. For strict limits, use an external store (e.g. Redis).
// ============================================================================

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per window

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateMap = new Map<string, RateEntry>();

// Cleanup stale entries every 60s to prevent memory leaks
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < WINDOW_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(key);
    }
  }
}

export function proxy(request: NextRequest) {
  cleanup();

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
