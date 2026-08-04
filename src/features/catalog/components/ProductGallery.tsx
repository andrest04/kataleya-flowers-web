'use client';

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
  const [selected, setSelected] = useState(imageUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedIndex = Math.max(0, allImages.indexOf(selected));

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative w-full aspect-[4/3] lg:aspect-square rounded-lg overflow-hidden cursor-zoom-in"
          style={{ backgroundColor: 'var(--color-surface)' }}
          aria-label={`Ver imagen completa de ${name}`}
          aria-haspopup="dialog"
          aria-expanded={lightboxOpen}
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

        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setSelected(img)}
                aria-pressed={selected === img}
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

      <LightboxDialog
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={allImages}
        initialIndex={selectedIndex}
        alt={name}
      />
    </>
  );
}
