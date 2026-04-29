import { z } from 'zod';
import {
  cloudinaryUrl,
  longText,
  nonEmptyString,
  nonNegativeInt,
  optionalTrimmedString,
  slug,
} from './common';

/**
 * Shape canónico de `createCategory` / `updateCategory`.
 *
 * Reglas:
 * - `imageUrl` puede ser string vacío o `null` (categoría sin imagen) — si tiene
 *   valor, debe ser una URL del CDN configurado.
 * - `slug` se deriva del `name` en el server pero puede llegar pre-calculado.
 * - `displayOrder` es opcional en CREATE (lo asigna `createCategory`).
 */
const baseCategoryShape = {
  name: nonEmptyString,
  slug: slug.optional(),
  description: longText,
  occasion: optionalTrimmedString.transform((value) => value ?? ''),
  imageUrl: z
    .union([z.literal(''), cloudinaryUrl])
    .optional()
    .transform((value) => value ?? ''),
  displayOrder: nonNegativeInt.optional().default(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
};

export const categoryCreateSchema = z.object(baseCategoryShape);

export const categoryUpdateSchema = z.object({
  ...baseCategoryShape,
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
