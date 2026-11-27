import { Star } from 'lucide-react';
import { type ReactNode } from 'react';

import Image from '@/components/ui/StoredImage';
import type { TestimonialView } from '@/features/landing/queries/getPublishedTestimonials';
import { resolveTestimonialStars } from '@/features/landing/rules/testimonialStars';

interface TestimonialCardProps {
  cover?: ReactNode;
  testimonial: TestimonialView;
}

export default function TestimonialCard({ cover, testimonial }: TestimonialCardProps) {
  const stars = resolveTestimonialStars(testimonial.stars);

  return (
    <article className="group flex flex-col items-center text-center">
      {testimonial.photoSrc ? (
        <div className="relative mb-7 block h-52 w-44 sm:h-60 sm:w-52">
          <div
            aria-hidden="true"
            className="absolute inset-0 -rotate-3 rounded-3xl bg-[color-mix(in_srgb,var(--color-secondary)_22%,var(--color-cream))] transition-transform duration-700 ease-out motion-reduce:transition-none transform-gpu md:group-hover:-rotate-6 md:group-focus-within:-rotate-6"
          />
          <div className="absolute inset-0 rotate-1 transition-transform duration-700 ease-out motion-reduce:transition-none transform-gpu md:group-hover:-translate-y-2 md:group-hover:rotate-2 md:group-focus-within:-translate-y-2 md:group-focus-within:rotate-2">
            <div className="relative h-full overflow-hidden rounded-3xl bg-(--color-surface) shadow-lg outline outline-1 -outline-offset-1 outline-black/10">
              <Image
                src={testimonial.photoSrc}
                alt={testimonial.photoAlt}
                fill
                sizes="(min-width: 1024px) 210px, (min-width: 640px) 36vw, 220px"
                className="object-cover"
              />
            </div>
          </div>
          {cover}
        </div>
      ) : null}

      <h3 className="font-heading text-2xl text-(--color-primary)">{testimonial.name}</h3>
      {testimonial.occasion ? (
        <p className="mt-1 text-xs font-semibold tracking-wide text-(--color-muted)">{testimonial.occasion}</p>
      ) : null}
      {stars === null ? null : (
        <div
          className="mt-3 flex gap-0.5 text-(--color-gold-text)"
          role="img"
          aria-label={`${stars} de 5 estrellas`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${index < stars ? 'fill-(--color-secondary)' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
      <blockquote className="mt-4 max-w-72 text-sm leading-6 text-pretty text-(--color-dark)">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </article>
  );
}
