import { requireAdmin } from '@/features/admin/utils/auth';
import { type Testimonial, testimonialRepository } from '@/lib/database/repositories/testimonials';

export type { Testimonial };

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  await requireAdmin();
  return testimonialRepository.list();
}

export async function getAdminTestimonialById(id: string): Promise<Testimonial | null> {
  await requireAdmin();
  return testimonialRepository.findById(id);
}
