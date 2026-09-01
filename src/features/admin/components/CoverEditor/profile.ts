import {
  HERO_IMAGE_WIDTH_PX,
  HERO_MIN_HEIGHT_PX,
  liveHeroCropAspect,
} from '@/features/landing/components/HeroSection/frame';
import {
  BANNER_DESKTOP_MIN_HEIGHT_PX,
  BANNER_IMAGE_WIDTH_PX,
  liveBannerCropAspect,
} from '@/features/landing/components/PromoBanners/frame';
import {
  liveTestimonialCropAspect,
  TESTIMONIAL_CROP_HINT,
  TESTIMONIAL_FILE_NAME,
  TESTIMONIAL_IMAGE_WIDTH_PX,
} from '@/features/landing/components/TestimonialsGallery/frame';

export interface CoverCropProfile {
  fileName: string;
  getAspect: () => number;
  hint: string;
  outputWidth: number;
}

export const HERO_COVER_CROP: CoverCropProfile = {
  fileName: 'hero.jpg',
  getAspect: liveHeroCropAspect,
  hint: `${HERO_IMAGE_WIDTH_PX} × ${HERO_MIN_HEIGHT_PX} px o más`,
  outputWidth: HERO_IMAGE_WIDTH_PX,
};

export const BANNER_COVER_CROP: CoverCropProfile = {
  fileName: 'banner.jpg',
  getAspect: liveBannerCropAspect,
  hint: `${BANNER_IMAGE_WIDTH_PX} × ${BANNER_DESKTOP_MIN_HEIGHT_PX} px o más`,
  outputWidth: BANNER_IMAGE_WIDTH_PX,
};

export const TESTIMONIAL_COVER_CROP: CoverCropProfile = {
  fileName: TESTIMONIAL_FILE_NAME,
  getAspect: liveTestimonialCropAspect,
  hint: TESTIMONIAL_CROP_HINT,
  outputWidth: TESTIMONIAL_IMAGE_WIDTH_PX,
};
