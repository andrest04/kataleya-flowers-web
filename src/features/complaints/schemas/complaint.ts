import { z } from 'zod';

import {
  docNumber,
  email,
  longText,
  nonEmptyString,
  peruPhone,
  uuid,
} from '@/features/admin/schemas/common';

export const DOC_TYPES = ['DNI', 'CE', 'PASAPORTE'] as const;
export const ITEM_TYPES = ['PRODUCTO', 'SERVICIO'] as const;
export const COMPLAINT_TYPES = ['RECLAMO', 'QUEJA'] as const;
export const COMPLAINT_STATUSES = ['PENDIENTE', 'EN_PROCESO', 'RESPONDIDO'] as const;

/**
 * Schema del formulario público del Libro de Reclamaciones (INDECOPI).
 * Campos en camelCase — la action los mapea a los parámetros snake_case de la RPC.
 */
export const complaintSubmitSchema = z
  .object({
    // ① Consumidor
    consumerName: nonEmptyString,
    consumerDocType: z.enum(DOC_TYPES, { message: 'Tipo de documento inválido' }),
    consumerDocNumber: docNumber,
    consumerAddress: nonEmptyString,
    consumerPhone: peruPhone.optional().or(z.literal('')),
    consumerEmail: email,
    isMinor: z.boolean().default(false),
    guardianName: z.string().trim().max(255).optional().or(z.literal('')),

    // ② Bien contratado
    itemType: z.enum(ITEM_TYPES, { message: 'Selecciona producto o servicio' }),
    itemDescription: longText,
    claimedAmount: z
      .number({ message: 'El monto debe ser un número' })
      .nonnegative('El monto no puede ser negativo')
      .max(1_000_000, 'Monto fuera de rango')
      .optional(),

    // ③ Detalle
    complaintType: z.enum(COMPLAINT_TYPES, { message: 'Selecciona reclamo o queja' }),
    detail: longText,
    consumerRequest: longText,
  })
  .refine((data) => !data.isMinor || !!data.guardianName?.trim(), {
    message: 'Indica el nombre del padre, madre o apoderado.',
    path: ['guardianName'],
  });

export type ComplaintFormData = z.infer<typeof complaintSubmitSchema>;

/** Schema de la actualización admin (cambio de estado + respuesta del proveedor). */
export const complaintStatusUpdateSchema = z.object({
  id: uuid,
  status: z.enum(COMPLAINT_STATUSES, { message: 'Estado inválido' }),
  providerResponse: z.string().trim().max(5000).optional().or(z.literal('')),
});

export type ComplaintStatusUpdateData = z.infer<typeof complaintStatusUpdateSchema>;
