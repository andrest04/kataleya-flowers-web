import { unstable_cache } from 'next/cache';

import { getSiteSettingsDocument } from '@/lib/appwrite/repositories/siteSettings';
import type { SiteSettingsRow } from '@/lib/db/rows';
import {
  defaultSiteSettings,
  derivedContact,
  parseOpenDays,
  type SiteSettings,
} from '@/lib/siteSettings';

function fromRow(row: SiteSettingsRow): SiteSettings {
  const defaults = defaultSiteSettings();
  const phone = row.phone || defaults.phone;
  const contact = derivedContact(phone, row.instagram_handle || defaults.instagramHandle);
  return {
    address: row.address || defaults.address,
    announcement: {
      ctaHref: row.announcement_cta_href || defaults.announcement.ctaHref,
      ctaLabel: row.announcement_cta_label || defaults.announcement.ctaLabel,
      endsAt: row.announcement_ends_at,
      isActive: row.announcement_is_active,
      startsAt: row.announcement_starts_at,
      text: row.announcement_text || defaults.announcement.text,
    },
    email: row.email || defaults.email,
    experience: defaults.experience,
    hasDocument: true,
    hours: {
      closes: row.hours_closes || defaults.hours.closes,
      openDays: parseOpenDays(row.hours_open_days),
      opens: row.hours_opens || defaults.hours.opens,
      time: row.hours_time || defaults.hours.time,
      weekdays: row.hours_weekdays || defaults.hours.weekdays,
    },
    instagram: contact.instagram,
    instagramHandle: contact.instagramHandle,
    location: row.location || defaults.location,
    mapsEmbedUrl: row.maps_embed_url || defaults.mapsEmbedUrl,
    messages: {
      whatsappDefault: row.whatsapp_default || defaults.messages.whatsappDefault,
      whatsappFloat: row.whatsapp_float || defaults.messages.whatsappFloat,
      whatsappProduct: row.whatsapp_product || defaults.messages.whatsappProduct,
    },
    monthlyOrders: defaults.monthlyOrders,
    name: defaults.name,
    phone,
    razonSocial: row.razon_social || defaults.razonSocial,
    ruc: row.ruc || defaults.ruc,
    titles: {
      bestsellers: row.bestsellers_title || defaults.titles.bestsellers,
      catalog: row.catalog_title || defaults.titles.catalog,
      contact: row.contact_title || defaults.titles.contact,
      discover: row.discover_title || defaults.titles.discover,
    },
    website: defaults.website,
    whatsapp: contact.whatsapp,
  };
}

const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const row = await getSiteSettingsDocument();
      if (!row) return defaultSiteSettings();
      return fromRow(row);
    } catch {
      return defaultSiteSettings();
    }
  },
  ['site-settings'],
  { revalidate: 300, tags: ['site-settings'] },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  return getCachedSiteSettings();
}
