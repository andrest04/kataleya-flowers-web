import { z } from 'zod';

import {
  hexColor,
  longText,
  nonEmptyString,
  nonNegativeInt,
  priceVariant,
  slug,
  storedImageUrl,
  taxonomyName,
  uuid,
} from './common';

const baseProductShape = {
  name: nonEmptyString,
  slug: slug.optional(),
  description: longText,
  price: z
    .number({ message: 'El precio debe ser un número' })
    .nonnegative('El precio no puede ser negativo')
    .max(1_000_000, 'Precio fuera de rango'),
  categoryId: uuid,
  imageUrl: storedImageUrl,
  images: z.array(storedImageUrl).max(10, 'Máximo 10 imágenes adicionales'),
  imageAlts: z
    .record(storedImageUrl, z.string().trim().max(500, 'La descripción de la imagen es muy larga'))
    .optional()
    .default({}),
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
