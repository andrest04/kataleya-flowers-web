import type { ZodIssue, ZodSchema } from 'zod';

import type { AppwriteAdminActionContext } from './auth.appwrite';
import { requireAdminAppwrite } from './auth.appwrite';

export type { AppwriteAdminActionContext };

export interface AdminActionFailure {
  success: false;
  error: string;
  code?: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION' | 'INTERNAL' | 'COLOR_IN_USE' | 'FLOWER_TYPE_IN_USE';
  issues?: ZodIssue[];
}

export interface AdminActionSuccess<T = undefined> {
  success: true;
  data?: T;
}

export type AdminActionResult<T = undefined> =
  | AdminActionSuccess<T>
  | AdminActionFailure;

export class AdminAuthError extends Error {
  public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN';
  constructor(code: 'UNAUTHENTICATED' | 'FORBIDDEN', message: string) {
    super(message);
    this.code = code;
    this.name = 'AdminAuthError';
  }
}

export async function requireAdmin(): Promise<AppwriteAdminActionContext> {
  return requireAdminAppwrite();
}

export function failureFromUnknown(err: unknown): AdminActionFailure {
  if (err instanceof AdminAuthError) {
    return {
      success: false,
      error:
        err.code === 'UNAUTHENTICATED'
          ? 'Sesión inválida. Inicia sesión nuevamente.'
          : 'No tienes permisos para esta acción.',
      code: err.code,
    };
  }
  console.error('[admin-action] unexpected error:', err);
  return {
    success: false,
    error: 'No se pudo completar la operación. Intenta de nuevo en unos minutos.',
    code: 'INTERNAL',
  };
}

export function withAdminAuth<TInput, TOutput extends { success: boolean }>(
  schema: ZodSchema<TInput> | null,
) {
  return function bind(
    fn: (input: TInput, ctx: AppwriteAdminActionContext) => Promise<TOutput>,
  ): (input: unknown) => Promise<TOutput | AdminActionFailure> {
    return async (rawInput: unknown) => {
      let ctx: AppwriteAdminActionContext;
      try {
        ctx = await requireAdmin();
      } catch (err) {
        return failureFromUnknown(err);
      }

      let parsed: TInput;
      if (schema) {
        const result = schema.safeParse(rawInput);
        if (!result.success) {
          console.warn('[admin-action] validation failed:', result.error.issues);
          return {
            success: false,
            error: 'Datos inválidos. Revisa el formulario.',
            code: 'VALIDATION',
            issues: result.error.issues,
          };
        }
        parsed = result.data;
      } else {
        parsed = rawInput as TInput;
      }

      try {
        return await fn(parsed, ctx);
      } catch (err) {
        return failureFromUnknown(err) as TOutput | AdminActionFailure;
      }
    };
  };
}
