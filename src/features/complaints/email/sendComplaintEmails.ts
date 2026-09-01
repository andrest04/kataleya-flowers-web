import { randomUUID } from 'node:crypto';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { emailProvider } from '@/lib/email';

import {
  businessNotificationEmail,
  type ComplaintEmailData,
  consumerCopyEmail,
} from './templates';

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

  const settings = await getSiteSettings();
  const provider = {
    address: settings.address,
    name: settings.name,
    razonSocial: settings.razonSocial,
    ruc: settings.ruc,
    website: settings.website,
  };
  const consumer = consumerCopyEmail(data, provider);
  const business = businessNotificationEmail(data, complaintId, provider);

  const result = await emailProvider.sendBatch([
    {
      from,
      to: [data.consumerEmail],
      subject: consumer.subject,
      html: consumer.html,
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

  if (!result.ok) {
    console.error('[complaints] Email provider error:', result.error);
    return false;
  }
  return true;
}
