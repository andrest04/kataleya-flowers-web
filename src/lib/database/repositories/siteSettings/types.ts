import type { DocumentRecord } from '../../types';

export interface SiteSettingsRecord extends DocumentRecord {
  address: string;
  announcement_cta_href: string;
  announcement_cta_label: string;
  announcement_ends_at: string | null;
  announcement_is_active: boolean;
  announcement_starts_at: string | null;
  announcement_text: string;
  bestsellers_title: string;
  catalog_title: string;
  contact_title: string;
  discover_title: string;
  email: string;
  hours_closes: string;
  hours_open_days: string;
  hours_opens: string;
  hours_time: string;
  hours_weekdays: string;
  instagram_handle: string;
  location: string;
  maps_embed_url: string;
  name: string | null;
  phone: string;
  razon_social: string;
  ruc: string;
  website: string | null;
  whatsapp_default: string;
  whatsapp_float: string;
  whatsapp_product: string;
}

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

export interface SiteSettingsRepository {
  get(): Promise<SiteSettingsRecord | null>;
  upsert(payload: SiteSettingsWritePayload): Promise<void>;
}
