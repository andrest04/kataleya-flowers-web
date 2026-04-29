import type { User } from '@supabase/supabase-js';
import type { ZodIssue, ZodSchema } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AdminSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface AdminActionContext {
  user: User;
  supabase: AdminSupabaseClient;
}

/**
 * Resultado canónico de las Server Actions admin.
 *
 * Conservamos `success` + `error` para no romper la API pública existente
 * (componentes que ya consumen las actions). Agregamos `code` e `issues`
 * para diferenciar errores de auth, validación e infraestructura sin filtrar
 * detalles internos de Supabase al cliente.
 */
export interface AdminActionFailure {
  success: false;
  error: string;
  code?: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION' | 'INTERNAL';
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
 * Verifica que haya sesión válida y devuelve el contexto admin
 * (`user` + `supabase`).
 *
 * TODO Fase 5: chequear rol admin específico cuando se modele en DB
 * (`app_metadata.role === 'admin'` o tabla `admin_users`).
 *
 * Se prefiere `auth.getUser()` (no `getSession()`) para forzar verificación
 * contra Supabase Auth Server, igual que en `(admin)/layout.tsx` y `proxy.ts`.
 */
export async function requireAdmin(): Promise<AdminActionContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AdminAuthError('UNAUTHENTICATED', 'Sesión inválida o expirada');
  }
  return { user: data.user, supabase };
}

/**
 * Convierte un error desconocido en un `AdminActionFailure` con mensaje
 * genérico — NO filtra mensajes crudos de Supabase al cliente.
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
 * Mapea un error de Supabase a un mensaje genérico, sin exponer el detalle
 * interno (estructura de DB, índices, columnas) al cliente.
 *
 * Casos conocidos:
 *  - `23505` → conflicto de unique constraint (ej: slug duplicado)
 *  - `23503` → FK violation (ej: categoría inexistente)
 */
export function describeSupabaseError(error: { code?: string; message?: string }): string {
  console.error('[admin-action] supabase error:', error);
  switch (error.code) {
    case '23505':
      return 'Ya existe un registro con esos datos.';
    case '23503':
      return 'Referencia inválida — el recurso relacionado no existe.';
    default:
      return 'No se pudo completar la operación. Intentá de nuevo.';
  }
}

/**
 * Wrapper de Server Actions que exige sesión válida y valida el input
 * con un schema zod opcional ANTES de tocar la DB.
 *
 * Uso:
 * ```ts
 * export const createProduct = withAdminAuth(productCreateSchema)(
 *   async (data, { supabase, user }) => {
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
    fn: (input: TInput, ctx: AdminActionContext) => Promise<TOutput>,
  ): (input: unknown) => Promise<TOutput | AdminActionFailure> {
    return async (rawInput: unknown) => {
      // 1) Auth check (defense-in-depth)
      let ctx: AdminActionContext;
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
