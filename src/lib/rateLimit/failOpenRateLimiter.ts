import type { RateLimitDecision, RateLimiter, RateLimitPolicy } from './types';

export function createFailOpenRateLimiter(
  inner: RateLimiter,
  onError: (error: unknown, scope: string) => void,
): RateLimiter {
  return {
    async hit(scope: string, key: string, policy: RateLimitPolicy): Promise<RateLimitDecision> {
      try {
        return await inner.hit(scope, key, policy);
      } catch (error) {
        onError(error, scope);
        return { allowed: true, count: 0 };
      }
    },
  };
}
