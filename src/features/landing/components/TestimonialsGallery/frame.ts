export const TESTIMONIAL_CROP_ASPECT = 11 / 13;
export const TESTIMONIAL_IMAGE_WIDTH_PX = 880;
export const TESTIMONIAL_IMAGE_HEIGHT_PX = 1040;
export const TESTIMONIAL_FILE_NAME = 'testimonio.jpg';
export const TESTIMONIAL_CROP_HINT = `${TESTIMONIAL_IMAGE_WIDTH_PX} × ${TESTIMONIAL_IMAGE_HEIGHT_PX} px o más`;

export function liveTestimonialCropAspect(): number {
  return TESTIMONIAL_CROP_ASPECT;
}
