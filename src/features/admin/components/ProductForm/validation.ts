import type { ZodIssue } from 'zod';

/**
 * Color por defecto del color picker cuando se crea un nuevo color desde el form.
 *
 * Es un valor inicial del input `<input type="color">` (no un estilo aplicado en JSX),
 * pero se centraliza acá para evitar magic values y poder cambiarlo de un solo lugar.
 * Documentado en QA/audit/05-admin-productos.md (hallazgo 🟡 10).
 */
export const DEFAULT_NEW_COLOR_HEX = '#3b82f6';

/**
 * Mapa `path-string -> mensaje` derivado de `ZodIssue[]`.
 *
 * El `path` se serializa con `.` para soportar arrays (`includes.0`, `priceVariants.2.price`).
 * Los componentes consumen este map con `getFieldError('name')` o `getFieldError('includes.0')`.
 */
export type FieldErrors = Record<string, string>;

export function buildFieldErrors(issues: ZodIssue[] | undefined): FieldErrors {
  if (!issues) return {};
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.join('.');
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export function getFieldError(errors: FieldErrors, path: string): string | undefined {
  return errors[path];
}
