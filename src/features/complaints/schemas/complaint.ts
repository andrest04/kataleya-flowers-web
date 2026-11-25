import { z } from 'zod';

import {
  docNumberField,
  emailField,
  longTextField,
  peruPhoneField,
  requiredString,
  uuid,
} from '@/lib/validation/primitives';

import { COMPLAINT_STATUSES, COMPLAINT_TYPES, DOC_TYPES, ITEM_TYPES } from './constants';

export { COMPLAINT_STATUSES, COMPLAINT_TYPES, DOC_TYPES, ITEM_TYPES } from './constants';

const EMAIL_MESSAGE = 'Ingresa un correo como nombre@ejemplo.com';

export const complaintSubmitSchema = z
  .object({
    consumerName: requiredString('Ingresa el nombre completo'),
    consumerDocType: z.enum(DOC_TYPES, { message: 'Tipo de documento inválido' }),
    consumerDocNumber: docNumberField('El documento debe tener entre 6 y 15 letras o números'),
    consumerAddress: requiredString('Ingresa el domicilio'),
    consumerPhone: peruPhoneField('Ingresa un teléfono de 9 dígitos').optional().or(z.literal('')),
    consumerEmail: emailField({ required: EMAIL_MESSAGE, invalid: EMAIL_MESSAGE }),
    isMinor: z.boolean().default(false),
    guardianName: z.string().trim().max(255).optional().or(z.literal('')),

    itemType: z.enum(ITEM_TYPES, { message: 'Selecciona producto o servicio' }),
    itemDescription: longTextField('Describe el producto o servicio', 2000),
    claimedAmount: z
      .number({ message: 'El monto debe ser un número' })
      .nonnegative('El monto no puede ser negativo')
      .max(1_000_000, 'El monto debe ser de S/ 1 000 000 como máximo')
      .optional(),

    complaintType: z.enum(COMPLAINT_TYPES, { message: 'Selecciona reclamo o queja' }),
    detail: longTextField('Describe lo ocurrido'),
    consumerRequest: longTextField('Indica qué solicitas (cambio, devolución, etc.)'),
  })
  .refine((data) => !data.isMinor || !!data.guardianName?.trim(), {
    message: 'Indica el nombre del padre, madre o apoderado.',
    path: ['guardianName'],
  });

export type ComplaintFormData = z.infer<typeof complaintSubmitSchema>;

export const complaintStatusUpdateSchema = z.object({
  id: uuid,
  status: z.enum(COMPLAINT_STATUSES, { message: 'Estado inválido' }),
  providerResponse: z.string().trim().max(2000, 'Máximo 2000 caracteres').optional().or(z.literal('')),
});

export type ComplaintStatusUpdateData = z.infer<typeof complaintStatusUpdateSchema>;
