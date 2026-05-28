import { Resend } from 'resend';

/**
 * Cliente Resend compartido. La API key se inyecta server-side
 * (`RESEND_API_KEY`); nunca se expone al cliente.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);
