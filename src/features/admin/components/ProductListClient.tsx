'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import type { AdminProductRow } from '@/features/admin/queries/products';
import type { AdminProductFilter } from '@/features/admin/utils/adminFilters';
import type { CategoryRow } from '@/lib/db/rows';

import ProductTable from './ProductTable';

interface ProductFilterMeta {
  label: string;
  description: string;
  emptyMessage: string;
}

interface ProductListClientProps {
  products: AdminProductRow[];
  categories: CategoryRow[];
  activeFilter: AdminProductFilter | null;
  filterMeta: ProductFilterMeta | null;
  clearFilterHref: string;
}

export default function ProductListClient({
  products,
  categories,
  activeFilter,
  filterMeta,
  clearFilterHref,
}: ProductListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategorySlug = searchParams.get('categoria');
  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === activeCategorySlug) ?? null,
    [categories, activeCategorySlug],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      activeCategory
        ? products.filter((p) => p.category_id === activeCategory.id)
        : products,
    [products, activeCategory],
  );

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set('categoria', slug);
      } else {
        params.delete('categoria');
      }
      const query = params.toString();
      router.replace(query ? `?${query}` : '/admin/productos', { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <>
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>
            Categor&iacute;as
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Us&aacute; la categor&iacute;a como eje principal para ordenar el trabajo antes de aplicar filtros m&aacute;s finos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange(null)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={
              activeCategory === null
                ? {
                    background: 'var(--color-primary)',
                    color: 'var(--color-white)',
                  }
                : {
                    background: 'var(--color-white)',
                    color: 'var(--color-dark)',
                    border: '1px solid var(--color-border)',
                  }
            }
          >
            Todas ({products.length})
          </button>

          {categories.map((category) => {
            const isActive = activeCategory?.id === category.id;
            const count = categoryCounts.get(category.id) ?? 0;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.slug)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={
                  isActive
                    ? {
                        background: 'var(--color-primary)',
                        color: 'var(--color-white)',
                      }
                    : {
                        background: 'var(--color-white)',
                        color: 'var(--color-dark)',
                        border: '1px solid var(--color-border)',
                      }
                }
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filterMeta ? (
        <div
          className="rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          style={{
            background: 'color-mix(in srgb, var(--color-secondary) 10%, var(--color-white))',
            border: '1px solid color-mix(in srgb, var(--color-secondary) 24%, var(--color-border))',
          }}
        >
          <div className="space-y-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: 'color-mix(in srgb, var(--color-secondary) 18%, var(--color-white))',
                color: 'var(--color-dark)',
                border: '1px solid var(--color-border)',
              }}
            >
              Filtro activo: {filterMeta.label}
            </span>
            <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
              {filterMeta.description}
            </p>
            {activeCategory ? (
              <p className="text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
                Adem&aacute;s, el listado est&aacute; acotado a la categor&iacute;a{' '}
                <span style={{ color: 'var(--color-dark)' }}>{activeCategory.name}</span>.
              </p>
            ) : null}
          </div>

          <a
            href={clearFilterHref}
            className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver todos los productos
          </a>
        </div>
      ) : null}

      <ProductTable
        key={activeCategory?.id ?? 'all'}
        products={filteredProducts}
        categories={categories}
        reorderable={activeCategory !== null}
        activeFilter={activeFilter}
        emptyMessage={filterMeta?.emptyMessage}
        clearFilterHref={filterMeta ? clearFilterHref : undefined}
      />
    </>
  );
}
