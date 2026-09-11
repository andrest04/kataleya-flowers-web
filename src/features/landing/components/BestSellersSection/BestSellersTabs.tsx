'use client';

import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import Link from 'next/link';
import { useMemo,useState } from 'react';

import type { Category, Product } from '@/features/catalog/types';
import { pickBestSellers } from '@/features/catalog/utils/pickBestSellers';

import BestSellerProductCard from './BestSellerProductCard';

interface BestSellersTabsProps {
  products: Product[];
  categoryById: Record<string, Category>;
  tabCategories: Category[];
}

export default function BestSellersTabs({
  products,
  categoryById,
  tabCategories,
}: BestSellersTabsProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const visibleProducts = useMemo(() => {
    const scoped = activeCategoryId
      ? products.filter((product) => product.categoryId === activeCategoryId)
      : products;
    return pickBestSellers(scoped);
  }, [products, activeCategoryId]);

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
              onClick={() => setActiveCategoryId(null)}
              aria-current={activeCategoryId === null ? 'true' : undefined}
              className="shrink-0 transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary) aria-[current=true]:text-(--color-dark)"
            >
              Todos
            </button>
            {tabCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                aria-current={activeCategoryId === category.id ? 'true' : undefined}
                className="shrink-0 transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary) aria-[current=true]:text-(--color-dark)"
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
          className="shrink-0 border-b border-(--color-primary) pb-1 font-body text-xs font-semibold uppercase tracking-[0.14em] text-(--color-primary) transition-colors hover:border-(--color-accent) hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary) sm:text-sm"
        >
          Ver todo
        </Link>
      </div>

      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          <m.div
            key={activeCategoryId ?? 'all'}
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
                categorySlug={categoryById[product.categoryId]?.slug}
              />
            ))}
          </m.div>
        </AnimatePresence>
      </LazyMotion>
    </>
  );
}
