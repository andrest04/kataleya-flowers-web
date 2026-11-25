import { z } from 'zod';

import { isOwnedStorageUrl, parseOwnedStorageUrl } from '@/lib/imageStorage/ownership';

export {
  docNumber,
  docNumberField,
  email,
  emailField,
  hexColor,
  longText,
  longTextField,
  nonEmptyString,
  nonNegativeInt,
  optionalTrimmedString,
  peruPhone,
  peruPhoneField,
  priceVariant,
  requiredString,
  uuid,
} from '@/lib/validation/primitives';

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
    (value) => isOwnedStorageUrl(value),
    'La imagen debe servirse desde el storage propio del proyecto',
  )
  .transform((value) => parseOwnedStorageUrl(value)?.canonicalUrl ?? value);

export const taxonomyName = z
  .string()
  .trim()
  .min(1, 'Nombre obligatorio')
  .max(60, 'Nombre demasiado largo');
