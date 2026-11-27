import { describe, expect, it } from 'vitest';

import { getCardMeta } from './cardMeta';

describe('getCardMeta', () => {
  it('joins up to two flower types', () => {
    expect(getCardMeta({ flowerTypes: ['Rosas', 'Lirios', 'Girasoles'] })).toBe('Rosas · Lirios');
  });

  it('falls back to colors when there are no flower types', () => {
    expect(getCardMeta({ flowerTypes: [], colors: ['Rojo'] })).toBe('Rojo');
  });

  it('falls back to the featured flag', () => {
    expect(getCardMeta({ isFeatured: true })).toBe('Destacado');
  });

  it('returns null when no data exists', () => {
    expect(getCardMeta({})).toBeNull();
  });
});
