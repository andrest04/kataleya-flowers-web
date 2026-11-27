import type { ReactElement } from 'react';

import Carousel from '@/components/ui/Carousel';
import type { CatalogCollectionItem } from '@/features/catalog/components/CatalogCollection';
import CatalogCollectionCard from '@/features/catalog/components/CatalogCollectionCard';

interface SearchSuggestionsProps {
  items: CatalogCollectionItem[];
}

export default function SearchSuggestions({ items }: SearchSuggestionsProps): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="buscar-sugeridos" className="mt-12 overflow-x-hidden sm:mt-16">
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-(--color-primary)" />
      <div className="pt-10 sm:pt-12">
        <h2
          id="buscar-sugeridos"
          className="font-heading text-[28px] leading-[1.25] text-(--color-dark) sm:text-[32px] lg:text-[40px]"
        >
          También te puede gustar
        </h2>
        <Carousel ariaLabel="También te puede gustar">
          {items.map(({ product, categorySlug }) => (
            <div
              key={product.id}
              className="w-[80vw] shrink-0 snap-start sm:w-[50vw] lg:w-[24rem]"
            >
              <CatalogCollectionCard product={product} categorySlug={categorySlug} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
