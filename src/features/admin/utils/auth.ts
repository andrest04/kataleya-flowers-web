import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { ZodIssue } from 'zod';

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

export const requireAdmin = cache(async (): Promise<AdminActionContext> => {
  const user = await auth.requireAdmin();
  return { user };
});

export async function requireAdminOrRedirect(): Promise<AdminActionContext> {
  try {
    return await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      redirect(
        err.code === 'FORBIDDEN' ? '/login?error=forbidden&session=ended' : '/login?session=ended',
      );
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
