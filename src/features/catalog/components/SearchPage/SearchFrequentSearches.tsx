import Link from 'next/link';

import type { Category } from '@/features/catalog/types';

interface SearchFrequentSearchesProps {
  categories: Category[];
}

export default function SearchFrequentSearches({
  categories,
}: SearchFrequentSearchesProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="buscar-frecuentes" className="text-center">
      <h2
        id="buscar-frecuentes"
        className="font-heading text-[22px] leading-[1.25] text-(--color-dark)"
      >
        Búsquedas frecuentes
      </h2>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/catalogo/${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-md border border-(--color-border) px-5 py-2.5 font-body text-sm text-(--color-dark) transition-colors hover:border-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
