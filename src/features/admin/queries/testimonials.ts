import { findTestimonialById, listTestimonials } from '@/lib/appwrite/repositories/testimonials';
import type { TestimonialRow } from '@/lib/db/rows';

export async function getAdminTestimonials(): Promise<TestimonialRow[]> {
  return listTestimonials();
}

export async function getAdminTestimonialById(id: string): Promise<TestimonialRow | null> {
  return findTestimonialById(id);
}
