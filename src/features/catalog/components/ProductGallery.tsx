'use client';

import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import LightboxDialog from '@/components/ui/LightboxDialog';
import Image from '@/components/ui/StoredImage';

interface ProductGalleryProps {
  imageUrl: string;
  images?: string[];
  name: string;
}

export function ProductGallery({ imageUrl, images, name }: ProductGalleryProps) {
  const allImages = images && images.length > 0 ? [imageUrl, ...images] : [imageUrl];
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = allImages.length > 1;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback(
    (target: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const clamped = (target + allImages.length) % allImages.length;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      container.scrollTo({
        left: clamped * container.clientWidth,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
      setIndex(clamped);
    },
    [allImages.length],
  );

  const goPrev = () => scrollToIndex(index - 1);
  const goNext = () => scrollToIndex(index + 1);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) return;
    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);
    const clamped = Math.min(Math.max(nextIndex, 0), allImages.length - 1);
    setIndex((prev) => (prev === clamped ? prev : clamped));
  }, [allImages.length]);

  const overlayButtonStyle: React.CSSProperties = {
    backgroundColor: 'color-mix(in srgb, var(--color-dark) 50%, transparent)',
    color: 'var(--color-white)',
  };

  return (
    <>
      <div
        className="relative w-full aspect-[4/3] lg:aspect-square rounded-lg overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide flex h-full w-full snap-x snap-mandatory overflow-x-auto"
        >
          {allImages.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative h-full w-full flex-none snap-start cursor-zoom-in outline-none focus-visible:ring-2"
              aria-label={`Ver imagen ${i + 1} de ${allImages.length} de ${name}`}
              aria-haspopup="dialog"
              aria-expanded={lightboxOpen}
            >
              <Image
                src={src}
                alt={`${name} - foto ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div
          className="absolute bottom-3 left-3 flex items-center justify-center w-9 h-9 rounded-full pointer-events-none"
          style={overlayButtonStyle}
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-dark/50 text-white transition-colors hover:bg-dark/70 outline-none focus-visible:ring-2"
              aria-label={`Imagen anterior de ${name}`}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-dark/50 text-white transition-colors hover:bg-dark/70 outline-none focus-visible:ring-2"
              aria-label={`Siguiente imagen de ${name}`}
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>

            <div
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium pointer-events-none"
              style={overlayButtonStyle}
              role="status"
              aria-live="polite"
            >
              {index + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      <LightboxDialog
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={allImages}
        initialIndex={index}
        alt={name}
      />
    </>
  );
}
