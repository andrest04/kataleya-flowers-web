export function resolveTestimonialStars(stars: number | null | undefined): number | null {
  if (typeof stars !== 'number' || !Number.isFinite(stars) || stars < 1) return null;
  return Math.min(5, Math.round(stars));
}
