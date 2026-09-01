import { z } from 'zod';

import { nonEmptyString, storedImageUrl } from './common';

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

export const testimonialSchema = z
  .object({
    endsAt: optionalInstant,
    isActive: z.boolean(),
    name: nonEmptyString,
    occasion: nonEmptyString,
    photoAlt: nonEmptyString,
    photoUrl: storedImageUrl,
    quote: z
      .string()
      .trim()
      .min(1, 'Campo obligatorio')
      .max(1000, 'Máximo 1000 caracteres'),
    stars: z
      .number({ message: 'Debe ser numérico' })
      .int('Debe ser un entero')
      .min(1, 'Mínimo 1 estrella')
      .max(5, 'Máximo 5 estrellas'),
    startsAt: optionalInstant,
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

export type TestimonialInput = z.infer<typeof testimonialSchema>;
