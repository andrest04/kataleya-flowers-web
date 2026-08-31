import Link from 'next/link';
import { notFound } from 'next/navigation';

import ProductListClient from '@/features/admin/components/ProductListClient';
import { getAdminCategoryById } from '@/features/admin/queries/categories';
import { getAdminProductList } from '@/features/admin/queries/products';

interface CategoryProductsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Pick<CategoryProductsPageProps, 'params'>) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  return { title: category ? `Productos de ${category.name}` : 'Productos' };
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  const productList = await getAdminProductList({
    page: parsePage(resolvedSearchParams.page),
    categoryId: category.id,
  });
  const workspaceHref = `/admin/categorias/${category.id}/productos`;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/categorias"
        className="text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-muted)' }}
      >
        ← Volver a categorías
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
            Productos de {category.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            {productList.total} producto{productList.total !== 1 ? 's' : ''} en esta categoría
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/categorias/${category.id}`}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-dark)' }}
          >
            Editar categoría
          </Link>
          <Link
            href={`${workspaceHref}/nuevo`}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-primary)', color: 'var(--color-white)' }}
          >
            + Nuevo producto
          </Link>
        </div>
      </div>

      <ProductListClient
        products={productList.items}
        pagination={productList}
        workspaceHref={workspaceHref}
        selectable
        sortable
      />
    </div>
  );
}
