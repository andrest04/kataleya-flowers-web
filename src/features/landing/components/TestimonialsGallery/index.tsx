'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { TestimonialView } from '@/features/landing/queries/getPublishedTestimonials';

import TestimonialCard from './TestimonialCard';

interface TestimonialsGalleryProps {
  testimonials: readonly TestimonialView[];
}

export default function TestimonialsGallery({ testimonials }: TestimonialsGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];

  function showTestimonial(direction: number) {
    setActiveIndex((currentIndex) => (currentIndex + direction + testimonials.length) % testimonials.length);
  }

  return (
    <div className="mx-auto mt-12 max-w-8xl px-4 sm:px-6 lg:px-8">
      <div
        id="testimonios-galeria"
        className="flex flex-wrap justify-center gap-x-6 gap-y-14 md:gap-x-10 lg:gap-x-16"
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`w-72 ${index === activeIndex ? 'block' : 'hidden md:block'}`}
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

      {testimonials.length < 2 ? null : (
        <div className="mt-10 flex items-center justify-center gap-4 md:hidden" aria-label="Navegación de testimonios">
          <button
            type="button"
            aria-controls="testimonios-galeria"
            aria-label="Ver testimonio anterior"
            onClick={() => showTestimonial(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-cream) text-(--color-primary) shadow-sm transition-colors hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <p aria-live="polite" className="min-w-24 text-center text-sm font-semibold text-(--color-primary)">
            {activeIndex + 1} de {testimonials.length}
            <span className="sr-only">: {activeTestimonial.name}</span>
          </p>
          <button
            type="button"
            aria-controls="testimonios-galeria"
            aria-label="Ver siguiente testimonio"
            onClick={() => showTestimonial(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-cream) text-(--color-primary) shadow-sm transition-colors hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
