import { unstable_cache } from 'next/cache';

import { listTestimonials } from '@/lib/appwrite/repositories/testimonials';
import { isPublished } from '@/lib/publishing';
import { HOME_TESTIMONIAL_LIMIT } from '@/lib/testimonialLimit';

export interface TestimonialView {
  id: string;
  name: string;
  occasion: string;
  photoAlt: string;
  photoSrc: string;
  quote: string;
  stars: number;
}

export const FALLBACK_TESTIMONIALS: readonly TestimonialView[] = [
  {
    id: 't-001',
    name: 'Mariana R.',
    occasion: 'Cumpleaños',
    photoAlt: 'Clienta con bouquet colorido',
    photoSrc:
      'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c70003d00a730a0/view?project=6a2addf8001b6e77ce0d',
    quote: 'El arreglo llegó precioso y justo a tiempo para hacer el día todavía más especial.',
    stars: 5,
  },
  {
    id: 't-002',
    name: 'Lucía M.',
    occasion: 'Aniversario',
    photoAlt: 'Clienta con dos bouquets y globo corazón',
    photoSrc:
      'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c75000ceb507227/view?project=6a2addf8001b6e77ce0d',
    quote: 'Me ayudaron a elegir flores que se sintieran personales. La presentación fue hermosa.',
    stars: 5,
  },
  {
    id: 't-003',
    name: 'Valeria C.',
    occasion: 'Sorpresa',
    photoAlt: 'Clienta con tulipanes morados',
    photoSrc:
      'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c6f000787c85909/view?project=6a2addf8001b6e77ce0d',
    quote: 'Todo fue muy sencillo desde el pedido hasta la entrega. Volvería a elegirlas sin dudar.',
    stars: 5,
  },
  {
    id: 't-004',
    name: 'Sofía P.',
    occasion: 'Agradecimiento',
    photoAlt: 'Clienta con rosas blancas y rosas',
    photoSrc:
      'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c720016e99bc7bc/view?project=6a2addf8001b6e77ce0d',
    quote: 'Las flores tenían una combinación delicada y fresca. Fue un regalo que encantó.',
    stars: 5,
  },
];

type CachedTestimonialState =
  | { status: 'published'; testimonials: TestimonialView[] }
  | { status: 'fallback' }
  | { status: 'hidden' };

const getCachedTestimonialState = unstable_cache(
  async (): Promise<CachedTestimonialState> => {
    const testimonials = await listTestimonials();
    const now = new Date();
    const published = testimonials.filter((testimonial) => isPublished(testimonial, now));
    if (published.length > 0) {
      return {
        status: 'published',
        testimonials: published.slice(0, HOME_TESTIMONIAL_LIMIT).map((testimonial) => ({
          id: testimonial.id,
          name: testimonial.name,
          occasion: testimonial.occasion,
          photoAlt: testimonial.photo_alt,
          photoSrc: testimonial.photo_url,
          quote: testimonial.quote,
          stars: testimonial.stars,
        })),
      };
    }
    return { status: testimonials.length === 0 ? 'fallback' : 'hidden' };
  },
  ['home-published-testimonials'],
  { tags: ['home-content'], revalidate: 300 },
);

export async function getPublishedTestimonials(): Promise<TestimonialView[]> {
  const state = await getCachedTestimonialState();
  if (state.status === 'published') return state.testimonials;
  if (state.status === 'fallback') return [...FALLBACK_TESTIMONIALS];
  return [];
}
