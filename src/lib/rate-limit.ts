/**
 * Fixed-window rate limiter held in module memory.
 *
 * On Vercel each serverless instance keeps its own counter, so this throttles
 * a runaway client and keeps one visitor from burning the deployment's free
 * quota — it is not a distributed guarantee. Swapping in Upstash or Vercel KV
 * behind this same interface is the upgrade path; see README.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

/** Stops the map growing without bound on a long-lived instance. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets; used for the Retry-After header. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  now: number = Date.now(),
): RateLimitResult {
  sweep(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfter };
}

/** Test seam. */
export function resetRateLimits() {
  buckets.clear();
}

/**
 * Best-effort client identity. Behind Vercel the left-most x-forwarded-for
 * entry is the real client; the fallback groups unknown callers together,
 * which is deliberately conservative.
 */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return `${scope}:${ip}`;
}
