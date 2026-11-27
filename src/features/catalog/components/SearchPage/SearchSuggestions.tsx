import type { ReactElement } from 'react';

import type { CatalogCollectionItem } from '@/features/catalog/components/CatalogCollection';
import CatalogCollectionCard from '@/features/catalog/components/CatalogCollectionCard';

interface SearchSuggestionsProps {
  items: CatalogCollectionItem[];
}

export default function SearchSuggestions({ items }: SearchSuggestionsProps): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="buscar-sugeridos" className="mt-12 overflow-x-clip sm:mt-16">
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-(--color-primary)" />
      <div className="mx-auto max-w-[110rem] pt-10 sm:pt-12">
        <h2
          id="buscar-sugeridos"
          className="font-heading text-[28px] leading-[1.25] text-(--color-dark) sm:text-[32px] lg:text-[40px]"
        >
          También te puede gustar
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {items.map(({ product, categorySlug }) => (
            <li key={product.id} className="min-w-0">
              <CatalogCollectionCard product={product} categorySlug={categorySlug} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
