'use client';

interface FieldErrorProps {
  id?: string;
  message?: string;
}

/**
 * Mensaje de error inline asociado a un campo del form.
 *
 * Se vincula al input mediante `aria-describedby={id}` y `aria-invalid="true"`,
 * y queda visible con `role="alert"` para que screen readers lo anuncien.
 */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-xs"
      style={{ color: 'var(--color-primary)' }}
    >
      {message}
    </p>
  );
}
