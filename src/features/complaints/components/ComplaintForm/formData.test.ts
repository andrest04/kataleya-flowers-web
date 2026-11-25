import { describe, expect, it } from 'vitest';

import { errorSummary, fieldErrorsFromIssues, formDataToComplaint } from './formData';

function filledForm(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const fields: Record<string, string> = {
    consumerName: 'Ana Torres',
    consumerDocType: 'CE',
    consumerDocNumber: '001234567',
    consumerAddress: 'Av. Siempre Viva 742',
    consumerPhone: '987654321',
    consumerEmail: 'ana@example.com',
    guardianName: 'Luis Torres',
    itemType: 'SERVICIO',
    itemDescription: 'Arreglo floral de 24 rosas',
    claimedAmount: '120.50',
    detail: 'Llegó tarde',
    consumerRequest: 'Reembolso',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

describe('formDataToComplaint', () => {
  it('maps every field and the extras', () => {
    expect(formDataToComplaint(filledForm(), { isMinor: true, complaintType: 'QUEJA' })).toEqual({
      consumerName: 'Ana Torres',
      consumerDocType: 'CE',
      consumerDocNumber: '001234567',
      consumerAddress: 'Av. Siempre Viva 742',
      consumerPhone: '987654321',
      consumerEmail: 'ana@example.com',
      isMinor: true,
      guardianName: 'Luis Torres',
      itemType: 'SERVICIO',
      itemDescription: 'Arreglo floral de 24 rosas',
      claimedAmount: 120.5,
      complaintType: 'QUEJA',
      detail: 'Llegó tarde',
      consumerRequest: 'Reembolso',
    });
  });

  it('leaves an empty or blank amount undefined', () => {
    const extras = { isMinor: false, complaintType: 'RECLAMO' as const };
    expect(formDataToComplaint(filledForm({ claimedAmount: '' }), extras).claimedAmount).toBeUndefined();
    expect(formDataToComplaint(filledForm({ claimedAmount: '   ' }), extras).claimedAmount).toBeUndefined();
  });

  it('defaults the document and item types and blanks missing text', () => {
    const data = formDataToComplaint(new FormData(), { isMinor: false, complaintType: 'RECLAMO' });
    expect(data.consumerDocType).toBe('DNI');
    expect(data.itemType).toBe('PRODUCTO');
    expect(data.consumerName).toBe('');
    expect(data.guardianName).toBe('');
    expect(data.claimedAmount).toBeUndefined();
  });
});

describe('fieldErrorsFromIssues', () => {
  it('keeps the first message per top-level field', () => {
    expect(
      fieldErrorsFromIssues([
        { path: ['consumerEmail'], message: 'Email inválido' },
        { path: ['consumerEmail'], message: 'Otro mensaje' },
        { path: ['detail'], message: 'Requerido' },
        { path: [0], message: 'Ignorado' },
      ]),
    ).toEqual({ consumerEmail: 'Email inválido', detail: 'Requerido' });
  });

  it('returns no errors without issues', () => {
    expect(fieldErrorsFromIssues(undefined)).toEqual({});
  });
});

describe('errorSummary', () => {
  it('summarizes one marked field', () => {
    expect(errorSummary({ detail: 'Requerido' }, 'Fallback')).toBe('Revisa el campo marcado.');
  });

  it('summarizes several marked fields with their count', () => {
    expect(errorSummary({ a: 'x', b: 'y', c: 'z' }, 'Fallback')).toBe(
      'Revisa los 3 campos marcados.',
    );
  });

  it('falls back to the server message without field errors', () => {
    expect(errorSummary({}, 'Demasiados intentos.')).toBe('Demasiados intentos.');
  });
});
