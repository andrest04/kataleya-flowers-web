import { Resend } from 'resend';

import type { EmailMessage, EmailProvider } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

export const resendEmailProvider: EmailProvider = {
  async sendBatch(messages: EmailMessage[]) {
    try {
      const { error } = await resend.batch.send(
        messages.map((message) => ({
          from: message.from,
          to: message.to,
          subject: message.subject,
          html: message.html,
          headers: message.headers,
        })),
      );

      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { ok: false, error: message };
    }
  },
};
