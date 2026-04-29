import { z } from 'zod';

import { uuid } from './common';

/** Reordenamiento bulk: lista de UUIDs en el orden deseado. */
export const reorderSchema = z.object({
  ids: z
    .array(uuid)
    .min(1, 'Se requiere al menos un identificador')
    .max(500, 'Demasiados elementos en un solo reorder'),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
