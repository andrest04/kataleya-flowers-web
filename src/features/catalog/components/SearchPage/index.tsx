import type { ReactElement } from 'react';

import Carousel from '@/components/ui/Carousel';
import CatalogCollection, {
  type CatalogCollectionItem,
} from '@/features/catalog/components/CatalogCollection';
import CatalogCollectionCard from '@/features/catalog/components/CatalogCollectionCard';
import type { CatalogColorFacet } from '@/features/catalog/components/CatalogFilterSheet';
import SearchEmptyResults from '@/features/catalog/components/SearchPage/SearchEmptyResults';
import SearchFrequentSearches from '@/features/catalog/components/SearchPage/SearchFrequentSearches';
import SearchStoreForm from '@/features/catalog/components/SearchPage/SearchStoreForm';
import type { Category } from '@/features/catalog/types';

interface SearchPageProps {
  query: string;
  results: CatalogCollectionItem[];
  suggestionItems: CatalogCollectionItem[];
  frequentCategories: Category[];
  filterCategories: Category[];
  colors: CatalogColorFacet[];
  flowerTypes: string[];
  initialQuery: {
    category: string;
    priceMin: string;
    priceMax: string;
    colors: string;
    flowerTypes: string;
    sort: string;
  };
}

export default function SearchPage({
  query,
  results,
  suggestionItems,
  frequentCategories,
  filterCategories,
  colors,
  flowerTypes,
  initialQuery,
}: SearchPageProps): ReactElement {
  const hasQuery = query.length > 0;

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-(--color-cream) px-2 pb-28 pt-6 lg:px-4"
    >
      <header className="mx-auto max-w-8xl">
        <h1 className="text-center font-heading text-[40px] leading-[1.25] text-(--color-dark)">
          {hasQuery ? `Resultados para “${query}”` : 'Busca en la tienda'}
        </h1>
        <SearchStoreForm query={query} />
      </header>

      {hasQuery ? (
        <div className="mx-auto mt-16 max-w-[110rem] sm:mt-20">
          {results.length > 0 ? (
            <CatalogCollection
              items={results}
              categories={filterCategories}
              colors={colors}
              flowerTypes={flowerTypes}
              initialQuery={initialQuery}
            />
          ) : (
            <SearchEmptyResults query={query} />
          )}
        </div>
      ) : (
        <>
          <div className="mx-auto mt-8 max-w-8xl">
            <SearchFrequentSearches categories={frequentCategories} />
          </div>
          {suggestionItems.length > 0 && (
            <section
              aria-labelledby="buscar-sugeridos"
              className="mt-16 overflow-x-hidden sm:mt-20"
            >
              <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-(--color-primary)" />
              <div className="pt-16 sm:pt-20">
                <h2
                  id="buscar-sugeridos"
                  className="px-8 font-heading text-[40px] leading-[1.25] text-(--color-dark) sm:px-12 lg:px-16"
                >
                  También te puede gustar
                </h2>
                <Carousel ariaLabel="También te puede gustar">
                  {suggestionItems.map(({ product, categorySlug }) => (
                    <div
                      key={product.id}
                      className="w-[80vw] shrink-0 snap-start sm:w-[50vw] lg:w-[24rem]"
                    >
                      <CatalogCollectionCard
                        product={product}
                        categorySlug={categorySlug}
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
