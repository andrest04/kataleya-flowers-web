import Link from 'next/link';

import Image from '@/components/ui/AppwriteImage';
import type { Category } from '@/features/catalog/types';

interface CatalogCategoryStripProps {
  categories: Category[];
}

export default function CatalogCategoryStrip({ categories }: CatalogCategoryStripProps) {
  const visibleCategories = categories.filter((category) => category.slug !== 'condolencias');

  return (
    <nav aria-label="Categorías del catálogo" className="overflow-hidden">
      <ul className="flex gap-3 overflow-x-auto pb-3 pe-12 sm:grid sm:grid-cols-3 sm:pe-0 lg:grid-cols-5">
        {visibleCategories.map((category) => (
          <li key={category.id} className="w-[80vw] max-w-[22rem] shrink-0 sm:w-auto sm:max-w-none">
            <Link
              href={`/catalogo/${category.slug}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-primary)"
            >
              <span className="relative block aspect-[291/317] overflow-hidden rounded-xl bg-(--color-surface)">
                <Image
                  src={category.imageUrl || '/catalog-placeholder.svg'}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 30vw, 17vw"
                />
              </span>
              <span className="mt-6 block text-center font-heading text-2xl leading-none text-(--color-dark)">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
