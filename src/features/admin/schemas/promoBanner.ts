import { z } from 'zod';

import { nonEmptyString, storedImageUrl } from './common';

function optionalMax(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((value) => value || null);
}

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

export const promoBannerSchema = z
  .object({
    contentPosition: z.enum(['top', 'bottom']),
    ctaLabel: nonEmptyString,
    ctaType: z.enum(['whatsapp', 'catalogo', 'url']),
    ctaValue: optionalMax(2048),
    description: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(1000, 'Máximo 1000 caracteres'),
    imageUrl: storedImageUrl,
    isActive: z.boolean(),
    name: nonEmptyString,
    startsAt: optionalInstant,
    endsAt: optionalInstant,
    title: nonEmptyString,
  })
  .superRefine((value, ctx) => {
    if (value.ctaType === 'url') {
      if (!value.ctaValue) {
        ctx.addIssue({ code: 'custom', message: 'La URL del botón es obligatoria', path: ['ctaValue'] });
      } else {
        try {
          new URL(value.ctaValue);
        } catch {
          ctx.addIssue({ code: 'custom', message: 'URL inválida', path: ['ctaValue'] });
        }
      }
    }
    if (value.startsAt && value.endsAt && value.startsAt > value.endsAt) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de fin debe ser posterior a la de inicio',
        path: ['endsAt'],
      });
    }
  });

export type PromoBannerInput = z.infer<typeof promoBannerSchema>;
