'use server';

import { revalidatePath } from 'next/cache';

import {
  type AdminActionFailure,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';

import { complaintStatusUpdateSchema } from '../schemas/complaint';

interface SuccessResult {
  success: true;
}
type ComplaintActionResult = SuccessResult | AdminActionFailure;

/**
 * Actualiza el estado y la respuesta del proveedor de un reclamo (solo admin).
 */
export async function updateComplaint(
  input: unknown,
): Promise<ComplaintActionResult> {
  try {
    const ctx = await requireAdmin();

    const parsed = complaintStatusUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Datos inválidos. Revisa el formulario.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      };
    }

    const { id, status, providerResponse } = parsed.data;
    const { supabase } = ctx;

    const { error } = await supabase
      .from('complaints')
      .update({
        status,
        provider_response: providerResponse?.trim() || null,
        responded_at: status === 'RESPONDIDO' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        error: describeSupabaseError(error),
        code: 'INTERNAL',
      };
    }

    revalidatePath('/admin/reclamos');
    revalidatePath(`/admin/reclamos/${id}`);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
