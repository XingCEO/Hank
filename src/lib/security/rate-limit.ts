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

/* ─── 帳號登入失敗鎖定 ─── */
const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_DURATION_MS = 15 * 60 * 1000; // 15 分鐘

declare global {
  var __studioLoginFailures: Map<string, { count: number; lockedUntil?: number }> | undefined;
}

const loginFailures = global.__studioLoginFailures ?? new Map<string, { count: number; lockedUntil?: number }>();
global.__studioLoginFailures = loginFailures;

export function checkAccountLock(email: string): { locked: boolean; lockedUntil?: number } {
  const record = loginFailures.get(email.toLowerCase());
  if (!record) return { locked: false };
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return { locked: true, lockedUntil: record.lockedUntil };
  }
  return { locked: false };
}

export function trackLoginFailure(email: string): { locked: boolean; lockedUntil?: number } {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = loginFailures.get(key) ?? { count: 0 };

  // 若之前的鎖定已解除，重設計數
  if (record.lockedUntil && record.lockedUntil <= now) {
    record.count = 0;
    record.lockedUntil = undefined;
  }

  record.count += 1;

  if (record.count >= LOGIN_MAX_FAILURES) {
    record.lockedUntil = now + LOGIN_LOCK_DURATION_MS;
    loginFailures.set(key, record);
    return { locked: true, lockedUntil: record.lockedUntil };
  }

  loginFailures.set(key, record);
  return { locked: false };
}

export function clearLoginFailures(email: string): void {
  loginFailures.delete(email.toLowerCase());
}
