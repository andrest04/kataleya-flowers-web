'use client';

import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';

import type { Category } from '@/features/catalog/types';
import {
  BEST_SELLERS_ALL_TAB,
  type BestSellersByTab,
} from '@/features/catalog/utils/pickBestSellers';

import BestSellerProductCard from './BestSellerProductCard';

const CATEGORY_QUERY_PARAM = 'bestsellers';

function subscribeToNothing() {
  return () => {
    return undefined;
  };
}

function getCategoryParamSnapshot(): string | null {
  return new URLSearchParams(window.location.search).get(CATEGORY_QUERY_PARAM);
}

function getServerCategoryParamSnapshot(): string | null {
  return null;
}

type BestSellersTabCategory = Pick<Category, 'id' | 'name' | 'slug'>;

interface BestSellersTabsProps {
  bestSellersByTab: BestSellersByTab;
  tabCategories: BestSellersTabCategory[];
}

export default function BestSellersTabs({ bestSellersByTab, tabCategories }: BestSellersTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const categoryParam = useSyncExternalStore(
    subscribeToNothing,
    getCategoryParamSnapshot,
    getServerCategoryParamSnapshot,
  );
  const [userSelectedCategoryId, setUserSelectedCategoryId] = useState<
    string | null | undefined
  >(undefined);

  const paramCategoryId = categoryParam
    ? (tabCategories.find((category) => category.slug === categoryParam)?.id ?? null)
    : null;
  const activeCategoryId =
    userSelectedCategoryId === undefined ? paramCategoryId : userSelectedCategoryId;

  const selectCategory = (categoryId: string | null) => {
    setUserSelectedCategoryId(categoryId);
    const slug = categoryId
      ? tabCategories.find((category) => category.id === categoryId)?.slug
      : null;
    const params = new URLSearchParams(window.location.search);
    if (slug) {
      params.set(CATEGORY_QUERY_PARAM, slug);
    } else {
      params.delete(CATEGORY_QUERY_PARAM);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const visibleProducts = bestSellersByTab[activeCategoryId ?? BEST_SELLERS_ALL_TAB] ?? [];
  const categorySlugById = new Map(tabCategories.map(({ id, slug }) => [id, slug]));

  return (
    <>
      <div className="mt-7 flex items-end justify-between gap-6 border-b border-(--color-border) pb-4 sm:mt-8">
        <div className="relative min-w-0 flex-1">
          <nav
            aria-label="Categorías de productos más vendidos"
            className="flex min-w-0 gap-5 overflow-x-auto whitespace-nowrap pr-2 font-body text-xs font-semibold uppercase tracking-[0.12em] text-(--color-muted) sm:gap-7 sm:text-sm"
          >
            <button
              type="button"
              onClick={() => selectCategory(null)}
              aria-current={activeCategoryId === null ? 'true' : undefined}
              className="shrink-0 px-2 py-2.5 transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary) aria-[current=true]:text-(--color-dark)"
            >
              Todos
            </button>
            {tabCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                aria-current={activeCategoryId === category.id ? 'true' : undefined}
                className="shrink-0 px-2 py-2.5 transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary) aria-[current=true]:text-(--color-dark)"
              >
                {category.name}
              </button>
            ))}
          </nav>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-(--color-cream) to-transparent"
          />
        </div>
        <Link
          href="/catalogo"
          className="shrink-0 border-b border-(--color-primary) px-2 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-(--color-primary) transition-colors hover:border-(--color-accent) hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary) sm:text-sm"
        >
          Ver todo
        </Link>
      </div>

      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          <m.div
            key={activeCategoryId ?? BEST_SELLERS_ALL_TAB}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="scrollbar-hide mt-8 flex snap-x snap-mandatory gap-4 overflow-x-scroll pb-6 sm:mt-10 sm:gap-6"
            role="region"
            aria-label="Productos más vendidos"
          >
            {visibleProducts.map((product) => (
              <BestSellerProductCard
                key={product.id}
                product={product}
                categorySlug={categorySlugById.get(product.categoryId)}
              />
            ))}
          </m.div>
        </AnimatePresence>
      </LazyMotion>
    </>
  );
}
