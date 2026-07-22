'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface Testimonial {
  id: string;
  name: string;
  detail: string;
  quote: string;
  photos: readonly TestimonialPhoto[];
}

interface TestimonialPhoto {
  id: string;
  src: string;
  alt: string;
  rotation: number;
}

interface TestimonialsGalleryProps {
  testimonials: readonly Testimonial[];
}

interface PhotoCardProps {
  photo: TestimonialPhoto;
  position: 'back-left' | 'back-right' | 'front';
}

function PhotoCard({ photo, position }: PhotoCardProps) {
  const isFront = position === 'front';
  const positionClasses = {
    'back-left':
      '-translate-x-6 -translate-y-1 sm:-translate-x-8 md:group-hover:-translate-x-11 md:group-hover:-translate-y-4 md:group-focus-within:-translate-x-11 md:group-focus-within:-translate-y-4',
    'back-right':
      'translate-x-6 translate-y-1 sm:translate-x-8 md:group-hover:translate-x-11 md:group-hover:translate-y-4 md:group-focus-within:translate-x-11 md:group-focus-within:translate-y-4',
    front: 'md:group-hover:-translate-y-2 md:group-hover:scale-[1.02] md:group-focus-within:-translate-y-2 md:group-focus-within:scale-[1.02]',
  };

  return (
    <div
      aria-hidden={!isFront}
      className={isFront ? 'absolute inset-y-0 inset-x-3' : 'absolute inset-0'}
      style={{ transform: `rotate(${photo.rotation}deg)` }}
    >
      <div
        className={`h-full overflow-hidden rounded-2xl bg-(--color-surface) shadow-lg transition-transform duration-500 ease-out motion-reduce:transition-none ${positionClasses[position]}`}
      >
        <Image
          src={photo.src}
          alt={isFront ? photo.alt : ''}
          fill
          sizes="(min-width: 1024px) 260px, (min-width: 640px) 42vw, 280px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [leftPhoto, frontPhoto, rightPhoto] = testimonial.photos;

  return (
    <article className="group flex flex-col items-center text-center">
      <Link
        href="/catalogo"
        aria-label={`Explorar arreglos de Kataleya como el de ${testimonial.name}`}
        className="relative mb-7 block h-64 w-56 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-(--color-primary) sm:h-72 sm:w-64"
      >
        <PhotoCard photo={leftPhoto} position="back-left" />
        <PhotoCard photo={rightPhoto} position="back-right" />
        <PhotoCard photo={frontPhoto} position="front" />
      </Link>

      <h3 className="font-heading text-2xl text-(--color-primary)">{testimonial.name}</h3>
      <p className="mt-1 text-xs font-semibold tracking-wide text-(--color-muted)">{testimonial.detail}</p>
      <div className="mt-3 flex gap-0.5 text-(--color-secondary)" aria-label="5 de 5 estrellas">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="mt-4 max-w-64 text-sm leading-6 text-(--color-dark)">&ldquo;{testimonial.quote}&rdquo;</blockquote>
    </article>
  );
}

export default function TestimonialsGallery({ testimonials }: TestimonialsGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const activeTestimonial = testimonials[activeIndex];

  function showTestimonial(direction: number) {
    setActiveIndex((currentIndex) => (currentIndex + direction + testimonials.length) % testimonials.length);
  }

  return (
    <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div id="testimonios-galeria" className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4 lg:gap-x-24">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className={index === activeIndex ? 'block' : 'hidden md:block'}>
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>

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
    </div>
  );
}
