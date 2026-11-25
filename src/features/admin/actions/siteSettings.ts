'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { ZodIssue } from 'zod';

import { siteSettingsSchema } from '@/features/admin/schemas/siteSettings';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  siteSettingsRepository,
  type SiteSettingsWritePayload,
} from '@/lib/database/repositories/siteSettings';
import { extractMapsCandidate, isMapsShortLinkHost, toMapsEmbedUrl } from '@/lib/mapsEmbed';
import { followMapsShortLink } from '@/lib/mapsShortLink';
import {
  ANNOUNCEMENT_WHATSAPP_CTA,
  FALLBACK_TITLES,
  isDerivedWhatsappCta,
  normalizeInstagramHandle,
  serializeOpenDays,
} from '@/lib/siteSettings';

type SiteSettingsActionResult = { success: true; mapsEmbedUrl: string } | AdminActionFailure;

const MAPS_LINK_MESSAGE = 'Pega el link de Compartir de Google Maps';

function mapsLinkFailure(): AdminActionFailure {
  const issues: ZodIssue[] = [
    {
      code: 'custom',
      message: MAPS_LINK_MESSAGE,
      path: ['mapsLink'],
    },
  ];
  return {
    success: false,
    error: 'Datos inválidos. Revisa el formulario.',
    code: 'VALIDATION',
    issues,
  };
}

async function resolveMapsPaste(mapsLink: string): Promise<string | null> {
  const direct = toMapsEmbedUrl(mapsLink);
  if (direct) return direct;

  const candidate = extractMapsCandidate(mapsLink);
  let parsed: URL;
  try {
    parsed = new URL(candidate.startsWith('//') ? `https:${candidate}` : candidate);
  } catch {
    return null;
  }
  if (!isMapsShortLinkHost(parsed.hostname)) return null;
  if (parsed.protocol === 'http:') parsed.protocol = 'https:';

  const resolved = await followMapsShortLink(parsed);
  return resolved ? toMapsEmbedUrl(resolved) : null;
}

function revalidateSiteSettings(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/configuracion');
  revalidatePath('/libro-de-reclamaciones');
  updateTag('site-settings');
}

function toWritePayload(
  value: ReturnType<typeof siteSettingsSchema.parse>,
): SiteSettingsWritePayload {
  return {
    address: value.address,
    announcementCtaHref: isDerivedWhatsappCta(value.announcementCtaHref)
      ? ANNOUNCEMENT_WHATSAPP_CTA
      : value.announcementCtaHref,
    announcementCtaLabel: value.announcementCtaLabel,
    announcementEndsAt: value.announcementEndsAt,
    announcementIsActive: value.announcementIsActive,
    announcementStartsAt: value.announcementStartsAt,
    announcementText: value.announcementText,
    bestsellersTitle: FALLBACK_TITLES.bestsellers,
    catalogTitle: value.catalogTitle,
    contactTitle: value.contactTitle,
    discoverTitle: value.discoverTitle,
    email: value.email,
    hoursCloses: value.hoursCloses,
    hoursOpenDays: serializeOpenDays(value.openDays),
    hoursOpens: value.hoursOpens,
    hoursTime: value.hoursTime,
    hoursWeekdays: value.hoursWeekdays,
    instagramHandle: normalizeInstagramHandle(value.instagramHandle),
    location: value.location,
    mapsEmbedUrl: value.mapsEmbedUrl,
    name: value.name,
    phone: value.phone,
    razonSocial: value.razonSocial,
    ruc: value.ruc,
    website: value.website,
    whatsappDefault: value.whatsappDefault,
    whatsappFloat: value.whatsappFloat,
    whatsappProduct: value.whatsappProduct,
  };
}

export async function saveSiteSettings(data: unknown): Promise<SiteSettingsActionResult> {
  try {
    await requireAdmin();
    const parsed = siteSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos. Revisa el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }
    const value = { ...parsed.data };
    if (value.mapsLink) {
      const embedUrl = await resolveMapsPaste(value.mapsLink);
      if (!embedUrl) return mapsLinkFailure();
      value.mapsEmbedUrl = embedUrl;
    }
    await siteSettingsRepository.upsert(toWritePayload(value));
    revalidateSiteSettings();
    return { success: true, mapsEmbedUrl: value.mapsEmbedUrl };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
