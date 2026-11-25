import { describe, expect, it, vi } from 'vitest';

import { createFakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';

import { createDocumentStoreRateLimiter } from './documentStoreRateLimiter';
import { createFailOpenRateLimiter } from './failOpenRateLimiter';
import type { RateLimiter } from './types';

const POLICY = { limit: 3, windowMs: 15 * 60 * 1000 };

describe('failOpenRateLimiter', () => {
  it('rejects the fourth hit from one key when the store works', async () => {
    const onError = vi.fn();
    const limiter = createFailOpenRateLimiter(createDocumentStoreRateLimiter(createFakeDocumentStore()), onError);

    for (let i = 0; i < 3; i += 1) {
      await limiter.hit('complaint-ip', '203.0.113.7', POLICY);
    }

    await expect(limiter.hit('complaint-ip', '203.0.113.7', POLICY)).resolves.toEqual({
      allowed: false,
      count: 4,
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it('allows the hit and reports the error when the store fails', async () => {
    const store = createFakeDocumentStore();
    const failure = new Error('collection not found');
    vi.spyOn(store, 'increment').mockRejectedValue(failure);
    const onError = vi.fn();
    const limiter = createFailOpenRateLimiter(createDocumentStoreRateLimiter(store), onError);

    await expect(limiter.hit('complaint-ip', '203.0.113.7', POLICY)).resolves.toEqual({
      allowed: true,
      count: 0,
    });
    expect(onError).toHaveBeenCalledWith(failure, 'complaint-ip');
  });

  it('wraps any limiter implementation', async () => {
    const inner: RateLimiter = { hit: vi.fn().mockResolvedValue({ allowed: false, count: 9 }) };

    await expect(createFailOpenRateLimiter(inner, vi.fn()).hit('scope', 'key', POLICY)).resolves.toEqual({
      allowed: false,
      count: 9,
    });
  });
});
