import { randomUUID } from 'node:crypto';

import { resend } from '@/lib/resend';

import {
  businessNotificationEmail,
  type ComplaintEmailData,
  consumerCopyEmail,
} from './templates';

/**
 * Envía (en una sola llamada batch) la copia de la hoja al consumidor y el
 * aviso al negocio. Nunca lanza: devuelve `false` si falla, para que la action
 * pueda avisar al consumidor sin perder el reclamo ya persistido.
 */
export async function sendComplaintEmails(
  data: ComplaintEmailData,
  complaintId: string,
): Promise<boolean> {
  const from = process.env.RESEND_FROM_EMAIL;
  const businessInbox = process.env.COMPLAINTS_NOTIFY_EMAIL;

  if (!from || !businessInbox) {
    console.error('[complaints] RESEND_FROM_EMAIL o COMPLAINTS_NOTIFY_EMAIL no configurados');
    return false;
  }

  const consumer = consumerCopyEmail(data);
  const business = businessNotificationEmail(data, complaintId);

  try {
    const { error } = await resend.batch.send([
      {
        from,
        to: [data.consumerEmail],
        subject: consumer.subject,
        html: consumer.html,
        // Evita que Gmail agrupe los correos en un mismo hilo.
        headers: { 'X-Entity-Ref-ID': randomUUID() },
      },
      {
        from,
        to: [businessInbox],
        subject: business.subject,
        html: business.html,
        headers: { 'X-Entity-Ref-ID': randomUUID() },
      },
    ]);

    if (error) {
      console.error('[complaints] Resend error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[complaints] Resend threw:', err);
    return false;
  }
}
