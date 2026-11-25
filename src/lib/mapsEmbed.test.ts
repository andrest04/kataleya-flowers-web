import { describe, expect, it } from 'vitest';

import { BUSINESS } from './constants';
import { isAllowedMapsHost, toMapsEmbedUrl } from './mapsEmbed';

describe('isAllowedMapsHost', () => {
  it.each([
    ['google.com'],
    ['www.google.com'],
    ['maps.google.com'],
    ['www.google.com.pe'],
    ['maps.app.goo.gl'],
    ['goo.gl'],
    ['WWW.Google.com'],
  ])('allows %s', (host) => {
    expect(isAllowedMapsHost(host)).toBe(true);
  });

  it.each([
    ['evil.google.com'],
    ['sites.google.com'],
    ['google.com.evil'],
    ['google.co.uk'],
    ['maps.google.com.mx'],
    ['www.google.com.pe.evil.com'],
    ['google.com.'],
    ['notgoogle.com'],
  ])('rejects %s', (host) => {
    expect(isAllowedMapsHost(host)).toBe(false);
  });
});

describe('toMapsEmbedUrl', () => {
  it('keeps accepting the current business embed URL', () => {
    expect(toMapsEmbedUrl(BUSINESS.mapsEmbedUrl)).toBe(BUSINESS.mapsEmbedUrl);
  });

  it('rejects embeds on hosts outside the allowlist', () => {
    expect(toMapsEmbedUrl('https://evil.google.com/maps/embed?pb=x')).toBeNull();
    expect(toMapsEmbedUrl('https://evil.com/maps/embed?pb=x')).toBeNull();
  });
});
