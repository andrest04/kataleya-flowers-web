'use server';

import { checkBotId } from 'botid/server';

import { complaintsRepository } from '@/lib/database/repositories/complaints';

import { sendComplaintEmails } from '../email/sendComplaintEmails';
import type { ComplaintFormData } from '../schemas/complaint';
import { complaintSubmitSchema } from '../schemas/complaint';
import type { ComplaintFieldIssue, ComplaintSubmitResult } from '../types';
import { formatComplaintNumber, limaYear } from '../utils/format';
import {
  getClientKey,
  isComplaintSubmissionAllowed,
  isConsumerCopyAllowed,
} from '../utils/rateLimit';

const INTERNAL_ERROR = 'No se pudo registrar tu reclamación. Intenta de nuevo en unos minutos.';

interface RegisteredComplaint {
  id: string;
  complaintNumber: string;
  createdAt: string;
}

function toFieldIssues(issues: { path: PropertyKey[]; message: string }[]): ComplaintFieldIssue[] {
  return issues.map(({ path, message }) => ({
    path: path.filter((segment): segment is string | number => typeof segment !== 'symbol'),
    message,
  }));
}

async function registerComplaint(data: ComplaintFormData): Promise<RegisteredComplaint> {
  const year = limaYear(new Date());
  const correlativo = await complaintsRepository.allocateCorrelativo(year);

  const created = await complaintsRepository.insert({
    correlativo,
    correlativoYear: year,
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

  return {
    id: created.id,
    complaintNumber: formatComplaintNumber(created.correlativo, {
      year: created.correlativoYear,
      createdAt: created.createdAt,
    }),
    createdAt: created.createdAt,
  };
}

async function deliverComplaintEmails(
  data: ComplaintFormData,
  complaint: RegisteredComplaint,
): Promise<boolean> {
  try {
    const includeConsumerCopy = await isConsumerCopyAllowed(data.consumerEmail);
    return await sendComplaintEmails(
      { ...data, complaintNumber: complaint.complaintNumber, createdAt: complaint.createdAt },
      complaint.id,
      { includeConsumerCopy },
    );
  } catch (err) {
    console.error('[submitComplaint] email step failed:', { complaintId: complaint.id, err });
    return false;
  }
}

async function recordEmailSent(complaintId: string): Promise<void> {
  try {
    await complaintsRepository.markEmailSent(complaintId);
  } catch (err) {
    console.error('[submitComplaint] could not persist email_sent:', { complaintId, err });
  }
}

// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function submitComplaint(
  input: unknown,
): Promise<ComplaintSubmitResult> {
  const { isBot } = await checkBotId();
  if (isBot) {
    return { success: false, error: INTERNAL_ERROR, code: 'INTERNAL' };
  }

  const parsed = complaintSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Revisa los datos del formulario.',
      code: 'VALIDATION',
      issues: toFieldIssues(parsed.error.issues),
    };
  }

  if (!(await isComplaintSubmissionAllowed(await getClientKey()))) {
    return {
      success: false,
      error: 'Alcanzaste el límite de reclamos por ahora. Intenta de nuevo en unos minutos.',
      code: 'RATE_LIMITED',
    };
  }

  const data = parsed.data;

  let complaint: RegisteredComplaint;
  try {
    complaint = await registerComplaint(data);
  } catch (err) {
    console.error('[submitComplaint] unexpected error:', err);
    return { success: false, error: INTERNAL_ERROR, code: 'INTERNAL' };
  }

  const emailSent = await deliverComplaintEmails(data, complaint);
  if (emailSent) await recordEmailSent(complaint.id);

  return {
    success: true,
    complaintNumber: complaint.complaintNumber,
    createdAt: complaint.createdAt,
    emailSent,
  };
}
