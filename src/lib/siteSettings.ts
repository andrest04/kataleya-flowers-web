import { BUSINESS } from '@/lib/constants';
import { instagramUrl, whatsappUrl, whatsappWithMessage } from '@/lib/contactLinks';
import { isPublished } from '@/lib/publishing';

export interface SiteHours {
  closes: string;
  openDays: number[];
  opens: string;
  time: string;
  weekdays: string;
}

export interface SiteAnnouncement {
  ctaHref: string;
  ctaLabel: string;
  endsAt: string | null;
  isActive: boolean;
  startsAt: string | null;
  text: string;
}

export interface SiteTitles {
  bestsellers: string;
  catalog: string;
  contact: string;
  discover: string;
}

export interface SiteMessages {
  whatsappDefault: string;
  whatsappFloat: string;
  whatsappProduct: string;
}

export interface SiteSettings {
  address: string;
  announcement: SiteAnnouncement;
  email: string;
  experience: string;
  hasDocument: boolean;
  hours: SiteHours;
  instagram: string;
  instagramHandle: string;
  location: string;
  mapsEmbedUrl: string;
  messages: SiteMessages;
  monthlyOrders: string;
  name: string;
  phone: string;
  razonSocial: string;
  ruc: string;
  titles: SiteTitles;
  website: string;
  whatsapp: string;
}

export const FALLBACK_TITLES: SiteTitles = {
  bestsellers: 'Más vendidos',
  catalog: 'Flores y regalos para cada ocasión',
  contact: 'Visítanos',
  discover: 'Descubre Kataleya',
};

export const PRODUCT_WHATSAPP_TEMPLATE = 'Hola, me interesa el producto: {nombre}';

export const ANNOUNCEMENT_WHATSAPP_CTA = 'whatsapp';

export type VisibleAnnouncement =
  | { kind: 'fallback' }
  | { kind: 'cms'; ctaHref: string; ctaLabel: string; text: string };

function isWhatsappHost(hostname: string): boolean {
  return (
    hostname === 'wa.me'
    || hostname.endsWith('.wa.me')
    || hostname === 'whatsapp.com'
    || hostname.endsWith('.whatsapp.com')
  );
}

export function isDerivedWhatsappCta(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return true;
  if (trimmed.toLowerCase() === ANNOUNCEMENT_WHATSAPP_CTA) return true;

  let hostname: string;
  try {
    hostname = new URL(trimmed).hostname;
  } catch {
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) return false;
    try {
      hostname = new URL(`https://${trimmed}`).hostname;
    } catch {
      return false;
    }
  }
  return isWhatsappHost(hostname.toLowerCase());
}

export function resolveAnnouncementCtaHref(
  href: string,
  phone: string,
  message: string,
): string {
  if (isDerivedWhatsappCta(href)) {
    return whatsappWithMessage(phone, message);
  }
  return href.trim();
}

export function normalizeInstagramHandle(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) return BUSINESS.instagramHandle;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function parseOpenDays(value: string): number[] {
  const days = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  return days.length > 0 ? days : [...BUSINESS.hours.openDays];
}

export function serializeOpenDays(days: number[]): string {
  return [...new Set(days)].sort((a, b) => a - b).join(',');
}

export function defaultSiteSettings(): SiteSettings {
  const phone = BUSINESS.phone;
  const handle = BUSINESS.instagramHandle;
  return {
    address: BUSINESS.address,
    announcement: {
      ctaHref: ANNOUNCEMENT_WHATSAPP_CTA,
      ctaLabel: 'Pedir por WhatsApp',
      endsAt: null,
      isActive: true,
      startsAt: null,
      text: 'Flores frescas para cada ocasión.',
    },
    email: BUSINESS.email,
    experience: BUSINESS.experience,
    hasDocument: false,
    hours: {
      closes: BUSINESS.hours.closes,
      openDays: [...BUSINESS.hours.openDays],
      opens: BUSINESS.hours.opens,
      time: BUSINESS.hours.time,
      weekdays: BUSINESS.hours.weekdays,
    },
    instagram: BUSINESS.instagram,
    instagramHandle: handle,
    location: BUSINESS.location,
    mapsEmbedUrl: BUSINESS.mapsEmbedUrl,
    messages: {
      whatsappDefault: BUSINESS.messages.whatsappDefault,
      whatsappFloat: BUSINESS.messages.whatsappFloat,
      whatsappProduct: PRODUCT_WHATSAPP_TEMPLATE,
    },
    monthlyOrders: BUSINESS.monthlyOrders,
    name: BUSINESS.name,
    phone,
    razonSocial: BUSINESS.razonSocial,
    ruc: BUSINESS.ruc,
    titles: { ...FALLBACK_TITLES },
    website: BUSINESS.website,
    whatsapp: BUSINESS.whatsapp,
  };
}

export function visibleAnnouncement(
  settings: SiteSettings,
  now: Date = new Date(),
): VisibleAnnouncement | null {
  if (!settings.hasDocument) return { kind: 'fallback' };
  if (
    !isPublished(
      {
        ends_at: settings.announcement.endsAt,
        is_active: settings.announcement.isActive,
        starts_at: settings.announcement.startsAt,
      },
      now,
    )
  ) {
    return null;
  }
  return {
    ctaHref: resolveAnnouncementCtaHref(
      settings.announcement.ctaHref,
      settings.phone,
      settings.messages.whatsappDefault,
    ),
    ctaLabel: settings.announcement.ctaLabel,
    kind: 'cms',
    text: settings.announcement.text,
  };
}

export function derivedContact(phone: string, handle: string): {
  instagram: string;
  instagramHandle: string;
  whatsapp: string;
} {
  const instagramHandle = normalizeInstagramHandle(handle);
  return {
    instagram: instagramUrl(instagramHandle),
    instagramHandle,
    whatsapp: whatsappUrl(phone),
  };
}

function minutesFromTime(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function isOpenNow(hours: SiteHours, now: Date = new Date()): boolean {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const peru = new Date(utcMs - 5 * 60 * 60 * 1_000);
  const minutes = peru.getHours() * 60 + peru.getMinutes();
  return (
    hours.openDays.includes(peru.getDay())
    && minutes >= minutesFromTime(hours.opens)
    && minutes < minutesFromTime(hours.closes)
  );
}

const SCHEMA_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function schemaDayNames(openDays: number[]): string[] {
  return openDays.map((day) => SCHEMA_DAYS[day]);
}
