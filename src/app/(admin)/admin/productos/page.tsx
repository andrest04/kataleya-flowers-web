import Link from 'next/link';
import { Suspense } from 'react';

import ProductListClient from '@/features/admin/components/ProductListClient';
import { getAdminCategories } from '@/features/admin/queries/categories';
import { getAdminProducts } from '@/features/admin/queries/products';
import {
  buildAdminProductsHref,
  getAdminProductFilterMeta,
  parseAdminProductFilter,
} from '@/features/admin/utils/adminFilters';

interface AdminProductosPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminProductosPage({
  searchParams,
}: AdminProductosPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = parseAdminProductFilter(resolvedSearchParams.filter);

  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  const baseFilteredProducts = products.filter((product) => {
    switch (activeFilter) {
      case 'missing-gallery':
        return product.is_active && (product.product_images?.length ?? 0) <= 1;
      default:
        return true;
    }
  });

  const filterMeta = activeFilter
    ? getAdminProductFilterMeta(activeFilter)
    : null;
  const clearFilterHref = buildAdminProductsHref({ categorySlug: null });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-2xl font-serif font-semibold"
            style={{ color: 'var(--color-dark)' }}
          >
            Productos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {baseFilteredProducts.length} producto{baseFilteredProducts.length !== 1 ? 's' : ''}{' '}
            {activeFilter ? 'en el filtro actual' : 'en total'}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
          }}
        >
          + Nuevo producto
        </Link>
      </div>

      <Suspense>
        <ProductListClient
          products={baseFilteredProducts}
          categories={categories}
          activeFilter={activeFilter}
          filterMeta={filterMeta}
          clearFilterHref={clearFilterHref}
        />
      </Suspense>
    </div>
  );
}
