import { redirect } from 'next/navigation';
import type { ZodIssue, ZodSchema } from 'zod';

import type { AuthUser } from '@/lib/auth';
import { auth, AuthError } from '@/lib/auth';

export { AuthError as AdminAuthError };

export interface AdminActionContext {
  user: AuthUser;
}

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

export async function requireAdmin(): Promise<AdminActionContext> {
  const user = await auth.requireAdmin();
  return { user };
}

export async function requireAdminOrRedirect(): Promise<AdminActionContext> {
  try {
    return await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      redirect(err.code === 'FORBIDDEN' ? '/login?error=forbidden' : '/login');
    }
    throw err;
  }
}

export function failureFromUnknown(err: unknown): AdminActionFailure {
  if (err instanceof AuthError) {
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
    fn: (input: TInput, ctx: AdminActionContext) => Promise<TOutput>,
  ): (input: unknown) => Promise<TOutput | AdminActionFailure> {
    return async (rawInput: unknown) => {
      let ctx: AdminActionContext;
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
