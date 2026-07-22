import { z } from 'zod';

import { isAppwriteStorageUrl } from '@/lib/imageStorage/urlValidation';

export const nonEmptyString = z
  .string()
  .trim()
  .min(1, 'Campo obligatorio')
  .max(255, 'Máximo 255 caracteres');

export const optionalTrimmedString = z
  .string()
  .trim()
  .max(255, 'Máximo 255 caracteres')
  .optional()
  .nullable();

export const longText = z
  .string()
  .trim()
  .min(1, 'La descripción es obligatoria')
  .max(5000, 'Máximo 5000 caracteres');

export const uuid = z.uuid('Identificador inválido');

export const slug = z
  .string()
  .trim()
  .min(1, 'Slug obligatorio')
  .max(120, 'Slug demasiado largo')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (solo a-z, 0-9 y guiones)');

export const storedImageUrl = z
  .string()
  .trim()
  .url('URL inválida')
  .max(2048, 'URL demasiado larga')
  .refine(
    (value) => isAppwriteStorageUrl(value),
    'La imagen debe servirse desde el storage propio del proyecto',
  );

export const priceVariant = z.object({
  label: nonEmptyString,
  price: z
    .number({ message: 'El precio debe ser un número' })
    .nonnegative('El precio no puede ser negativo')
    .max(1_000_000, 'Precio fuera de rango'),
});

export const nonNegativeInt = z
  .number({ message: 'Debe ser numérico' })
  .int('Debe ser un entero')
  .nonnegative('No puede ser negativo');

export const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Hex inválido (ej: #c0392b)');

export const taxonomyName = z
  .string()
  .trim()
  .min(1, 'Nombre obligatorio')
  .max(60, 'Nombre demasiado largo');

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'El email es obligatorio')
  .email('Email inválido')
  .max(255, 'Email demasiado largo');

export const peruPhone = z
  .string()
  .trim()
  .regex(/^[0-9+\s()-]{6,20}$/, 'Teléfono inválido');

export const docNumber = z
  .string()
  .trim()
  .regex(/^[0-9A-Za-z]{6,15}$/, 'Documento inválido');
