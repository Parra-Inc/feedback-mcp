// Dependency-free fixed-window rate limiter. State is per-process, which is
// the right tradeoff for a self-hosted single-instance deployment. If you run
// multiple replicas or serverless, each instance enforces its own window;
// put a shared limiter (e.g. your reverse proxy) in front for global limits.

interface Bucket {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 5 * 60_000;

const buckets = new Map<string, Bucket>();
let lastCleanup = 0;

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// `limit` is requests per minute; 0 or negative disables the check.
export function checkRateLimit(key: string, limit: number): RateLimitResult {
  if (limit <= 0) return { allowed: true, retryAfterSeconds: 0 };

  const now = Date.now();
  cleanup(now);

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

// For tests.
export function resetRateLimits() {
  buckets.clear();
  lastCleanup = 0;
}
