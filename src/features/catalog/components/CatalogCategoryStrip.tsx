import Link from 'next/link';

import { catalogPillClass } from '@/features/catalog/components/catalogPill';
import type { Category } from '@/features/catalog/types';

interface CatalogCategoryStripProps {
  categories: Category[];
  activeSlug?: string;
}

export default function CatalogCategoryStrip({
  categories,
  activeSlug,
}: CatalogCategoryStripProps) {
  return (
    <nav aria-label="Categorías del catálogo">
      <ul className="-mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <li key={category.id} className="snap-start">
              <Link
                href={`/catalogo/${category.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={catalogPillClass(isActive ? 'active' : 'idle')}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
