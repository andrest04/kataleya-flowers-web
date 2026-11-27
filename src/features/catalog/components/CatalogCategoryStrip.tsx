import Link from 'next/link';

import type { Category } from '@/features/catalog/types';

interface CatalogCategoryStripProps {
  categories: Category[];
}

export default function CatalogCategoryStrip({ categories }: CatalogCategoryStripProps) {
  return (
    <nav aria-label="Categorías del catálogo">
      <ul className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/catalogo/${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-(--color-border) px-5 font-heading text-lg text-(--color-dark) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
