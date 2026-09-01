export const DISCOVER_CROP_ASPECT = 4 / 5;
export const DISCOVER_IMAGE_WIDTH_PX = 960;
export const DISCOVER_IMAGE_HEIGHT_PX = 1200;
export const DISCOVER_FILE_NAME = 'descubrir.jpg';
export const DISCOVER_CROP_HINT = `${DISCOVER_IMAGE_WIDTH_PX} × ${DISCOVER_IMAGE_HEIGHT_PX} px o más`;

export function liveDiscoverCropAspect(): number {
  return DISCOVER_CROP_ASPECT;
}
