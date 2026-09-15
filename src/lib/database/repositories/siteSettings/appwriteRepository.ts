import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';

import type { DocumentStore } from '../../types';
import type { SiteSettingsRecord, SiteSettingsRepository, SiteSettingsWritePayload } from './types';

const SITE_SETTINGS_COLLECTION_ID = APPWRITE_COLLECTIONS.siteSettings;
const SITE_SETTINGS_DOCUMENT_ID = 'default';

function toDocumentData(payload: SiteSettingsWritePayload): Record<string, unknown> {
  return {
    address: payload.address,
    announcement_cta_href: payload.announcementCtaHref,
    announcement_cta_label: payload.announcementCtaLabel,
    announcement_ends_at: payload.announcementEndsAt,
    announcement_is_active: payload.announcementIsActive,
    announcement_starts_at: payload.announcementStartsAt,
    announcement_text: payload.announcementText,
    bestsellers_title: payload.bestsellersTitle,
    catalog_title: payload.catalogTitle,
    contact_title: payload.contactTitle,
    discover_title: payload.discoverTitle,
    email: payload.email,
    hours_closes: payload.hoursCloses,
    hours_open_days: payload.hoursOpenDays,
    hours_opens: payload.hoursOpens,
    hours_time: payload.hoursTime,
    hours_weekdays: payload.hoursWeekdays,
    instagram_handle: payload.instagramHandle,
    location: payload.location,
    maps_embed_url: payload.mapsEmbedUrl,
    name: payload.name,
    phone: payload.phone,
    razon_social: payload.razonSocial,
    ruc: payload.ruc,
    website: payload.website,
    whatsapp_default: payload.whatsappDefault,
    whatsapp_float: payload.whatsappFloat,
    whatsapp_product: payload.whatsappProduct,
  };
}

export function createSiteSettingsRepository(store: DocumentStore): SiteSettingsRepository {
  return {
    async get(): Promise<SiteSettingsRecord | null> {
      return store.getById<SiteSettingsRecord>(SITE_SETTINGS_COLLECTION_ID, SITE_SETTINGS_DOCUMENT_ID);
    },

    async upsert(payload: SiteSettingsWritePayload): Promise<void> {
      const data = toDocumentData(payload);
      const existing = await store.getById<SiteSettingsRecord>(
        SITE_SETTINGS_COLLECTION_ID,
        SITE_SETTINGS_DOCUMENT_ID,
      );

      if (existing) {
        await store.update(SITE_SETTINGS_COLLECTION_ID, SITE_SETTINGS_DOCUMENT_ID, data);
        return;
      }

      await store.create(SITE_SETTINGS_COLLECTION_ID, SITE_SETTINGS_DOCUMENT_ID, data);
    },
  };
}
