import Link from 'next/link';
import { getAdminProducts } from '@/features/admin/queries/products';
import { getAdminCategories } from '@/features/admin/queries/categories';
import { getProductIdsWithViewsInRange } from '@/features/admin/queries/adminFilters';
import ProductTable from '@/features/admin/components/ProductTable';
import { parseAnalyticsRange } from '@/features/admin/components/dashboard/analyticsRange';
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
  const analyticsRange = parseAnalyticsRange(resolvedSearchParams.range);

  const [products, categories, viewedProductIds] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    activeFilter === 'featured-without-views' || activeFilter === 'active-without-views'
      ? getProductIdsWithViewsInRange(analyticsRange)
      : Promise.resolve(new Set<string>()),
  ]);

  const rawCategorySlug = Array.isArray(resolvedSearchParams.categoria)
    ? resolvedSearchParams.categoria[0]
    : resolvedSearchParams.categoria;
  const activeCategory = categories.find((category) => category.slug === rawCategorySlug) ?? null;

  const baseFilteredProducts = products.filter((product) => {
    switch (activeFilter) {
      case 'missing-gallery':
        return product.is_active && product.images.length === 0;
      case 'featured-without-views':
        return product.is_featured && !viewedProductIds.has(product.id);
      case 'active-without-views':
        return product.is_active && !viewedProductIds.has(product.id);
      default:
        return true;
    }
  });

  const categoryCounts = new Map<string, number>();
  for (const product of baseFilteredProducts) {
    categoryCounts.set(product.category_id, (categoryCounts.get(product.category_id) ?? 0) + 1);
  }

  const filteredProducts = activeCategory
    ? baseFilteredProducts.filter((product) => product.category_id === activeCategory.id)
    : baseFilteredProducts;

  const filterMeta = activeFilter
    ? getAdminProductFilterMeta(activeFilter, analyticsRange)
    : null;
  const clearFilterHref = buildAdminProductsHref({ categorySlug: activeCategory?.slug ?? null });

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
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
            {activeCategory
              ? ` en ${activeCategory.name}`
              : activeFilter
                ? ' en el filtro actual'
                : ' en total'}
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

      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>
            Categorías
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Usá la categoría como eje principal para ordenar el trabajo antes de aplicar filtros más finos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildAdminProductsHref({
              filter: activeFilter,
              range: analyticsRange,
              categorySlug: null,
            })}
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
            Todas ({baseFilteredProducts.length})
          </Link>

          {categories.map((category) => {
            const isActive = activeCategory?.id === category.id;
            const count = categoryCounts.get(category.id) ?? 0;

            return (
              <Link
                key={category.id}
                href={buildAdminProductsHref({
                  filter: activeFilter,
                  range: analyticsRange,
                  categorySlug: category.slug,
                })}
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
              </Link>
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
                Además, el listado está acotado a la categoría <span style={{ color: 'var(--color-dark)' }}>{activeCategory.name}</span>.
              </p>
            ) : null}
          </div>

          <Link
            href={clearFilterHref}
            className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-75"
            style={{ color: 'var(--color-primary)' }}
          >
            Ver todos los productos
          </Link>
        </div>
      ) : null}

      <ProductTable
        products={filteredProducts}
        categories={categories}
        activeFilter={activeFilter}
        viewedProductIds={[...viewedProductIds]}
        emptyMessage={filterMeta?.emptyMessage}
        clearFilterHref={filterMeta ? clearFilterHref : undefined}
      />
    </div>
  );
}
