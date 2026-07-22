import { z } from 'zod';

import { uuid } from './common';

export const reorderSchema = z.object({
  ids: z
    .array(uuid)
    .min(1, 'Se requiere al menos un identificador')
    .max(500, 'Demasiados elementos en un solo reorder'),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
