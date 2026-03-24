'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  imageUrl: string;
  images?: string[];
  name: string;
}

export function ProductGallery({ imageUrl, images, name }: ProductGalleryProps) {
  const allImages = images && images.length > 0 ? [imageUrl, ...images] : null;
  const [selected, setSelected] = useState(imageUrl);

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/3] lg:aspect-square rounded-lg overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <Image
          src={selected}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

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
  );
}
