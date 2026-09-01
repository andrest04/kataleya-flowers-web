export const BANNER_IMAGE_WIDTH_PX = 1600;
export const BANNER_DESKTOP_MIN_HEIGHT_PX = 1200;

export function bannerCropAspect(viewportWidth = 1280): number {
  return viewportWidth >= 640 ? 4 / 3 : 3 / 4;
}

export function liveBannerCropAspect(): number {
  if (typeof window === 'undefined') return bannerCropAspect();
  return bannerCropAspect(window.innerWidth);
}
