import { isDerivedWhatsappCta, type SiteSettings } from '@/lib/siteSettings';

import type { SiteSettingsDraft } from './types';

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function draftFromSettings(settings: SiteSettings): SiteSettingsDraft {
  return {
    address: settings.address,
    announcementCtaHref: isDerivedWhatsappCta(settings.announcement.ctaHref)
      ? ''
      : settings.announcement.ctaHref,
    announcementCtaLabel: settings.announcement.ctaLabel,
    announcementEndsAt: toDatetimeLocalValue(settings.announcement.endsAt),
    announcementIsActive: settings.announcement.isActive,
    announcementStartsAt: toDatetimeLocalValue(settings.announcement.startsAt),
    announcementText: settings.announcement.text,
    bestsellersTitle: settings.titles.bestsellers,
    catalogTitle: settings.titles.catalog,
    contactTitle: settings.titles.contact,
    discoverTitle: settings.titles.discover,
    email: settings.email,
    hoursCloses: settings.hours.closes,
    hoursOpens: settings.hours.opens,
    hoursTime: settings.hours.time,
    hoursWeekdays: settings.hours.weekdays,
    instagramHandle: settings.instagramHandle,
    location: settings.location,
    mapsEmbedUrl: settings.mapsEmbedUrl,
    mapsLink: '',
    openDays: [...settings.hours.openDays],
    phone: settings.phone,
    razonSocial: settings.razonSocial,
    ruc: settings.ruc,
    whatsappDefault: settings.messages.whatsappDefault,
    whatsappFloat: settings.messages.whatsappFloat,
    whatsappProduct: settings.messages.whatsappProduct,
  };
}
