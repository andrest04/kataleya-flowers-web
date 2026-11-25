import { describe, expect, it } from 'vitest';

import { normalizeSiteOrigin } from './siteOrigin';

describe('normalizeSiteOrigin', () => {
  it.each([
    ['https://www.kataleyaflowers.com', 'https://www.kataleyaflowers.com'],
    ['https://www.kataleyaflowers.com/', 'https://www.kataleyaflowers.com'],
    ['  https://www.kataleyaflowers.com/  ', 'https://www.kataleyaflowers.com'],
    ['http://www.kataleyaflowers.com', 'https://www.kataleyaflowers.com'],
    ['https://WWW.KataleyaFlowers.com', 'https://www.kataleyaflowers.com'],
    ['https://www.kataleyaflowers.com/catalogo?ref=ig#top', 'https://www.kataleyaflowers.com'],
    ['http://user:pass@www.kataleyaflowers.com/a/b', 'https://www.kataleyaflowers.com'],
  ])('normalizes %s to %s', (value, expected) => {
    expect(normalizeSiteOrigin(value)).toBe(expected);
  });

  it.each([
    [''],
    ['   '],
    ['not a url'],
    ['www.kataleyaflowers.com'],
    ['javascript:alert(1)'],
    ['ftp://www.kataleyaflowers.com'],
    ['mailto:hola@kataleyaflowers.com'],
  ])('returns null for %j', (value) => {
    expect(normalizeSiteOrigin(value)).toBeNull();
  });

  it('returns null for missing values', () => {
    expect(normalizeSiteOrigin(null)).toBeNull();
    expect(normalizeSiteOrigin(undefined)).toBeNull();
  });
});
