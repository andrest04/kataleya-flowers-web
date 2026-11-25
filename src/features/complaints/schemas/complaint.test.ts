import { describe, expect, it } from 'vitest';

import { longText } from '@/lib/validation/primitives';

import { complaintSubmitSchema } from './complaint';

const VALID_INPUT = {
  consumerName: 'Ana Torres',
  consumerDocType: 'DNI',
  consumerDocNumber: '12345678',
  consumerAddress: 'Av. Siempre Viva 742',
  consumerPhone: '',
  consumerEmail: 'ana@example.com',
  isMinor: false,
  guardianName: '',
  itemType: 'PRODUCTO',
  itemDescription: 'Ramo de rosas rojas',
  complaintType: 'RECLAMO',
  detail: 'El ramo llegó con las flores marchitas.',
  consumerRequest: 'Solicito el reembolso del pedido.',
};

function messageFor(field: string, overrides: Record<string, unknown>) {
  const result = complaintSubmitSchema.safeParse({ ...VALID_INPUT, ...overrides });
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('complaintSubmitSchema messages', () => {
  it('accepts valid data', () => {
    expect(complaintSubmitSchema.safeParse(VALID_INPUT).success).toBe(true);
  });

  it.each([
    ['consumerName', '', 'Ingresa el nombre completo'],
    ['consumerAddress', '', 'Ingresa el domicilio'],
    ['itemDescription', '', 'Describe el producto o servicio'],
    ['detail', '   ', 'Describe lo ocurrido'],
    ['consumerRequest', '', 'Indica qué solicitas (cambio, devolución, etc.)'],
    ['consumerEmail', 'ana@', 'Ingresa un correo como nombre@ejemplo.com'],
    ['consumerEmail', '', 'Ingresa un correo como nombre@ejemplo.com'],
    ['consumerDocNumber', '12-34', 'El documento debe tener entre 6 y 15 letras o números'],
    ['consumerPhone', 'abc', 'Ingresa un teléfono de 9 dígitos'],
    ['claimedAmount', 2_000_000, 'El monto debe ser de S/ 1 000 000 como máximo'],
  ])('gives %s an actionable message for %j', (field, value, message) => {
    expect(messageFor(field, { [field]: value })).toBe(message);
  });
});

describe('longText', () => {
  it('keeps the admin default message', () => {
    const result = longText.safeParse('');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('La descripción es obligatoria');
  });
});
