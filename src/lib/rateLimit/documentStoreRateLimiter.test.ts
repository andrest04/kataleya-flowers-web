import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeDocumentStore, type FakeDocumentStore } from '@/lib/database/testUtils/fakeDocumentStore';
import type { DocumentRecord } from '@/lib/database/types';

import { createDocumentStoreRateLimiter } from './documentStoreRateLimiter';

const RATE_LIMITS = 'rate_limits';
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const POLICY = { limit: 3, windowMs: FIFTEEN_MINUTES_MS };
const T0 = Date.parse('2026-01-01T00:00:00.000Z');

interface WindowRecord extends DocumentRecord {
  count: number;
  expires_at: string;
}

describe('documentStoreRateLimiter', () => {
  let store: FakeDocumentStore;
  let nowMs: number;
  const clock = () => nowMs;

  beforeEach(() => {
    store = createFakeDocumentStore();
    nowMs = T0 + 1000;
  });

  it('allows a key three times in one window and denies the fourth', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);

    const decisions = [];
    for (let i = 0; i < 4; i += 1) {
      decisions.push(await limiter.hit('complaint-ip', '203.0.113.7', POLICY));
    }

    expect(decisions).toEqual([
      { allowed: true, count: 1 },
      { allowed: true, count: 2 },
      { allowed: true, count: 3 },
      { allowed: false, count: 4 },
    ]);
  });

  it('counts each scope and key independently', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);

    for (let i = 0; i < 3; i += 1) {
      await limiter.hit('complaint-ip', '203.0.113.7', POLICY);
    }

    await expect(limiter.hit('complaint-ip', '198.51.100.1', POLICY)).resolves.toEqual({
      allowed: true,
      count: 1,
    });
    await expect(limiter.hit('complaint-recipient', '203.0.113.7', POLICY)).resolves.toEqual({
      allowed: true,
      count: 1,
    });
  });

  it('resets the count when a new window opens', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);

    for (let i = 0; i < 4; i += 1) {
      await limiter.hit('complaint-ip', '203.0.113.7', POLICY);
    }

    nowMs += FIFTEEN_MINUTES_MS;

    await expect(limiter.hit('complaint-ip', '203.0.113.7', POLICY)).resolves.toEqual({
      allowed: true,
      count: 1,
    });
  });

  it('shares the count across limiter instances backed by the same store', async () => {
    const first = createDocumentStoreRateLimiter(store, clock);
    const second = createDocumentStoreRateLimiter(store, clock);

    await first.hit('complaint-ip', '203.0.113.7', POLICY);
    await second.hit('complaint-ip', '203.0.113.7', POLICY);
    await first.hit('complaint-ip', '203.0.113.7', POLICY);

    await expect(second.hit('complaint-ip', '203.0.113.7', POLICY)).resolves.toEqual({
      allowed: false,
      count: 4,
    });
  });

  it('stores one private window document that expires at the end of the window', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);

    await limiter.hit('complaint-ip', '203.0.113.7', POLICY);
    await limiter.hit('complaint-ip', '203.0.113.7', POLICY);

    const docs = await store.listAll<WindowRecord>(RATE_LIMITS);
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toMatch(/^[0-9a-f]{36}$/);
    expect(docs[0]).toMatchObject({ count: 2, expires_at: new Date(T0 + FIFTEEN_MINUTES_MS).toISOString() });
    expect(store.permissionsOf(RATE_LIMITS, docs[0].id)).toEqual([]);
  });

  it('does not store the raw key in the document id', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);

    await limiter.hit('complaint-recipient', 'ana@example.com', POLICY);

    const [doc] = await store.listAll(RATE_LIMITS);
    expect(doc.id).not.toContain('ana');
  });

  it('deletes expired window documents when a new window opens so the store stays bounded', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);
    const keys = ['203.0.113.1', '203.0.113.2', '203.0.113.3'];
    const sizes: number[] = [];

    for (let window = 0; window < 10; window += 1) {
      nowMs = T0 + window * FIFTEEN_MINUTES_MS + 1000;
      for (const key of keys) {
        await limiter.hit('complaint-ip', key, POLICY);
      }
      sizes.push((await store.listAll(RATE_LIMITS)).length);
    }

    expect(Math.max(...sizes)).toBeLessThanOrEqual(keys.length * 2);
    expect(sizes[sizes.length - 1]).toBe(keys.length);
  });

  it('sweeps expired documents only when a hit opens a new window document', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);
    const deleteExpired = vi.spyOn(store, 'deleteExpired');

    await limiter.hit('complaint-ip', '203.0.113.7', POLICY);
    await limiter.hit('complaint-ip', '203.0.113.7', POLICY);

    expect(deleteExpired).toHaveBeenCalledTimes(1);
    expect(deleteExpired).toHaveBeenCalledWith(RATE_LIMITS, 'expires_at', new Date(nowMs).toISOString(), 100);
  });

  it('keeps the decision and logs when the expired sweep fails', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);
    vi.spyOn(store, 'deleteExpired').mockRejectedValueOnce(new Error('sweep failed'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(limiter.hit('complaint-ip', '203.0.113.7', POLICY)).resolves.toEqual({
      allowed: true,
      count: 1,
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('propagates increment failures to the caller', async () => {
    const limiter = createDocumentStoreRateLimiter(store, clock);
    vi.spyOn(store, 'increment').mockRejectedValueOnce(new Error('store down'));

    await expect(limiter.hit('complaint-ip', '203.0.113.7', POLICY)).rejects.toThrow('store down');
  });
});
