import { ArrowRight, Flower2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Category } from '@/features/catalog/types';

import type { TileVariant } from './gridLayout';

interface CategoryTileProps {
  category: Category;
  variant: TileVariant;
  /** Layout-context classes (sizing/aspect + bento span) — owned by the orchestrator. */
  layoutClasses: string;
}

const SIZES: Record<TileVariant, string> = {
  hero: '(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 50vw',
  standard: '(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 25vw',
  // Wide tile spans the full max-w-7xl container (~1216px), not the viewport.
  wide: '(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 1216px',
};

export default function CategoryTile({ category, variant, layoutClasses }: CategoryTileProps) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className={`group relative block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary) ${layoutClasses}`}
    >
      {category.imageUrl ? (
        <>
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes={SIZES[variant]}
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.06]"
          />
          {/* Bottom scrim so the cream label stays readable on any photo */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--color-dark) 62%, transparent) 0%, color-mix(in srgb, var(--color-dark) 24%, transparent) 45%, transparent 72%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-dark) 16%, transparent)',
            }}
          />
        </>
      ) : (
        // Dark fallback keeps the overlaid cream label readable without a photo
        <div className="absolute inset-0 flex items-center justify-center bg-(--color-dark)">
          <Flower2 className="h-12 w-12 text-(--color-secondary) opacity-40" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
        <h3
          className={`font-heading text-(--color-cream) ${
            variant === 'hero' ? 'text-2xl lg:text-3xl' : 'text-2xl'
          }`}
        >
          {category.name}
        </h3>
        {category.priceFrom !== undefined && category.priceFrom > 0 && (
          <p className="mt-1 text-sm font-semibold text-(--color-secondary)">
            Desde S/ {Math.round(category.priceFrom)}
          </p>
        )}
        <span className="mt-3 hidden items-center gap-1.5 text-xs font-semibold tracking-[0.15em] uppercase text-(--color-cream) opacity-0 transition-all duration-300 group-hover:opacity-100 motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0 lg:flex">
          Ver arreglos
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
