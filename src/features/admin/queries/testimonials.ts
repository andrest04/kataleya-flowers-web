import { type Testimonial, testimonialRepository } from '@/lib/database/repositories/testimonials';

export type { Testimonial };

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  return testimonialRepository.list();
}

export async function getAdminTestimonialById(id: string): Promise<Testimonial | null> {
  return testimonialRepository.findById(id);
}
