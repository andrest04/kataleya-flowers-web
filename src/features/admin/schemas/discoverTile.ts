import { z } from 'zod';

import { isDiscoverIconName } from '@/lib/discoverIcons';
import { isAppwriteStorageUrl } from '@/lib/imageStorage/urlValidation';

import { nonEmptyString } from './common';

export function isPublicSiteImagePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('..');
}

export function isDiscoverTileImageUrl(value: string): boolean {
  return isAppwriteStorageUrl(value) || isPublicSiteImagePath(value);
}

const discoverTileImageUrl = z
  .string()
  .trim()
  .min(1, 'Campo obligatorio')
  .max(1024, 'URL demasiado larga')
  .refine(
    isDiscoverTileImageUrl,
    'La imagen debe servirse desde el storage propio o una ruta pública del sitio',
  );

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

export const discoverTileSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(500, 'Máximo 500 caracteres'),
    endsAt: optionalInstant,
    href: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(2048, 'URL demasiado larga'),
    icon: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(64, 'Máximo 64 caracteres')
      .refine(isDiscoverIconName, 'Elige un icono de la lista'),
    imageUrl: discoverTileImageUrl,
    isActive: z.boolean(),
    isExternal: z.boolean(),
    startsAt: optionalInstant,
    title: nonEmptyString,
  })
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt && value.startsAt > value.endsAt) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de fin debe ser posterior a la de inicio',
        path: ['endsAt'],
      });
    }
  });

export type DiscoverTileInput = z.infer<typeof discoverTileSchema>;
