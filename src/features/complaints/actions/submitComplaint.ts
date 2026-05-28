'use server';

import { createClient } from '@/lib/supabase/server';

import { sendComplaintEmails } from '../email/sendComplaintEmails';
import { complaintSubmitSchema } from '../schemas/complaint';
import type { ComplaintSubmitResult } from '../types';
import { formatComplaintNumber } from '../utils/format';

/**
 * Action PÚBLICA (sin auth) del Libro de Reclamaciones.
 *
 * Persiste el reclamo vía la RPC `create_complaint` (SECURITY DEFINER, que
 * devuelve el número correlativo porque anon no puede hacer SELECT) y luego
 * envía los correos de forma síncrona. Si el correo falla, el reclamo ya quedó
 * guardado: devolvemos `emailSent: false` para avisar al consumidor.
 */
export async function submitComplaint(
  input: unknown,
): Promise<ComplaintSubmitResult> {
  const parsed = complaintSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Revisa los datos del formulario.',
      code: 'VALIDATION',
      issues: parsed.error.issues,
    };
  }

  const data = parsed.data;

  try {
    const supabase = await createClient();

    const { data: rows, error } = await supabase.rpc('create_complaint', {
      p_consumer_name: data.consumerName,
      p_consumer_doc_type: data.consumerDocType,
      p_consumer_doc_number: data.consumerDocNumber,
      p_consumer_address: data.consumerAddress,
      p_consumer_email: data.consumerEmail,
      p_item_type: data.itemType,
      p_item_description: data.itemDescription,
      p_complaint_type: data.complaintType,
      p_detail: data.detail,
      p_consumer_request: data.consumerRequest,
      p_consumer_phone: data.consumerPhone || undefined,
      p_is_minor: data.isMinor,
      p_guardian_name: data.isMinor ? data.guardianName || undefined : undefined,
      p_claimed_amount: data.claimedAmount,
    });

    const created = rows?.[0];
    if (error || !created) {
      console.error('[submitComplaint] rpc error:', error);
      return {
        success: false,
        error: 'No se pudo registrar tu reclamación. Intenta de nuevo en unos minutos.',
        code: 'INTERNAL',
      };
    }

    const complaintNumber = formatComplaintNumber(
      created.correlativo,
      created.created_at,
    );

    const emailSent = await sendComplaintEmails(
      { ...data, complaintNumber, createdAt: created.created_at },
      created.id,
    );

    return { success: true, complaintNumber, createdAt: created.created_at, emailSent };
  } catch (err) {
    console.error('[submitComplaint] unexpected error:', err);
    return {
      success: false,
      error: 'No se pudo registrar tu reclamación. Intenta de nuevo en unos minutos.',
      code: 'INTERNAL',
    };
  }
}
