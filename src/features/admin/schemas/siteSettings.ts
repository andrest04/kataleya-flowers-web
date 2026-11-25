import { z } from 'zod';

import { toMapsEmbedUrl } from '@/lib/mapsEmbed';
import { isSafeSiteHref } from '@/lib/safeHref';
import { normalizeSiteOrigin } from '@/lib/siteOrigin';
import { isDerivedWhatsappCta } from '@/lib/siteSettings';

import { email, nonEmptyString } from './common';

const optionalInstant = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: 'custom', message: 'Fecha inválida' });
      return null;
    }
    return parsed.toISOString();
  });

const timeOfDay = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, 'Usa el formato 08:00')
  .transform((value) => value.slice(0, 5));

export const siteSettingsSchema = z
  .object({
    address: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(500, 'Máximo 500 caracteres'),
    announcementCtaHref: z
      .string()
      .trim()
      .max(2048, 'URL demasiado larga')
      .refine(
        (href) => !href || isDerivedWhatsappCta(href) || isSafeSiteHref(href),
        'Usa WhatsApp (déjalo vacío), una ruta del sitio o una URL que empiece con https://',
      ),
    announcementCtaLabel: nonEmptyString,
    announcementEndsAt: optionalInstant,
    announcementIsActive: z.boolean(),
    announcementStartsAt: optionalInstant,
    announcementText: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(500, 'Máximo 500 caracteres'),
    bestsellersTitle: nonEmptyString,
    catalogTitle: nonEmptyString,
    contactTitle: nonEmptyString,
    discoverTitle: nonEmptyString,
    email,
    hoursCloses: timeOfDay,
    hoursOpens: timeOfDay,
    hoursTime: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(64, 'Máximo 64 caracteres'),
    hoursWeekdays: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(64, 'Máximo 64 caracteres'),
    instagramHandle: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(64, 'Máximo 64 caracteres')
      .regex(/^@?[A-Za-z0-9._]{1,30}$/, 'Escribe el usuario de Instagram, sin URL'),
    location: nonEmptyString,
    mapsEmbedUrl: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(2048, 'URL demasiado larga')
      .transform((value) => toMapsEmbedUrl(value) ?? value),
    mapsLink: z
      .string()
      .trim()
      .max(4000, 'Máximo 4000 caracteres')
      .optional(),
    name: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(255, 'Máximo 255 caracteres'),
    openDays: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'Elige al menos un día'),
    phone: z
      .string()
      .trim()
      .regex(/^\d{8,15}$/, 'Escribe el teléfono solo con dígitos, con código de país'),
    razonSocial: nonEmptyString,
    ruc: z
      .string()
      .trim()
      .regex(/^\d{11}$/, 'Escribe los 11 dígitos del RUC'),
    website: z
      .string()
      .trim()
      .max(2048, 'URL demasiado larga')
      .transform((value, ctx) => {
        const origin = normalizeSiteOrigin(value);
        if (origin === null) {
          ctx.addIssue({ code: 'custom', message: 'Usa una URL que empiece con https://' });
          return z.NEVER;
        }
        return origin;
      }),
    whatsappDefault: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(500, 'Máximo 500 caracteres'),
    whatsappFloat: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(500, 'Máximo 500 caracteres'),
    whatsappProduct: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(500, 'Máximo 500 caracteres'),
  })
  .superRefine((value, ctx) => {
    if (!value.mapsLink && toMapsEmbedUrl(value.mapsEmbedUrl) === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Pega el link de Compartir de Google Maps',
        path: ['mapsEmbedUrl'],
      });
    }
    if (
      value.announcementStartsAt
      && value.announcementEndsAt
      && value.announcementStartsAt > value.announcementEndsAt
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de fin debe ser posterior a la de inicio',
        path: ['announcementEndsAt'],
      });
    }
  });

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
