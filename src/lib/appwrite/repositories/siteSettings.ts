import { ID } from 'node-appwrite';

import { APPWRITE_COLLECTIONS } from '@/lib/appwrite/config';
import type { SiteSettingsDoc } from '@/lib/appwrite/types';
import type { SiteSettingsRow } from '@/lib/db/rows';

import { getRepositoryContext } from './shared';

const C = APPWRITE_COLLECTIONS;
export const SITE_SETTINGS_DOCUMENT_ID = 'default';

export interface SiteSettingsWritePayload {
  address: string;
  announcementCtaHref: string;
  announcementCtaLabel: string;
  announcementEndsAt: string | null;
  announcementIsActive: boolean;
  announcementStartsAt: string | null;
  announcementText: string;
  bestsellersTitle: string;
  catalogTitle: string;
  contactTitle: string;
  discoverTitle: string;
  email: string;
  hoursCloses: string;
  hoursOpenDays: string;
  hoursOpens: string;
  hoursTime: string;
  hoursWeekdays: string;
  instagramHandle: string;
  location: string;
  mapsEmbedUrl: string;
  name: string;
  phone: string;
  razonSocial: string;
  ruc: string;
  website: string;
  whatsappDefault: string;
  whatsappFloat: string;
  whatsappProduct: string;
}

function toSiteSettingsRow(doc: SiteSettingsDoc): SiteSettingsRow {
  return {
    address: doc.address,
    announcement_cta_href: doc.announcement_cta_href,
    announcement_cta_label: doc.announcement_cta_label,
    announcement_ends_at: doc.announcement_ends_at,
    announcement_is_active: doc.announcement_is_active,
    announcement_starts_at: doc.announcement_starts_at,
    announcement_text: doc.announcement_text,
    bestsellers_title: doc.bestsellers_title,
    catalog_title: doc.catalog_title,
    contact_title: doc.contact_title,
    discover_title: doc.discover_title,
    email: doc.email,
    hours_closes: doc.hours_closes,
    hours_open_days: doc.hours_open_days,
    hours_opens: doc.hours_opens,
    hours_time: doc.hours_time,
    hours_weekdays: doc.hours_weekdays,
    id: doc.$id,
    instagram_handle: doc.instagram_handle,
    location: doc.location,
    maps_embed_url: doc.maps_embed_url,
    name: doc.name,
    phone: doc.phone,
    razon_social: doc.razon_social,
    ruc: doc.ruc,
    website: doc.website,
    whatsapp_default: doc.whatsapp_default,
    whatsapp_float: doc.whatsapp_float,
    whatsapp_product: doc.whatsapp_product,
  };
}

function toDocumentData(payload: SiteSettingsWritePayload) {
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

export async function getSiteSettingsDocument(): Promise<SiteSettingsRow | null> {
  const { databases, databaseId } = getRepositoryContext();
  try {
    const doc = await databases.getDocument<SiteSettingsDoc>({
      collectionId: C.siteSettings,
      databaseId,
      documentId: SITE_SETTINGS_DOCUMENT_ID,
    });
    return toSiteSettingsRow(doc);
  } catch {
    return null;
  }
}

export async function upsertSiteSettingsDocument(
  payload: SiteSettingsWritePayload,
): Promise<void> {
  const { databases, databaseId } = getRepositoryContext();
  const data = toDocumentData(payload);
  const existing = await getSiteSettingsDocument();
  if (existing) {
    await databases.updateDocument<SiteSettingsDoc>({
      collectionId: C.siteSettings,
      data,
      databaseId,
      documentId: SITE_SETTINGS_DOCUMENT_ID,
    });
    return;
  }
  await databases.createDocument<SiteSettingsDoc>({
    collectionId: C.siteSettings,
    data,
    databaseId,
    documentId: ID.custom(SITE_SETTINGS_DOCUMENT_ID),
  });
}
