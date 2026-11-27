import { describe, expect, it } from 'vitest';

import { formatHours } from './formatHours';

describe('formatHours', () => {
  it('formats compact am and pm with a range', () => {
    expect(formatHours('8:00am - 7:00pm')).toBe('8:00 a. m. – 7:00 p. m.');
  });

  it('formats hour-only times', () => {
    expect(formatHours('9am - 8pm')).toBe('9 a. m. – 8 p. m.');
  });

  it('tolerates spaces, case and dotted meridiems', () => {
    expect(formatHours('8:00 AM - 7:00 PM')).toBe('8:00 a. m. – 7:00 p. m.');
    expect(formatHours('8:00a.m. - 7:00p.m.')).toBe('8:00 a. m. – 7:00 p. m.');
    expect(formatHours('8:00 a. m. - 7:00 p. m.')).toBe('8:00 a. m. – 7:00 p. m.');
  });

  it('formats times inside a sentence', () => {
    expect(formatHours('Atendemos de 8:00am - 7:00pm todos los días')).toBe(
      'Atendemos de 8:00 a. m. – 7:00 p. m. todos los días',
    );
  });

  it('accepts an en dash or no spaces around the separator', () => {
    expect(formatHours('8am-7pm')).toBe('8 a. m. – 7 p. m.');
    expect(formatHours('8am – 7pm')).toBe('8 a. m. – 7 p. m.');
  });

  it('formats a single time', () => {
    expect(formatHours('Desde las 10:30pm')).toBe('Desde las 10:30 p. m.');
  });

  it('leaves text without times unchanged', () => {
    expect(formatHours('Lunes a sábado')).toBe('Lunes a sábado');
    expect(formatHours('Entrega en 24-48 horas')).toBe('Entrega en 24-48 horas');
    expect(formatHours('')).toBe('');
  });

  it('is idempotent', () => {
    const once = formatHours('8:00am - 7:00pm');
    expect(formatHours(once)).toBe(once);
  });
});
