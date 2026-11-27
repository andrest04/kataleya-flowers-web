import { describe, expect, it } from 'vitest';

import { resolveTestimonialStars } from './testimonialStars';

describe('resolveTestimonialStars', () => {
  it('returns null when no rating was entered', () => {
    expect(resolveTestimonialStars(0)).toBeNull();
    expect(resolveTestimonialStars(undefined)).toBeNull();
    expect(resolveTestimonialStars(Number.NaN)).toBeNull();
  });

  it('keeps valid ratings', () => {
    expect(resolveTestimonialStars(3)).toBe(3);
    expect(resolveTestimonialStars(5)).toBe(5);
  });

  it('clamps out-of-range ratings to 1-5', () => {
    expect(resolveTestimonialStars(9)).toBe(5);
    expect(resolveTestimonialStars(-2)).toBeNull();
  });
});
