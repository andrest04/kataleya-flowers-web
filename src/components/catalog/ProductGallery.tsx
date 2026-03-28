'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  imageUrl: string;
  images?: string[];
  name: string;
}

export function ProductGallery({ imageUrl, images, name }: ProductGalleryProps) {
  const allImages = images && images.length > 0 ? [imageUrl, ...images] : null;
  const [selected, setSelected] = useState(imageUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative w-full aspect-[4/3] lg:aspect-square rounded-lg overflow-hidden cursor-zoom-in"
          style={{ backgroundColor: 'var(--color-surface)' }}
          aria-label={`Ver imagen completa de ${name}`}
        >
          <Image
            src={selected}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </button>

        {allImages && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(img)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selected === img
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/40'
                }`}
                aria-label={`Ver imagen ${i + 1} de ${name}`}
              >
                <Image
                  src={img}
                  alt={`${name} — vista ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-dark) 85%, transparent)' }}
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Imagen completa de ${name}`}
          >
            {/* Imagen */}
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full max-w-5xl max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selected}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-contain"
              />
            </m.div>

            {/* Botón cerrar — flota sobre el backdrop, siempre visible */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="fixed top-4 right-4 md:top-6 md:right-6 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-dark) 50%, transparent)' }}
              aria-label="Cerrar imagen"
            >
              <svg className="w-5 h-5" style={{ color: 'var(--color-white)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
