import { randomUUID } from 'node:crypto';

import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import type { EmailMessage } from '@/lib/email';
import { emailProvider } from '@/lib/email';

import {
  businessNotificationEmail,
  type ComplaintEmailData,
  consumerCopyEmail,
} from './templates';

interface SendComplaintEmailsOptions {
  includeConsumerCopy: boolean;
}

export async function sendComplaintEmails(
  data: ComplaintEmailData,
  complaintId: string,
  { includeConsumerCopy }: SendComplaintEmailsOptions = { includeConsumerCopy: true },
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
  const business = businessNotificationEmail(data, complaintId, provider);
  const messages: EmailMessage[] = [
    {
      from,
      to: [businessInbox],
      subject: business.subject,
      html: business.html,
      headers: { 'X-Entity-Ref-ID': randomUUID() },
    },
  ];

  if (includeConsumerCopy) {
    const consumer = consumerCopyEmail(data, provider);
    messages.unshift({
      from,
      to: [data.consumerEmail],
      subject: consumer.subject,
      html: consumer.html,
      headers: { 'X-Entity-Ref-ID': randomUUID() },
    });
  } else {
    console.warn('[complaints] consumer copy skipped: recipient or daily cap reached', { complaintId });
  }

  const result = await emailProvider.sendBatch(messages);

  if (!result.ok) {
    console.error('[complaints] Email provider error:', result.error);
    return false;
  }
  return includeConsumerCopy;
}
