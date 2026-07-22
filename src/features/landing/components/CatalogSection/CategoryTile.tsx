import { ArrowRight, Flower2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Category } from '@/features/catalog/types';

interface CategoryTileProps {
  category: Category;
  layoutClasses: string;
}

const SIZES = '(max-width: 639px) 72vw, (max-width: 1023px) 45vw, 22vw';

export default function CategoryTile({ category, layoutClasses }: CategoryTileProps) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className={`group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary) ${layoutClasses}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-(--color-surface)">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes={SIZES}
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Flower2 className="h-12 w-12 text-(--color-secondary) opacity-50" />
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="font-heading text-lg text-(--color-dark)">{category.name}</h3>
        {category.priceFrom !== undefined && category.priceFrom > 0 && (
          <p className="mt-1 text-sm text-(--color-muted)">
            Desde S/ {Math.round(category.priceFrom)}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] text-(--color-primary) uppercase transition-colors group-hover:text-(--color-accent)">
          Ver arreglos
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
