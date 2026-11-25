import { documentStore } from '@/lib/database';

import { createDocumentStoreRateLimiter } from './documentStoreRateLimiter';
import type { RateLimiter } from './types';

export const rateLimiter: RateLimiter = createDocumentStoreRateLimiter(documentStore);

export { clientKeyFromHeaders } from './clientKey';
export { createDocumentStoreRateLimiter } from './documentStoreRateLimiter';
export { createFailOpenRateLimiter } from './failOpenRateLimiter';
export type { RateLimitDecision, RateLimiter, RateLimitPolicy } from './types';
