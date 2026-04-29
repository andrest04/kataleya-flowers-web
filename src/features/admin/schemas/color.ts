import { z } from 'zod';

import { hexColor, taxonomyName } from './common';

/** Borrar un color por su `name` normalizado. */
export const deleteColorSchema = z.object({
  name: taxonomyName,
});

/** Renombrar un color (oldName → newName). */
export const renameColorSchema = z
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

/** Crear/upsert de color (usado al persistir desde el form). */
export const colorPayloadSchema = z.object({
  name: taxonomyName,
  hex: hexColor,
});

export type DeleteColorInput = z.infer<typeof deleteColorSchema>;
export type RenameColorInput = z.infer<typeof renameColorSchema>;
export type ColorPayload = z.infer<typeof colorPayloadSchema>;
