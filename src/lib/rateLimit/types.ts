export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  count: number;
}

export interface RateLimiter {
  hit(scope: string, key: string, policy: RateLimitPolicy): Promise<RateLimitDecision>;
}
