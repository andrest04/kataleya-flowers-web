import Link from 'next/link';

import CategoryList from '@/features/admin/components/CategoryList';
import { getCategoryIdsWithActiveProducts } from '@/features/admin/queries/adminFilters';
import { getAdminCategories } from '@/features/admin/queries/categories';
import {
  getAdminCategoryFilterMeta,
  parseAdminCategoryFilter,
} from '@/features/admin/utils/adminFilters';

interface AdminCategoriasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCategoriasPage({
  searchParams,
}: AdminCategoriasPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = parseAdminCategoryFilter(resolvedSearchParams.filter);

  const [categories, activeCategoryIds] = await Promise.all([
    getAdminCategories(),
    activeFilter === 'without-active-products'
      ? getCategoryIdsWithActiveProducts()
      : Promise.resolve(new Set<string>()),
  ]);

  const filteredCategories = categories.filter((category) => {
    switch (activeFilter) {
      case 'without-active-products':
        return !activeCategoryIds.has(category.id);
      default:
        return true;
    }
  });

  const filterMeta = activeFilter ? getAdminCategoryFilterMeta(activeFilter) : null;
  const clearFilterHref = '/admin/categorias';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-2xl font-serif font-semibold"
            style={{ color: 'var(--color-dark)' }}
          >
            Categorías
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {filteredCategories.length} categoría{filteredCategories.length !== 1 ? 's' : ''}
            {activeFilter ? ' en el filtro actual' : ' en total'}
          </p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
          }}
        >
          + Nueva categoría
        </Link>
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
          </div>

          <Link
            href={clearFilterHref}
            className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver todas las categorías
          </Link>
        </div>
      ) : null}

      <CategoryList
        categories={filteredCategories}
        emptyMessage={filterMeta?.emptyMessage}
        clearFilterHref={filterMeta ? clearFilterHref : undefined}
      />
    </div>
  );
}
