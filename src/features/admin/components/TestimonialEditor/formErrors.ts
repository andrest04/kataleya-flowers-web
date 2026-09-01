import type { ZodIssue } from 'zod';

const FIELD_LABELS: Record<string, string> = {
  endsAt: 'Ocultar desde',
  name: 'Nombre',
  occasion: 'Ocasión',
  photoAlt: 'Texto alternativo',
  photoUrl: 'Foto',
  quote: 'Cita',
  stars: 'Estrellas',
  startsAt: 'Mostrar desde',
};

export type FieldErrors = Record<string, string>;

export function fieldErrorsFromIssues(issues: ZodIssue[] | undefined): FieldErrors {
  if (!issues) return {};
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.join('.');
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export function messageFromFailure(failure: {
  error: string;
  issues?: ZodIssue[];
}): string {
  if (!failure.issues?.length) return failure.error;
  const parts = [...new Set(failure.issues.map((issue) => {
    const [first] = issue.path;
    if (typeof first === 'string') {
      const field = FIELD_LABELS[first];
      return field ? `${field}: ${issue.message}` : issue.message;
    }
    return issue.message;
  }))];
  return parts.join(' · ');
}
