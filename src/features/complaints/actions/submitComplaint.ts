'use server';

import { complaintsRepository } from '@/lib/database/repositories/complaints';

import { sendComplaintEmails } from '../email/sendComplaintEmails';
import { complaintSubmitSchema } from '../schemas/complaint';
import type { ComplaintSubmitResult } from '../types';
import { formatComplaintNumber } from '../utils/format';
import { checkComplaintRateLimit, getClientIp } from '../utils/rateLimit';

// Libro de Reclamaciones: legally public, rate-limited instead of gated
// react-doctor-disable-next-line react-doctor/server-auth-actions
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
    const correlativo = await complaintsRepository.allocateCorrelativo(year);

    const created = await complaintsRepository.insert({
      correlativo,
      complaintType: data.complaintType,
      consumerName: data.consumerName,
      consumerDocType: data.consumerDocType,
      consumerDocNumber: data.consumerDocNumber,
      consumerEmail: data.consumerEmail,
      consumerPhone: data.consumerPhone || null,
      consumerAddress: data.consumerAddress,
      isMinor: data.isMinor,
      guardianName: data.isMinor ? data.guardianName || null : null,
      itemType: data.itemType,
      itemDescription: data.itemDescription,
      claimedAmount: data.claimedAmount ?? null,
      detail: data.detail,
      consumerRequest: data.consumerRequest,
    });

    const complaintNumber = formatComplaintNumber(created.correlativo, created.createdAt);

    const emailSent = await sendComplaintEmails(
      { ...data, complaintNumber, createdAt: created.createdAt },
      created.id,
    );

    return {
      success: true,
      complaintNumber,
      createdAt: created.createdAt,
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
