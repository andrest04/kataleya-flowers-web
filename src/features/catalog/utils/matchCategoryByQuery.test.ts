import { describe, expect, it } from 'vitest';

import type { Category } from '@/features/catalog/types';

import { matchCategoryByQuery } from './matchCategoryByQuery';

const categories = [
  { id: '1', name: 'Rosas', slug: 'rosas' },
  { id: '2', name: 'Girasoles', slug: 'girasoles' },
  { id: '3', name: 'Cumpleaños', slug: 'cumpleanos' },
] as Category[];

describe('matchCategoryByQuery', () => {
  it('matches singular and plural forms', () => {
    expect(matchCategoryByQuery(categories, 'rosa')?.slug).toBe('rosas');
    expect(matchCategoryByQuery(categories, 'Rosas')?.slug).toBe('rosas');
  });

  it('ignores accents', () => {
    expect(matchCategoryByQuery(categories, 'cumpleanos')?.slug).toBe('cumpleanos');
    expect(matchCategoryByQuery(categories, 'CUMPLEAÑOS')?.slug).toBe('cumpleanos');
  });

  it('returns null when nothing matches or the query is too short', () => {
    expect(matchCategoryByQuery(categories, 'zzzz')).toBeNull();
    expect(matchCategoryByQuery(categories, 'ro')).toBeNull();
    expect(matchCategoryByQuery(categories, '')).toBeNull();
  });
});
