import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const METRICS_TTL = 60; // seconds

/**
 * NP-2030: Fixed stale cache showing incorrect metrics.
 * Previous implementation used a 1-hour TTL with no invalidation.
 * Now uses event-driven invalidation: whenever a transaction state changes,
 * the affected merchant's metric keys are deleted from cache.
 * TTL remains as a safety net fallback.
 */
export async function getMerchantMetrics(merchantId: string) {
  const key = `metrics:merchant:${merchantId}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  return null;
}

export async function setMerchantMetrics(merchantId: string, metrics: object) {
  const key = `metrics:merchant:${merchantId}`;
  await redis.set(key, JSON.stringify(metrics), 'EX', METRICS_TTL);
}

export async function invalidateMerchantMetrics(merchantId: string) {
  const key = `metrics:merchant:${merchantId}`;
  await redis.del(key);
}

// Called by the transaction event consumer whenever a tx state changes
export async function onTransactionStateChange(merchantId: string) {
  await invalidateMerchantMetrics(merchantId);
}
