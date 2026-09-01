import ProductFilters from '@/features/admin/components/ProductFilters';
import ProductListClient from '@/features/admin/components/ProductListClient';
import { getAdminCategories } from '@/features/admin/queries/categories';
import { getAdminProductList } from '@/features/admin/queries/products';
import {
  parseAdminProductQuery,
  serializeAdminProductQuery,
} from '@/features/admin/utils/adminFilters';

export const metadata = { title: 'Productos' };

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const EMPTY_MESSAGES: Record<string, string> = {
  filtered: 'No encontramos productos con esos filtros. Prueba limpiarlos.',
  incomplete: '¡Todo en orden! Todos los productos publicados tienen más de una foto.',
  none: 'Todavía no hay productos. Crea el primero desde una categoría.',
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = parseAdminProductQuery(resolvedSearchParams);
  const categories = await getAdminCategories();
  const selectedCategory = query.categorySlug
    ? categories.find((category) => category.slug === query.categorySlug)
    : undefined;

  const productList = await getAdminProductList({
    page: query.page,
    categoryId: selectedCategory?.id,
    search: query.search || undefined,
    status: query.status ?? undefined,
    gallery: query.gallery ?? undefined,
  });

  const hasFilters =
    query.search !== '' || query.categorySlug !== null || query.status !== null || query.view !== 'all';
  const emptyMessage = query.view === 'incomplete'
    ? EMPTY_MESSAGES.incomplete
    : hasFilters
      ? EMPTY_MESSAGES.filtered
      : EMPTY_MESSAGES.none;

  const filterQueryString = serializeAdminProductQuery(query).split('?')[1] ?? '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Productos
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Todos los productos del catálogo. Busca, filtra y edita varios a la vez.
        </p>
      </div>

      <ProductFilters
        categories={categories.map((category) => ({ name: category.name, slug: category.slug }))}
        query={query}
        resultCount={productList.total}
      />

      <ProductListClient
        products={productList.items}
        pagination={productList}
        workspaceHref="/admin/productos"
        filterQueryString={filterQueryString}
        emptyMessage={emptyMessage}
        selectable
      />
    </div>
  );
}
