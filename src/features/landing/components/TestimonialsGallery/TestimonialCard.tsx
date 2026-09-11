import { Star } from 'lucide-react';
import { type ReactNode } from 'react';

import Image from '@/components/ui/AppwriteImage';
import type { TestimonialView } from '@/features/landing/queries/getPublishedTestimonials';

interface TestimonialPhoto {
  alt: string;
  id: string;
  rotation: number;
  src: string;
}

interface PhotoCardProps {
  photo: TestimonialPhoto;
  position: 'back-left' | 'back-right' | 'front';
}

const POSITION_CLASSES = {
  'back-left':
    'translate-x-1 -translate-y-1 -rotate-6 md:group-hover:-translate-x-3 md:group-hover:-translate-y-2 md:group-hover:-rotate-10 md:group-focus-within:-translate-x-3 md:group-focus-within:-translate-y-2 md:group-focus-within:-rotate-10',
  'back-right':
    '-translate-x-1 -translate-y-1 rotate-6 md:group-hover:translate-x-3 md:group-hover:-translate-y-2 md:group-hover:rotate-10 md:group-focus-within:translate-x-3 md:group-focus-within:-translate-y-2 md:group-focus-within:rotate-10',
  front: 'md:group-hover:-translate-y-2 md:group-hover:scale-[1.02] md:group-focus-within:-translate-y-2 md:group-focus-within:scale-[1.02]',
};

const STACK_ROTATIONS = [-2, 1, 2] as const;

function photosFromSrc(id: string, src: string, alt: string): [TestimonialPhoto, TestimonialPhoto, TestimonialPhoto] {
  return [
    { alt, id: `${id}-back-left`, rotation: STACK_ROTATIONS[0], src },
    { alt, id: `${id}-front`, rotation: STACK_ROTATIONS[1], src },
    { alt, id: `${id}-back-right`, rotation: STACK_ROTATIONS[2], src },
  ];
}

function PhotoCard({ photo, position }: PhotoCardProps) {
  const isFront = position === 'front';

  return (
    <div
      aria-hidden={!isFront}
      className="absolute inset-0"
      style={{ transform: `rotate(${photo.rotation}deg)` }}
    >
      <div
        className={`h-full overflow-hidden rounded-3xl bg-(--color-surface) shadow-lg outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-700 ease-out motion-reduce:transition-none transform-gpu ${POSITION_CLASSES[position]}`}
      >
        {photo.src ? (
          <Image
            src={photo.src}
            alt={isFront ? photo.alt : ''}
            fill
            sizes="(min-width: 1024px) 210px, (min-width: 640px) 36vw, 220px"
            className="object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

interface TestimonialCardProps {
  cover?: ReactNode;
  testimonial: TestimonialView;
}

export default function TestimonialCard({ cover, testimonial }: TestimonialCardProps) {
  const [leftPhoto, frontPhoto, rightPhoto] = photosFromSrc(
    testimonial.id,
    testimonial.photoSrc,
    testimonial.photoAlt,
  );
  const stars = Math.min(5, Math.max(1, testimonial.stars || 5));

  return (
    <article className="group flex flex-col items-center text-center">
      <div className="relative mb-7 block h-52 w-44 rounded-3xl sm:h-60 sm:w-52">
        <PhotoCard photo={leftPhoto} position="back-left" />
        <PhotoCard photo={rightPhoto} position="back-right" />
        <PhotoCard photo={frontPhoto} position="front" />
        {cover}
      </div>

      <h3 className="font-heading text-2xl text-(--color-primary)">{testimonial.name}</h3>
      <p className="mt-1 text-xs font-semibold tracking-wide text-(--color-muted)">
        {`Compra verificada · ${testimonial.occasion}`}
      </p>
      <div
        className="mt-3 flex gap-0.5 text-(--color-secondary)"
        role="img"
        aria-label={`${stars} de 5 estrellas`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < stars ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <blockquote className="mt-4 max-w-72 text-sm leading-6 text-(--color-dark)">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </article>
  );
}
