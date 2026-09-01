import type { ZodIssue } from 'zod';

const FIELD_LABELS: Record<string, string> = {
  ctaLabel: 'Texto del botón',
  ctaValue: 'URL del botón',
  description: 'Descripción',
  endsAt: 'Ocultar desde',
  imageUrl: 'Foto',
  name: 'Nombre',
  startsAt: 'Mostrar desde',
  title: 'Título',
};

const BANNER_LABELS: Record<string, string> = {
  a: 'Primer banner',
  b: 'Segundo banner',
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
    const [first, second] = issue.path;
    if (typeof first === 'string' && first in BANNER_LABELS && typeof second === 'string') {
      const field = FIELD_LABELS[second] ?? second;
      return `${BANNER_LABELS[first]} · ${field}: ${issue.message}`;
    }
    if (typeof first === 'string') {
      const field = FIELD_LABELS[first];
      return field ? `${field}: ${issue.message}` : issue.message;
    }
    return issue.message;
  }))];
  return parts.join(' · ');
}

export function pickBannerErrors(errors: FieldErrors, prefix: 'a' | 'b'): FieldErrors {
  const picked: FieldErrors = {};
  const lead = `${prefix}.`;
  for (const [key, message] of Object.entries(errors)) {
    if (key.startsWith(lead)) picked[key.slice(lead.length)] = message;
  }
  return picked;
}
