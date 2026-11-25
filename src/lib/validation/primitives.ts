import { z } from 'zod';

export const requiredString = (requiredMessage = 'Campo obligatorio') =>
  z.string().trim().min(1, requiredMessage).max(255, 'Máximo 255 caracteres');

export const nonEmptyString = requiredString();

export const optionalTrimmedString = z
  .string()
  .trim()
  .max(255, 'Máximo 255 caracteres')
  .optional()
  .nullable();

export const longTextField = (requiredMessage = 'La descripción es obligatoria', maxLength = 5000) =>
  z.string().trim().min(1, requiredMessage).max(maxLength, `Máximo ${maxLength} caracteres`);

export const longText = longTextField();

export const uuid = z.uuid('Identificador inválido');

export const priceVariant = z.object({
  label: nonEmptyString,
  price: z
    .number({ message: 'El precio debe ser un número' })
    .nonnegative('El precio no puede ser negativo')
    .max(1_000_000, 'Precio fuera de rango'),
});

export const nonNegativeInt = z
  .number({ message: 'Debe ser numérico' })
  .int('Debe ser un entero')
  .nonnegative('No puede ser negativo');

export const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Hex inválido (ej: #c0392b)');

export const emailField = ({
  required = 'El email es obligatorio',
  invalid = 'Email inválido',
}: { required?: string; invalid?: string } = {}) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, required)
    .email(invalid)
    .max(255, 'Email demasiado largo');

export const email = emailField();

export const peruPhoneField = (invalidMessage = 'Teléfono inválido') =>
  z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{6,20}$/, invalidMessage);

export const peruPhone = peruPhoneField();

export const docNumberField = (invalidMessage = 'Documento inválido') =>
  z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z]{6,15}$/, invalidMessage);

export const docNumber = docNumberField();
