import { describe, expect, it } from 'vitest';

import { buildRecoveryUrl } from './recoveryUrl';

const FALLBACK = 'https://www.kataleyaflowers.com/restablecer-contrasena';

describe('buildRecoveryUrl', () => {
  it('uses the origin of a valid https SITE_URL', () => {
    expect(buildRecoveryUrl('https://preview.example.com/some/path?x=1')).toBe(
      'https://preview.example.com/restablecer-contrasena',
    );
  });

  it('accepts an http origin with a port for local development', () => {
    expect(buildRecoveryUrl('http://localhost:3000')).toBe(
      'http://localhost:3000/restablecer-contrasena',
    );
  });

  it('ignores surrounding whitespace', () => {
    expect(buildRecoveryUrl('  https://example.com  ')).toBe(
      'https://example.com/restablecer-contrasena',
    );
  });

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['not a url', 'kataleyaflowers.com'],
    ['a non-http protocol', 'javascript:alert(1)'],
    ['an ftp url', 'ftp://example.com'],
  ])('falls back to the business website when SITE_URL is %s', (_label, value) => {
    expect(buildRecoveryUrl(value)).toBe(FALLBACK);
  });

  it('reads process.env.SITE_URL by default', () => {
    const previous = process.env.SITE_URL;
    process.env.SITE_URL = 'https://env.example.com';
    try {
      expect(buildRecoveryUrl()).toBe('https://env.example.com/restablecer-contrasena');
    } finally {
      if (previous === undefined) delete process.env.SITE_URL;
      else process.env.SITE_URL = previous;
    }
  });
});
