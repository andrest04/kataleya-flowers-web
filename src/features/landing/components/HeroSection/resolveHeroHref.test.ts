import { describe, expect, it } from 'vitest';

import { defaultSiteSettings } from '@/lib/siteSettings';

import { resolveHeroHref } from './resolveHeroHref';

describe('resolveHeroHref', () => {
  const settings = defaultSiteSettings();

  it('adds the default message when the href is the bare WhatsApp link', () => {
    const href = resolveHeroHref(settings.whatsapp, settings);
    const url = new URL(href);
    expect(url.pathname).toBe(`/${settings.phone}`);
    expect(url.searchParams.get('text')).toBe(settings.messages.whatsappDefault);
  });

  it('keeps catalog and custom hrefs untouched', () => {
    expect(resolveHeroHref('/catalogo', settings)).toBe('/catalogo');
    expect(resolveHeroHref('https://example.com/promo', settings)).toBe('https://example.com/promo');
  });

  it('keeps a WhatsApp href that already carries a message', () => {
    const custom = `${settings.whatsapp}?text=Hola`;
    expect(resolveHeroHref(custom, settings)).toBe(custom);
  });
});
