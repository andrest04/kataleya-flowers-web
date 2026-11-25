import { describe, expect, it } from 'vitest';

import { BUSINESS } from '@/lib/constants';

import { siteSettingsSchema } from './siteSettings';

function settings(overrides: Record<string, unknown> = {}) {
  return {
    address: 'Teodosio Parreño 115, Lima',
    announcementCtaHref: '',
    announcementCtaLabel: 'Pedir por WhatsApp',
    announcementIsActive: true,
    announcementText: 'Envíos en el día',
    bestsellersTitle: 'Más vendidos',
    catalogTitle: 'Catálogo',
    contactTitle: 'Contacto',
    discoverTitle: 'Descubre',
    email: 'hola@example.com',
    hoursCloses: '20:00',
    hoursOpens: '08:00',
    hoursTime: '8:00 a. m. - 8:00 p. m.',
    hoursWeekdays: 'Lunes a sábado',
    instagramHandle: '@kataleya',
    location: 'Lima, Perú',
    mapsEmbedUrl: BUSINESS.mapsEmbedUrl,
    mapsLink: '',
    name: 'Kataleya Flowers',
    openDays: [1, 2, 3, 4, 5, 6],
    phone: '51999999999',
    razonSocial: 'Kataleya SAC',
    ruc: '20123456789',
    website: 'https://www.kataleyaflowers.com',
    whatsappDefault: 'Hola',
    whatsappFloat: 'Hola',
    whatsappProduct: 'Hola',
    ...overrides,
  };
}

function issuesAt(field: string, overrides: Record<string, unknown>) {
  const result = siteSettingsSchema.safeParse(settings(overrides));
  if (result.success) return [];
  return result.error.issues.filter((issue) => issue.path[0] === field);
}

describe('siteSettingsSchema mapsEmbedUrl', () => {
  it('keeps the current Google embed URL', () => {
    const result = siteSettingsSchema.safeParse(settings());
    expect(result.success).toBe(true);
    expect(result.data?.mapsEmbedUrl).toBe(BUSINESS.mapsEmbedUrl);
  });

  it('transforms a Google Maps URL into its embed form', () => {
    const result = siteSettingsSchema.safeParse(
      settings({ mapsEmbedUrl: 'https://www.google.com/maps/place/Floreria/@-12.13,-77.02,17z' }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.mapsEmbedUrl).toBe('https://www.google.com/maps?q=-12.13%2C-77.02&z=17&output=embed');
  });

  it.each([
    ['https://evil.com/maps/embed?pb=x'],
    ['https://evil.google.com/maps/embed?pb=x'],
    ['javascript:alert(1)'],
    ['https://maps.app.goo.gl/abc123'],
  ])('rejects the non-Google embed %s', (mapsEmbedUrl) => {
    expect(issuesAt('mapsEmbedUrl', { mapsEmbedUrl })).toHaveLength(1);
  });

  it('lets a pasted Maps link replace an embed URL that is no longer accepted', () => {
    const result = siteSettingsSchema.safeParse(
      settings({
        mapsEmbedUrl: 'https://www.google.co.uk/maps/embed?pb=x',
        mapsLink: 'https://maps.app.goo.gl/abc123',
      }),
    );
    expect(result.success).toBe(true);
  });
});

describe('siteSettingsSchema announcementCtaHref', () => {
  it.each([['/catalogo'], ['#contacto'], ['https://www.kataleyaflowers.com'], ['']])(
    'accepts %j',
    (announcementCtaHref) => {
      expect(issuesAt('announcementCtaHref', { announcementCtaHref })).toEqual([]);
    },
  );

  it.each([['javascript:alert(1)'], ['data:text/html,x'], ['vbscript:x'], ['//evil.com'], ['/\\evil.com']])(
    'rejects %s',
    (announcementCtaHref) => {
      expect(issuesAt('announcementCtaHref', { announcementCtaHref })).toHaveLength(1);
    },
  );
});
