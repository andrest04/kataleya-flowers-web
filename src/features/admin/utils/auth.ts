import type { ZodIssue, ZodSchema } from 'zod';

import type { AppwriteAdminActionContext } from './auth.appwrite';
import { requireAdminAppwrite } from './auth.appwrite';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type { AppwriteAdminActionContext };

/**
 * Resultado canónico de las Server Actions admin.
 *
 * Conservamos `success` + `error` para no romper la API pública existente
 * (componentes que ya consumen las actions). Agregamos `code` e `issues`
 * para diferenciar errores de auth, validación e infraestructura sin filtrar
 * detalles internos al cliente.
 */
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

// ─── Errores ────────────────────────────────────────────────────────────────

export class AdminAuthError extends Error {
  public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN';
  constructor(code: 'UNAUTHENTICATED' | 'FORBIDDEN', message: string) {
    super(message);
    this.code = code;
    this.name = 'AdminAuthError';
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verifica que haya sesión válida y membresía en el Team `admins` (Appwrite).
 * Throws `AdminAuthError` with `UNAUTHENTICATED` or `FORBIDDEN` — callers unchanged.
 */
export async function requireAdmin(): Promise<AppwriteAdminActionContext> {
  return requireAdminAppwrite();
}

/**
 * Convierte un error desconocido en un `AdminActionFailure` con mensaje
 * genérico — NO filtra mensajes crudos al cliente.
 *
 * Logueamos el error completo en el server (visible en Vercel) y devolvemos
 * un mensaje genérico apto para mostrar al usuario.
 */
export function failureFromUnknown(err: unknown): AdminActionFailure {
  if (err instanceof AdminAuthError) {
    return {
      success: false,
      error:
        err.code === 'UNAUTHENTICATED'
          ? 'Sesión inválida. Iniciá sesión nuevamente.'
          : 'No tenés permisos para esta acción.',
      code: err.code,
    };
  }
  // Loguear server-side para debug — el cliente no debe ver el detalle.
  console.error('[admin-action] unexpected error:', err);
  return {
    success: false,
    error: 'No se pudo completar la operación. Intentá de nuevo en unos minutos.',
    code: 'INTERNAL',
  };
}

/**
 * Wrapper de Server Actions que exige sesión válida y valida el input
 * con un schema zod opcional ANTES de tocar la DB.
 *
 * Uso:
 * ```ts
 * export const createProduct = withAdminAuth(productCreateSchema)(
 *   async (data, { databases, user }) => {
 *     // data ya validado por zod
 *     // ...
 *   }
 * );
 * ```
 *
 * Si el schema falla → devuelve `{ success: false, code: 'VALIDATION', issues }`
 * sin ejecutar `fn`.
 *
 * Si la auth falla → devuelve `{ success: false, code: 'UNAUTHENTICATED' }`.
 *
 * Si `fn` lanza una excepción → la captura y devuelve `INTERNAL` con mensaje genérico.
 */
export function withAdminAuth<TInput, TOutput extends { success: boolean }>(
  schema: ZodSchema<TInput> | null,
) {
  return function bind(
    fn: (input: TInput, ctx: AppwriteAdminActionContext) => Promise<TOutput>,
  ): (input: unknown) => Promise<TOutput | AdminActionFailure> {
    return async (rawInput: unknown) => {
      // 1) Auth check (defense-in-depth)
      let ctx: AppwriteAdminActionContext;
      try {
        ctx = await requireAdmin();
      } catch (err) {
        return failureFromUnknown(err);
      }

      // 2) Validar input
      let parsed: TInput;
      if (schema) {
        const result = schema.safeParse(rawInput);
        if (!result.success) {
          console.warn('[admin-action] validation failed:', result.error.issues);
          return {
            success: false,
            error: 'Datos inválidos. Revisá el formulario.',
            code: 'VALIDATION',
            issues: result.error.issues,
          };
        }
        parsed = result.data;
      } else {
        parsed = rawInput as TInput;
      }

      // 3) Ejecutar acción
      try {
        return await fn(parsed, ctx);
      } catch (err) {
        return failureFromUnknown(err) as TOutput | AdminActionFailure;
      }
    };
  };
}
