import { NextRequest, NextResponse } from "next/server";

/**
 * Fixed-window rate limiter backed by an in-process Map.
 *
 * Scope caveat: serverless instances don't share memory, so the effective
 * limit is (limit × warm instances). That is fine for blocking naive abuse
 * — scripted signup spam, credential stuffing from one host — but it is not
 * a distributed limiter. If you need hard guarantees, swap the store for
 * Upstash Redis; the call signature here won't change.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();
let lastSweep = Date.now();

function sweep(now: number) {
  // Amortised cleanup so the Map can't grow without bound.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  entry.count += 1;
  const success = entry.count <= limit;

  return {
    success,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
    retryAfter: success ? 0 : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Best-effort client IP.
 *
 * Header order matters for correctness: a client can send its own
 * `x-forwarded-for`, and its value ends up *leftmost* in the chain. Taking
 * the first entry would therefore let an attacker rotate the value freely
 * and bypass the limit. Vercel's own `x-vercel-forwarded-for` is set by the
 * platform and can't be spoofed, so it's preferred; falling back to
 * `x-forwarded-for` we take the LAST entry, which is the hop appended by
 * the trusted proxy.
 */
export function clientIp(request: NextRequest | Request): string {
  const headers = request.headers;

  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return "unknown";
}

/**
 * Applies a rate limit and returns a 429 response if exceeded, or null to
 * continue. Usage:
 *
 *   const limited = enforceRateLimit(request, "waitlist", 5, 60_000);
 *   if (limited) return limited;
 */
export function enforceRateLimit(
  request: NextRequest | Request,
  bucket: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const result = rateLimit(`${bucket}:${clientIp(request)}`, limit, windowMs);
  if (result.success) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    }
  );
}
