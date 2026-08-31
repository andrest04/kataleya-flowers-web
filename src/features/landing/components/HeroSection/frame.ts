export const HERO_MIN_HEIGHT_PX = 585;
export const HERO_IMAGE_WIDTH_PX = 1920;

export const HERO_IMAGE_CLASS = 'object-cover object-[var(--hero-focus)]';

export const HERO_SCRIM =
  'linear-gradient(to right, color-mix(in srgb, var(--color-dark) 55%, transparent) 0%, color-mix(in srgb, var(--color-dark) 18%, transparent) 45%, transparent 70%)';

export function heroCropAspect(viewportWidth = 1280): number {
  return viewportWidth / HERO_MIN_HEIGHT_PX;
}
