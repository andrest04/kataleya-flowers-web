import { resendEmailProvider } from './resendProvider';
import type { EmailProvider } from './types';

export type { EmailMessage, EmailProvider } from './types';

export const emailProvider: EmailProvider = resendEmailProvider;
