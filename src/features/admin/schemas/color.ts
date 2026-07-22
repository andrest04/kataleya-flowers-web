import { z } from 'zod';

import { taxonomyName } from './common';

export const deleteColorSchema = z.object({
  name: taxonomyName,
});

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

export type DeleteColorInput = z.infer<typeof deleteColorSchema>;
export type RenameColorInput = z.infer<typeof renameColorSchema>;
