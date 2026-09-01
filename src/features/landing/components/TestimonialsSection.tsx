import { getPublishedTestimonials } from '@/features/landing/queries/getPublishedTestimonials';

import TestimonialsGallery from './TestimonialsGallery';

interface TestimonialsSectionProps {
  location: string;
}

export default async function TestimonialsSection({ location }: TestimonialsSectionProps) {
  const testimonials = await getPublishedTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonios"
      className="scroll-mt-20 bg-(--color-cream) pt-8 pb-16"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl text-balance text-(--color-primary) sm:text-4xl">
          {`Clientas felices eligiendo flores para celebrar en ${location}`}
        </h2>
      </div>

      <TestimonialsGallery testimonials={testimonials} />
    </section>
  );
}
