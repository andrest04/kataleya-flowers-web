import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SiteSettingsRecord } from '@/lib/database/repositories/siteSettings';
import { defaultSiteSettings } from '@/lib/siteSettings';

const mocks = vi.hoisted(() => ({
  cache: new Map<string, unknown>(),
  siteSettingsRepository: {
    get: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  unstable_cache: <T>(fn: () => Promise<T>, keyParts: string[] = []) => {
    const key = keyParts.join('|');
    return async (): Promise<T> => {
      if (mocks.cache.has(key)) return mocks.cache.get(key) as T;
      const value = await fn();
      mocks.cache.set(key, value);
      return value;
    };
  },
}));

vi.mock('@/lib/database/repositories/siteSettings', () => ({
  siteSettingsRepository: mocks.siteSettingsRepository,
}));

import { getSiteSettings } from './getSiteSettings';

function settingsRow(overrides: Partial<SiteSettingsRecord> = {}): SiteSettingsRecord {
  return {
    $createdAt: '2026-01-01T00:00:00.000Z',
    $id: 'default',
    $updatedAt: '2026-01-01T00:00:00.000Z',
    address: 'Teodosio Parreño 115, Lima',
    announcement_cta_href: '',
    announcement_cta_label: 'Pedir por WhatsApp',
    announcement_ends_at: null,
    announcement_is_active: true,
    announcement_starts_at: null,
    announcement_text: 'Envíos en el día',
    bestsellers_title: 'Más vendidos',
    catalog_title: 'Catálogo',
    contact_title: 'Contacto',
    discover_title: 'Descubre',
    email: 'hola@example.com',
    hours_closes: '20:00',
    hours_open_days: '1,2,3,4,5,6',
    hours_opens: '08:00',
    hours_time: '8:00 a. m. - 8:00 p. m.',
    hours_weekdays: 'Lunes a sábado',
    instagram_handle: '@kataleya',
    location: 'Lima, Perú',
    maps_embed_url: 'https://www.google.com/maps?q=-12.13%2C-77.02&z=17&output=embed',
    name: 'Kataleya Flowers',
    phone: '51999999999',
    razon_social: 'Kataleya SAC',
    ruc: '20123456789',
    website: 'https://www.kataleyaflowers.com',
    whatsapp_default: 'Hola',
    whatsapp_float: 'Hola',
    whatsapp_product: 'Hola',
    ...overrides,
  } as SiteSettingsRecord;
}

describe('getSiteSettings', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.cache.clear();
    mocks.siteSettingsRepository.get.mockReset();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('serves the defaults when the repository throws, and logs the error', async () => {
    const failure = new Error('appwrite down');
    mocks.siteSettingsRepository.get.mockRejectedValue(failure);

    await expect(getSiteSettings()).resolves.toEqual(defaultSiteSettings());
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), failure);
  });

  it('never caches the defaults served after a repository error', async () => {
    mocks.siteSettingsRepository.get
      .mockRejectedValueOnce(new Error('appwrite down'))
      .mockResolvedValueOnce(settingsRow({ name: 'Kataleya Recovered' }));

    await expect(getSiteSettings()).resolves.toEqual(defaultSiteSettings());
    const recovered = await getSiteSettings();

    expect(mocks.siteSettingsRepository.get).toHaveBeenCalledTimes(2);
    expect(recovered.name).toBe('Kataleya Recovered');
  });

  it('returns the defaults for a missing row without logging', async () => {
    mocks.siteSettingsRepository.get.mockResolvedValue(null);

    await expect(getSiteSettings()).resolves.toEqual(defaultSiteSettings());
    expect(consoleError).not.toHaveBeenCalled();
  });

  it.each([
    ['https://www.kataleyaflowers.com/', 'https://www.kataleyaflowers.com'],
    ['http://WWW.KataleyaFlowers.com/catalogo', 'https://www.kataleyaflowers.com'],
    ['not a url', defaultSiteSettings().website],
    [null, defaultSiteSettings().website],
  ])('reads the stored website %j as %s', async (website, expected) => {
    mocks.siteSettingsRepository.get.mockResolvedValue(settingsRow({ website }));

    const settings = await getSiteSettings();

    expect(settings.website).toBe(expected);
  });
});
