'use server';

import { revalidatePath } from 'next/cache';

import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import { updateComplaintDocument } from '@/lib/appwrite/repositories/complaints';

import { complaintStatusUpdateSchema } from '../schemas/complaint';

interface SuccessResult {
  success: true;
}
type ComplaintActionResult = SuccessResult | AdminActionFailure;

export async function updateComplaint(
  input: unknown,
): Promise<ComplaintActionResult> {
  try {
    await requireAdmin();

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

    await updateComplaintDocument(id, {
      status,
      provider_response: providerResponse?.trim() || null,
      responded_at: respondedAt,
    });

    revalidatePath('/admin/reclamos');
    revalidatePath(`/admin/reclamos/${id}`);
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
