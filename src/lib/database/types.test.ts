import { describe, expect, it } from 'vitest';

import { chunkIds } from './types';

describe('chunkIds', () => {
  it('returns an empty array when given no ids', () => {
    expect(chunkIds([])).toEqual([]);
  });

  it('returns a single chunk when ids fit within the default size', () => {
    const ids = Array.from({ length: 50 }, (_, index) => `id-${index}`);

    expect(chunkIds(ids)).toEqual([ids]);
  });

  it('splits ids into chunks of the default size (100)', () => {
    const ids = Array.from({ length: 250 }, (_, index) => `id-${index}`);

    const chunks = chunkIds(ids);

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(100);
    expect(chunks[1]).toHaveLength(100);
    expect(chunks[2]).toHaveLength(50);
    expect(chunks.flat()).toEqual(ids);
  });

  it('respects a custom chunk size', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];

    expect(chunkIds(ids, 2)).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
  });

  it('returns one chunk per id when size is 1', () => {
    expect(chunkIds(['a', 'b'], 1)).toEqual([['a'], ['b']]);
  });
});
