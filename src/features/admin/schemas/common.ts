import { z } from 'zod';

/**
 * Cloud name autorizado para Cloudinary. Mantener sincronizado con
 * `next.config.ts` (`remotePatterns`) y `CLAUDE.md`.
 *
 * Si cambia, exportarlo desde `lib/constants` y reusar acá.
 */
export const CLOUDINARY_CLOUD_NAME = 'dbjm18dqg';

/** Carpetas Cloudinary permitidas para uploads desde el admin. */
export const ALLOWED_CLOUDINARY_FOLDERS = ['productos', 'categorias'] as const;

/** Regex que matchea solo URLs servidas desde nuestro Cloudinary. */
export const CLOUDINARY_URL_REGEX = new RegExp(
  `^https://res\\.cloudinary\\.com/${CLOUDINARY_CLOUD_NAME}/.+`,
);

/** String requerido, sin espacios al borde, máx 255. */
export const nonEmptyString = z
  .string()
  .trim()
  .min(1, 'Campo obligatorio')
  .max(255, 'Máximo 255 caracteres');

/** String opcional con `null` permitido y trim aplicado. */
export const optionalTrimmedString = z
  .string()
  .trim()
  .max(255, 'Máximo 255 caracteres')
  .optional()
  .nullable();

/** Texto largo (descripciones). */
export const longText = z
  .string()
  .trim()
  .min(1, 'La descripción es obligatoria')
  .max(5000, 'Máximo 5000 caracteres');

/** UUID v4 (record ids). */
export const uuid = z.uuid('Identificador inválido');

/** Slug normalizado: minúsculas, números, guiones. */
export const slug = z
  .string()
  .trim()
  .min(1, 'Slug obligatorio')
  .max(120, 'Slug demasiado largo')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (solo a-z, 0-9 y guiones)');

/** URL servida desde nuestro Cloudinary (CDN whitelist). */
export const cloudinaryUrl = z
  .string()
  .trim()
  .url('URL inválida')
  .max(2048, 'URL demasiado larga')
  .refine(
    (value) => CLOUDINARY_URL_REGEX.test(value),
    `La imagen debe servirse desde res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`,
  );

/** Variante de precio (label libre + monto >= 0). */
export const priceVariant = z.object({
  label: nonEmptyString,
  price: z
    .number({ message: 'El precio debe ser un número' })
    .nonnegative('El precio no puede ser negativo')
    .max(1_000_000, 'Precio fuera de rango'),
});

/** Entero >= 0 para `display_order`. */
export const nonNegativeInt = z
  .number({ message: 'Debe ser numérico' })
  .int('Debe ser un entero')
  .nonnegative('No puede ser negativo');

/** Color hex (#RGB / #RRGGBB) — opcional. */
export const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Hex inválido (ej: #c0392b)');

/** Nombre normalizado (slug-like sin guiones forzados) usado como key de color/tipo. */
export const taxonomyName = z
  .string()
  .trim()
  .min(1, 'Nombre obligatorio')
  .max(60, 'Nombre demasiado largo');

/** Email normalizado (lowercase + trim). */
export const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'El email es obligatorio')
  .email('Email inválido')
  .max(255, 'Email demasiado largo');

/** Teléfono — solo formato (dígitos, +, espacios y separadores comunes). */
export const peruPhone = z
  .string()
  .trim()
  .regex(/^[0-9+\s()-]{6,20}$/, 'Teléfono inválido');

/** Documento de identidad (DNI/CE/Pasaporte) — solo formato. */
export const docNumber = z
  .string()
  .trim()
  .regex(/^[0-9A-Za-z]{6,15}$/, 'Documento inválido');
