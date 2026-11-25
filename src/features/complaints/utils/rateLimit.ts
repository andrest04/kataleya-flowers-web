import { headers } from 'next/headers';

import type { RateLimitPolicy } from '@/lib/rateLimit';
import { clientKeyFromHeaders, createFailOpenRateLimiter, rateLimiter } from '@/lib/rateLimit';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export const COMPLAINT_IP_POLICY: RateLimitPolicy = { limit: 3, windowMs: 15 * MINUTE_MS };
export const COMPLAINT_RECIPIENT_POLICY: RateLimitPolicy = { limit: 3, windowMs: DAY_MS };
export const CONSUMER_COPY_GLOBAL_POLICY: RateLimitPolicy = { limit: 200, windowMs: DAY_MS };

const CONSUMER_COPY_GLOBAL_KEY = 'all';

const complaintLimiter = createFailOpenRateLimiter(rateLimiter, (error, scope) => {
  console.error(`[complaints] rate limiter unavailable for ${scope}, allowing request:`, error);
});

export async function getClientKey(): Promise<string> {
  return clientKeyFromHeaders(await headers());
}

export async function isComplaintSubmissionAllowed(clientKey: string): Promise<boolean> {
  const { allowed } = await complaintLimiter.hit('complaint-ip', clientKey, COMPLAINT_IP_POLICY);
  return allowed;
}

export async function isConsumerCopyAllowed(consumerEmail: string): Promise<boolean> {
  const recipient = await complaintLimiter.hit(
    'complaint-recipient',
    consumerEmail.trim().toLowerCase(),
    COMPLAINT_RECIPIENT_POLICY,
  );
  if (!recipient.allowed) return false;

  const global = await complaintLimiter.hit(
    'complaint-consumer-copy-global',
    CONSUMER_COPY_GLOBAL_KEY,
    CONSUMER_COPY_GLOBAL_POLICY,
  );
  return global.allowed;
}
