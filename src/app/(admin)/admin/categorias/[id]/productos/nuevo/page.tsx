import Link from 'next/link';
import { notFound } from 'next/navigation';

import ProductForm from '@/features/admin/components/ProductForm';
import { getAdminCategories, getAdminCategoryById } from '@/features/admin/queries/categories';
import { getFlowerTypes } from '@/features/admin/queries/flowerTypes';
import { getProductColors } from '@/features/admin/queries/productColors';

interface NewCategoryProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewCategoryProductPage({ params }: NewCategoryProductPageProps) {
  const { id } = await params;
  const [category, categories, flowerTypes, productColors] = await Promise.all([
    getAdminCategoryById(id),
    getAdminCategories(),
    getFlowerTypes(),
    getProductColors(),
  ]);

  if (!category) {
    notFound();
  }

  const workspaceHref = `/admin/categorias/${category.id}/productos`;

  return (
    <div className="space-y-6">
      <Link
        href={workspaceHref}
        className="text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-muted)' }}
      >
        ← Volver a productos de {category.name}
      </Link>

      <div>
        <h1 className="text-2xl font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Nuevo producto
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Se agregará a {category.name}.
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
      >
        <ProductForm
          categories={categories}
          flowerTypes={flowerTypes}
          productColors={productColors}
          initialCategoryId={category.id}
          successHref={workspaceHref}
        />
      </div>
    </div>
  );
}
