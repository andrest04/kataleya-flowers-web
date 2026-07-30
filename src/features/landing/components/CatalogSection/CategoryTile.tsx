import { Flower2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Category } from '@/features/catalog/types';

interface CategoryTileProps {
  category: Category;
  layoutClasses: string;
}

const SIZES = '(max-width: 639px) 73vw, (max-width: 1023px) 44vw, 320px';

export default function CategoryTile({ category, layoutClasses }: CategoryTileProps) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className={`group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary) ${layoutClasses}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-(--color-surface) outline outline-1 -outline-offset-1 outline-black/10">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes={SIZES}
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Flower2 className="h-12 w-12 text-(--color-secondary) opacity-50" />
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
        <h3 className="font-heading text-2xl text-(--color-dark) transition-colors group-hover:text-(--color-primary)">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
