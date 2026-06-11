'use server';

import { revalidatePath } from 'next/cache';

import {
  type AdminActionContext,
  type AdminActionFailure,
  type AppwriteAdminActionContext,
  describeSupabaseError,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { isAppwriteBackend } from '@/lib/appwrite/config';
import { updateComplaintDocument } from '@/lib/appwrite/repositories/complaints';

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
    const respondedAt = status === 'RESPONDIDO' ? new Date().toISOString() : null;

    if (isAppwriteBackend()) {
      const _ctx = ctx as AppwriteAdminActionContext;
      void _ctx; // context authenticated — updateComplaintDocument uses admin client internally

      await updateComplaintDocument(id, {
        status,
        provider_response: providerResponse?.trim() || null,
        responded_at: respondedAt,
      });

      revalidatePath('/admin/reclamos');
      revalidatePath(`/admin/reclamos/${id}`);
      return { success: true };
    }

    // ─── Supabase path (unchanged) ───────────────────────────────────────────
    const { supabase } = ctx as AdminActionContext;

    const { error } = await supabase
      .from('complaints')
      .update({
        status,
        provider_response: providerResponse?.trim() || null,
        responded_at: respondedAt,
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
