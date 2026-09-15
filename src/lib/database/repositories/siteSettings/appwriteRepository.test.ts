import { beforeEach, describe, expect, it } from 'vitest';

import { createFakeDocumentStore, type FakeDocumentStore } from '../../testUtils/fakeDocumentStore';
import { createSiteSettingsRepository } from './appwriteRepository';
import type { SiteSettingsRecord, SiteSettingsRepository, SiteSettingsWritePayload } from './types';

function writePayload(overrides: Partial<SiteSettingsWritePayload> = {}): SiteSettingsWritePayload {
  return {
    address: 'Av. Siempre Viva 123',
    announcementCtaHref: 'whatsapp',
    announcementCtaLabel: 'Pedir por WhatsApp',
    announcementEndsAt: null,
    announcementIsActive: true,
    announcementStartsAt: null,
    announcementText: 'Flores frescas',
    bestsellersTitle: 'Más vendidos',
    catalogTitle: 'Catálogo',
    contactTitle: 'Visítanos',
    discoverTitle: 'Descubre',
    email: 'hola@kataleyaflowers.com',
    hoursCloses: '20:00',
    hoursOpenDays: '1,2,3,4,5,6',
    hoursOpens: '09:00',
    hoursTime: '9am - 8pm',
    hoursWeekdays: 'Lun a Sáb',
    instagramHandle: '@kataleya',
    location: 'Barranco, Lima',
    mapsEmbedUrl: 'https://maps.google.com/embed',
    name: 'Kataleya',
    phone: '+51999999999',
    razonSocial: 'Kataleya SAC',
    ruc: '20123456789',
    website: 'https://kataleyaflowers.com',
    whatsappDefault: 'Hola, quiero hacer un pedido',
    whatsappFloat: 'Hola',
    whatsappProduct: 'Hola, me interesa el producto: {nombre}',
    ...overrides,
  };
}

describe('createSiteSettingsRepository', () => {
  let store: FakeDocumentStore;
  let repository: SiteSettingsRepository;

  beforeEach(() => {
    store = createFakeDocumentStore();
    repository = createSiteSettingsRepository(store);
  });

  describe('get', () => {
    it('returns null when no document exists yet', async () => {
      await expect(repository.get()).resolves.toBeNull();
    });

    it('returns the singleton document mapped onto the domain record', async () => {
      await repository.upsert(writePayload({ name: 'Kataleya Flowers' }));

      const result = await repository.get();

      expect(result).toMatchObject({ id: 'default', name: 'Kataleya Flowers' });
    });
  });

  describe('upsert', () => {
    it('creates the singleton document on first upsert', async () => {
      await repository.upsert(writePayload());

      const created = await store.getById('site_settings', 'default');
      expect(created).toMatchObject({ address: 'Av. Siempre Viva 123', announcement_cta_href: 'whatsapp' });
    });

    it('updates the same singleton document on a later upsert', async () => {
      await repository.upsert(writePayload({ name: 'First' }));
      await repository.upsert(writePayload({ name: 'Second' }));

      const all = await store.listAll('site_settings');
      expect(all).toHaveLength(1);
      expect(all[0]).toMatchObject({ id: 'default', name: 'Second' });
    });

    it('translates every camelCase field to its Appwrite snake_case attribute', async () => {
      await repository.upsert(writePayload());

      const document = await store.getById<SiteSettingsRecord>('site_settings', 'default');
      expect(document).toMatchObject({
        announcement_cta_href: 'whatsapp',
        announcement_cta_label: 'Pedir por WhatsApp',
        announcement_ends_at: null,
        announcement_is_active: true,
        announcement_starts_at: null,
        announcement_text: 'Flores frescas',
        bestsellers_title: 'Más vendidos',
        catalog_title: 'Catálogo',
        contact_title: 'Visítanos',
        discover_title: 'Descubre',
        hours_closes: '20:00',
        hours_open_days: '1,2,3,4,5,6',
        hours_opens: '09:00',
        hours_time: '9am - 8pm',
        hours_weekdays: 'Lun a Sáb',
        instagram_handle: '@kataleya',
        maps_embed_url: 'https://maps.google.com/embed',
        razon_social: 'Kataleya SAC',
        whatsapp_default: 'Hola, quiero hacer un pedido',
        whatsapp_float: 'Hola',
        whatsapp_product: 'Hola, me interesa el producto: {nombre}',
      });
    });
  });
});
