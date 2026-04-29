import { z } from 'zod';
import {
  cloudinaryUrl,
  hexColor,
  longText,
  nonEmptyString,
  nonNegativeInt,
  priceVariant,
  slug,
  taxonomyName,
  uuid,
} from './common';

/**
 * Shape canónico de los datos que llegan a `createProduct` / `updateProduct`.
 *
 * Notas:
 * - `colors` y `flower_types` viajan como nombres normalizados (string), no UUIDs —
 *   así está modelado en `Database['products']['Row']` y mantiene compatibilidad.
 * - `imageUrl` y cada item de `images` se restringen al CDN configurado.
 * - `priceVariants` puede ser `null` (precio fijo) o un array no vacío.
 */
const baseProductShape = {
  name: nonEmptyString,
  slug: slug.optional(), // si llega vacío lo deriva el server desde `name`
  description: longText,
  price: z
    .number({ message: 'El precio debe ser un número' })
    .nonnegative('El precio no puede ser negativo')
    .max(1_000_000, 'Precio fuera de rango'),
  categoryId: uuid,
  imageUrl: cloudinaryUrl,
  images: z.array(cloudinaryUrl).max(10, 'Máximo 10 imágenes adicionales'),
  colors: z.array(taxonomyName).max(50, 'Demasiados colores'),
  flowerTypes: z.array(taxonomyName).max(50, 'Demasiados tipos de flor'),
  includes: z.array(nonEmptyString.max(255)).max(30, 'Demasiados ítems'),
  priceVariants: z
    .array(priceVariant)
    .max(20, 'Demasiadas variantes')
    .nullable(),
  occasion: z.string().trim().max(255).optional().default(''),
  note: z.string().trim().max(255).optional().default(''),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: nonNegativeInt,
  // Pendientes nuevos creados desde el form
  newFlowerTypes: z.array(taxonomyName).max(50).optional(),
  newColors: z
    .array(
      z.object({
        name: taxonomyName,
        hex: hexColor,
      }),
    )
    .max(50)
    .optional(),
};

export const productCreateSchema = z.object(baseProductShape);

export const productUpdateSchema = z.object({
  ...baseProductShape,
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
