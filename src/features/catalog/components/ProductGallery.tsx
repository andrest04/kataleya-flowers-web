'use client';

import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState } from 'react';

import Image from '@/components/ui/AppwriteImage';
import LightboxDialog from '@/components/ui/LightboxDialog';

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
  const currentSrc = allImages[index] ?? imageUrl;

  const goPrev = () => setIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const goNext = () => setIndex((i) => (i + 1) % allImages.length);

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
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label={`Ver imagen completa de ${name}`}
          aria-haspopup="dialog"
          aria-expanded={lightboxOpen}
        >
          <Image
            src={currentSrc}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </button>

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
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none focus-visible:ring-2"
              style={overlayButtonStyle}
              aria-label={`Imagen anterior de ${name}`}
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none focus-visible:ring-2"
              style={overlayButtonStyle}
              aria-label={`Siguiente imagen de ${name}`}
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>

            <div
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium pointer-events-none"
              style={overlayButtonStyle}
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
