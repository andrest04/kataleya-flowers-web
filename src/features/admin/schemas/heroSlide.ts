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

export const heroSlideSchema = z
  .object({
    altText: nonEmptyString,
    ctaLabel: optionalMax(255),
    ctaType: z.enum(['whatsapp', 'catalogo', 'url']),
    ctaValue: optionalMax(2048),
    focus: z
      .string()
      .trim()
      .max(64, 'Máximo 64 caracteres')
      .optional()
      .transform((value) => value || '70% center'),
    imageUrl: storedImageUrl,
    isActive: z.boolean(),
    kicker: nonEmptyString,
    name: nonEmptyString,
    startsAt: optionalInstant,
    endsAt: optionalInstant,
    subtitle: optionalMax(500),
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
      if (!value.ctaLabel) {
        ctx.addIssue({ code: 'custom', message: 'El texto del botón es obligatorio', path: ['ctaLabel'] });
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

export type HeroSlideInput = z.infer<typeof heroSlideSchema>;
