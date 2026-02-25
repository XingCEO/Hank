type RateLimitBucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __studioRateLimitBuckets: Map<string, RateLimitBucket> | undefined;
}

const buckets = global.__studioRateLimitBuckets ?? new Map<string, RateLimitBucket>();
global.__studioRateLimitBuckets = buckets;

type ConsumeRateLimitParams = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < 300) {
    return;
  }

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit({ key, limit, windowMs }: ConsumeRateLimitParams): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  current.count += 1;
  buckets.set(key, current);

  const allowed = current.count <= limit;
  const remaining = Math.max(0, limit - current.count);
  return {
    allowed,
    remaining,
    resetAt: current.resetAt,
  };
}
