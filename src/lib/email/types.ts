export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export interface EmailProvider {
  sendBatch(messages: EmailMessage[]): Promise<{ ok: true } | { ok: false; error: string }>;
}
