import { describe, expect, it } from 'vitest';

import { defaultSiteSettings } from '@/lib/siteSettings';

import { bindValuePropIdentity } from './valuePropIdentity';

function item(href: string) {
  return {
    description: 'Envíos a {ubicacion}',
    href,
    isAnchor: false,
    isExternal: false,
    title: 'Envíos',
  };
}

describe('bindValuePropIdentity href', () => {
  it('interpolates settings into a safe site path', () => {
    const settings = { ...defaultSiteSettings(), location: 'Miraflores' };
    expect(bindValuePropIdentity(item('/catalogo?zona={ubicacion}'), settings).href).toBe(
      '/catalogo?zona=Miraflores',
    );
  });

  it('keeps the stored href when interpolation would make it protocol-relative', () => {
    const settings = { ...defaultSiteSettings(), location: '/evil.com' };
    expect(bindValuePropIdentity(item('/{ubicacion}'), settings).href).toBe('/{ubicacion}');
  });

  it('keeps the stored href when interpolation would add a backslash', () => {
    const settings = { ...defaultSiteSettings(), location: '\\evil.com' };
    expect(bindValuePropIdentity(item('/{ubicacion}'), settings).href).toBe('/{ubicacion}');
  });
});
