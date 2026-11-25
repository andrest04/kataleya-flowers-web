import { createHash } from 'node:crypto';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/ids';
import type { DocumentStore } from '@/lib/database/types';

import type { RateLimitDecision, RateLimiter, RateLimitPolicy } from './types';

const COLLECTION_ID = APPWRITE_COLLECTIONS.rateLimits;
const COUNT_ATTRIBUTE = 'count';
const EXPIRES_AT_FIELD = 'expires_at';
const EXPIRED_SWEEP_LIMIT = 100;
const DOCUMENT_ID_LENGTH = 36;

function windowDocumentId(scope: string, key: string, windowStart: number): string {
  return createHash('sha256')
    .update(`${scope}:${key}:${windowStart}`)
    .digest('hex')
    .slice(0, DOCUMENT_ID_LENGTH);
}

export function createDocumentStoreRateLimiter(
  store: DocumentStore,
  now: () => number = Date.now,
): RateLimiter {
  async function deleteExpiredWindows(nowMs: number): Promise<void> {
    try {
      await store.deleteExpired(
        COLLECTION_ID,
        EXPIRES_AT_FIELD,
        new Date(nowMs).toISOString(),
        EXPIRED_SWEEP_LIMIT,
      );
    } catch (error) {
      console.error('[rateLimit] failed to delete expired windows', error);
    }
  }

  return {
    async hit(scope: string, key: string, { limit, windowMs }: RateLimitPolicy): Promise<RateLimitDecision> {
      const nowMs = now();
      const windowStart = nowMs - (nowMs % windowMs);
      const count = await store.increment(
        COLLECTION_ID,
        windowDocumentId(scope, key, windowStart),
        COUNT_ATTRIBUTE,
        1,
        { [EXPIRES_AT_FIELD]: new Date(windowStart + windowMs).toISOString() },
      );

      if (count === 1) {
        await deleteExpiredWindows(nowMs);
      }

      return { allowed: count <= limit, count };
    },
  };
}
