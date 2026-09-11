"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import Link from "next/link";

import type { SearchSuggestions } from "@/features/catalog/actions/getSearchSuggestions";
import CatalogCollectionCard from "@/features/catalog/components/CatalogCollectionCard";

import { PANEL_CONTAINER } from "./constants";
import SearchSuggestionsSkeleton from "./SearchSuggestionsSkeleton";

interface SearchSuggestionsPanelProps {
  suggestions: SearchSuggestions | null;
  onNavigate: () => void;
}

export default function SearchSuggestionsPanel({
  suggestions,
  onNavigate,
}: SearchSuggestionsPanelProps) {
  if (!suggestions) return <SearchSuggestionsSkeleton />;

  const featuredCategories = suggestions.categories.filter(
    (category) => category.isFeatured,
  );
  const categoryById = new Map(
    suggestions.categories.map((category) => [category.id, category]),
  );

  if (featuredCategories.length === 0 && suggestions.products.length === 0) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className={`${PANEL_CONTAINER} pt-6 pb-15`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-10">
          {featuredCategories.length > 0 && (
            <div className="lg:w-64 lg:shrink-0">
              <h3 className="mb-6 font-body text-sm font-semibold text-(--color-dark)">
                Categorías destacadas
              </h3>
              <ul className="flex flex-wrap items-start gap-3 lg:flex-col">
                {featuredCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/catalogo/${category.slug}`}
                      onClick={onNavigate}
                      className="inline-block rounded-md border border-(--color-border) px-4 py-2 font-body text-sm text-(--color-dark) transition-colors duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div className="min-w-0 flex-1">
              <h3 className="mb-6 font-body text-sm font-semibold text-(--color-dark)">
                Más vendidos
              </h3>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
                {suggestions.products.map((product, index) => {
                  const categorySlug = categoryById.get(product.categoryId)?.slug;
                  if (!categorySlug) return null;

                  return (
                    <m.div
                      key={product.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                    >
                      <CatalogCollectionCard
                        product={product}
                        categorySlug={categorySlug}
                        size="compact"
                        onClick={onNavigate}
                      />
                    </m.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
