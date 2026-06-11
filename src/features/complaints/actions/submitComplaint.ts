'use server';

import { isAppwriteBackend } from '@/lib/appwrite/config';
import {
  allocateCorrelativo,
  insertComplaint,
} from '@/lib/appwrite/repositories/complaints';
import { createClient } from '@/lib/supabase/server';

import { sendComplaintEmails } from '../email/sendComplaintEmails';
import { complaintSubmitSchema } from '../schemas/complaint';
import type { ComplaintSubmitResult } from '../types';
import { formatComplaintNumber } from '../utils/format';

/**
 * Action PÚBLICA (sin auth) del Libro de Reclamaciones.
 *
 * Persiste el reclamo vía la RPC `create_complaint` (Supabase, SECURITY
 * DEFINER) o vía atomic correlativo allocation + document insert (Appwrite),
 * luego envía los correos de forma síncrona. Si el correo falla, el reclamo ya
 * quedó guardado: devolvemos `emailSent: false` para avisar al consumidor.
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

  if (isAppwriteBackend()) {
    return submitComplaintAppwrite(data);
  }

  return submitComplaintSupabase(data);
}

// ─── Appwrite path ────────────────────────────────────────────────────────────

async function submitComplaintAppwrite(
  data: ReturnType<typeof complaintSubmitSchema.parse>,
): Promise<ComplaintSubmitResult> {
  try {
    const year = new Date().getFullYear();
    const correlativo = await allocateCorrelativo(year);

    const created = await insertComplaint({
      correlativo,
      complaint_type: data.complaintType,
      consumer_name: data.consumerName,
      consumer_doc_type: data.consumerDocType,
      consumer_doc_number: data.consumerDocNumber,
      consumer_email: data.consumerEmail,
      consumer_phone: data.consumerPhone || null,
      consumer_address: data.consumerAddress,
      is_minor: data.isMinor,
      guardian_name: data.isMinor ? data.guardianName || null : null,
      item_type: data.itemType,
      item_description: data.itemDescription,
      claimed_amount: data.claimedAmount ?? null,
      detail: data.detail,
      consumer_request: data.consumerRequest,
    });

    const complaintNumber = formatComplaintNumber(created.correlativo, created.created_at);

    const emailSent = await sendComplaintEmails(
      { ...data, complaintNumber, createdAt: created.created_at },
      created.id,
    );

    return {
      success: true,
      complaintNumber,
      createdAt: created.created_at,
      emailSent,
    };
  } catch (err) {
    console.error('[submitComplaint/appwrite] unexpected error:', err);
    return {
      success: false,
      error: 'No se pudo registrar tu reclamación. Intenta de nuevo en unos minutos.',
      code: 'INTERNAL',
    };
  }
}

// ─── Supabase path (unchanged) ────────────────────────────────────────────────

async function submitComplaintSupabase(
  data: ReturnType<typeof complaintSubmitSchema.parse>,
): Promise<ComplaintSubmitResult> {
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
