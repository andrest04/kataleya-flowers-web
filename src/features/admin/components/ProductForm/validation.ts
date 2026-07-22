import type { ZodIssue } from 'zod';

export const DEFAULT_NEW_COLOR_HEX = '#3b82f6';

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

