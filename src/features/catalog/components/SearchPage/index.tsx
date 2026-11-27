import type { ReactElement } from 'react';

import CatalogCollection, {
  type CatalogCollectionItem,
} from '@/features/catalog/components/CatalogCollection';
import type { CatalogColorFacet } from '@/features/catalog/components/CatalogFilterSheet';
import SearchEmptyResults from '@/features/catalog/components/SearchPage/SearchEmptyResults';
import SearchFrequentSearches from '@/features/catalog/components/SearchPage/SearchFrequentSearches';
import SearchStoreForm from '@/features/catalog/components/SearchPage/SearchStoreForm';
import SearchSuggestions from '@/features/catalog/components/SearchPage/SearchSuggestions';
import type { Category } from '@/features/catalog/types';

interface SearchPageProps {
  query: string;
  results: CatalogCollectionItem[];
  suggestionItems: CatalogCollectionItem[];
  frequentCategories: Category[];
  matchedCategory: Category | null;
  filterCategories: Category[];
  colors: CatalogColorFacet[];
  flowerTypes: string[];
  whatsappHref: string;
  initialQuery: {
    category: string;
    priceMin: string;
    priceMax: string;
    colors: string;
    flowerTypes: string;
    sort: string;
    density: string;
  };
}

export default function SearchPage({
  query,
  results,
  suggestionItems,
  frequentCategories,
  matchedCategory,
  filterCategories,
  colors,
  flowerTypes,
  whatsappHref,
  initialQuery,
}: SearchPageProps): ReactElement {
  const hasQuery = query.length > 0;
  const hasActiveFilters = Object.entries(initialQuery).some(
    ([key, value]) => key !== 'density' && key !== 'sort' && value.length > 0,
  );
  const announcement = !hasQuery
    ? ''
    : results.length === 0
      ? `Sin resultados para ${query}`
      : `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'} para ${query}`;

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-(--color-cream) px-4 pb-16 pt-6 sm:px-12 lg:px-16"
    >
      <header className="mx-auto max-w-8xl">
        <h1 className="text-center font-heading text-[28px] leading-[1.25] text-balance break-words text-(--color-dark) sm:text-[32px] lg:text-[40px]">
          {hasQuery ? `Resultados para “${query}”` : 'Busca en la tienda'}
        </h1>
        <SearchStoreForm query={query} announcement={announcement} />
      </header>

      {hasQuery ? (
        <div
          className={`mx-auto max-w-[110rem] ${results.length > 0 ? 'mt-16 sm:mt-20' : 'mt-10 sm:mt-12'}`}
        >
          {results.length > 0 ? (
            <CatalogCollection
              items={results}
              categories={filterCategories}
              colors={colors}
              flowerTypes={flowerTypes}
              initialQuery={initialQuery}
              whatsappHref={whatsappHref}
            />
          ) : (
            <>
              <SearchEmptyResults
                query={query}
                categories={frequentCategories}
                matchedCategory={matchedCategory}
                hasActiveFilters={hasActiveFilters}
                whatsappHref={whatsappHref}
              />
              <SearchSuggestions items={suggestionItems} />
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mx-auto mt-8 max-w-8xl">
            <SearchFrequentSearches categories={frequentCategories} />
          </div>
          <SearchSuggestions items={suggestionItems} />
        </>
      )}
    </main>
  );
}
