import { z } from 'zod';

import { isValuePropIconName } from '@/lib/valuePropIcons';

import { nonEmptyString } from './common';

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

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const valuePropSchema = z
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
      .refine(isValuePropIconName, 'Elige un icono de la lista'),
    isActive: z.boolean(),
    isAnchor: z.boolean(),
    isExternal: z.boolean(),
    linkLabel: nonEmptyString,
    startsAt: optionalInstant,
    title: nonEmptyString,
  })
  .superRefine((value, ctx) => {
    if (value.isAnchor && value.isExternal) {
      ctx.addIssue({
        code: 'custom',
        message: 'Elige un solo tipo de destino',
        path: ['href'],
      });
    }
    if (value.isAnchor && !value.href.startsWith('#')) {
      ctx.addIssue({
        code: 'custom',
        message: 'Usa un ancla como #nosotros',
        path: ['href'],
      });
    }
    if (value.isExternal && !isHttpUrl(value.href)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Usa una URL que empiece con https://',
        path: ['href'],
      });
    }
    if (
      !value.isAnchor
      && !value.isExternal
      && (!value.href.startsWith('/') || value.href.startsWith('//'))
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Usa una ruta del sitio como /catalogo',
        path: ['href'],
      });
    }
    if (value.startsAt && value.endsAt && value.startsAt > value.endsAt) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de fin debe ser posterior a la de inicio',
        path: ['endsAt'],
      });
    }
  });

export type ValuePropInput = z.infer<typeof valuePropSchema>;
