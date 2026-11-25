import { describe, expect, it } from 'vitest';

import { isExternalHttpsHref, isSafeSiteHref } from './safeHref';

describe('isSafeSiteHref', () => {
  it.each([
    ['/catalogo'],
    ['/catalogo/amor-y-romance?orden=precio#top'],
    ['/'],
    ['#contacto'],
    ['https://www.kataleyaflowers.com/catalogo'],
    ['https://example.com/promo'],
  ])('accepts %s', (href) => {
    expect(isSafeSiteHref(href)).toBe(true);
  });

  it.each([
    ['javascript:alert(1)'],
    ['JavaScript:alert(1)'],
    [' javascript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['vbscript:msgbox(1)'],
    ['//evil.com'],
    ['/\\evil.com/x'],
    ['\\\\evil.com'],
    ['/cata\tlogo'],
    ['/cata\nlogo'],
    ['/x\u0000'],
    ['http://example.com'],
    ['https://user:pass@example.com'],
    ['https://'],
    ['#'],
    ['catalogo'],
    ['mailto:hola@example.com'],
    [''],
  ])('rejects %j', (href) => {
    expect(isSafeSiteHref(href)).toBe(false);
  });
});

describe('isExternalHttpsHref', () => {
  it('is true only for absolute https URLs', () => {
    expect(isExternalHttpsHref('https://example.com/promo')).toBe(true);
    expect(isExternalHttpsHref('/catalogo')).toBe(false);
    expect(isExternalHttpsHref('#contacto')).toBe(false);
    expect(isExternalHttpsHref('http://example.com')).toBe(false);
    expect(isExternalHttpsHref('httpfoo')).toBe(false);
    expect(isExternalHttpsHref('javascript:alert(1)')).toBe(false);
  });
});
