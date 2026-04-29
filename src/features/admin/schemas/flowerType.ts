import { z } from 'zod';
import { taxonomyName } from './common';

/** Borrar un tipo de flor por su `name` normalizado. */
export const deleteFlowerTypeSchema = z.object({
  name: taxonomyName,
});

/** Renombrar un tipo de flor. */
export const renameFlowerTypeSchema = z
  .object({
    oldName: taxonomyName,
    newName: taxonomyName,
  })
  .refine(
    (value) => value.oldName.trim().toLowerCase() !== value.newName.trim().toLowerCase(),
    {
      message: 'El nuevo nombre debe ser diferente al actual',
      path: ['newName'],
    },
  );

export type DeleteFlowerTypeInput = z.infer<typeof deleteFlowerTypeSchema>;
export type RenameFlowerTypeInput = z.infer<typeof renameFlowerTypeSchema>;
