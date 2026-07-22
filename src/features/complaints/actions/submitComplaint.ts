'use server';

import {
  allocateCorrelativo,
  insertComplaint,
} from '@/lib/appwrite/repositories/complaints';

import { sendComplaintEmails } from '../email/sendComplaintEmails';
import { complaintSubmitSchema } from '../schemas/complaint';
import type { ComplaintSubmitResult } from '../types';
import { formatComplaintNumber } from '../utils/format';
import { checkComplaintRateLimit, getClientIp } from '../utils/rateLimit';

export async function submitComplaint(
  input: unknown,
): Promise<ComplaintSubmitResult> {
  const ip = await getClientIp();
  if (!checkComplaintRateLimit(ip)) {
    return {
      success: false,
      error: 'Alcanzaste el límite de reclamos por ahora. Intenta de nuevo en unos minutos.',
      code: 'RATE_LIMITED',
    };
  }

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
    console.error('[submitComplaint] unexpected error:', err);
    return {
      success: false,
      error: 'No se pudo registrar tu reclamación. Intenta de nuevo en unos minutos.',
      code: 'INTERNAL',
    };
  }
}
