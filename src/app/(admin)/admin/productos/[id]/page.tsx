import Link from 'next/link';
import { notFound } from 'next/navigation';

import ProductForm from '@/features/admin/components/ProductForm';
import { getAdminCategories } from '@/features/admin/queries/categories';
import { getFlowerTypes } from '@/features/admin/queries/flowerTypes';
import { getProductColors } from '@/features/admin/queries/productColors';
import { getAdminProductById } from '@/features/admin/queries/products';

interface EditarProductoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: EditarProductoPageProps) {
  const { id } = await params;

  const [product, categories, flowerTypes, productColors] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getFlowerTypes(),
    getProductColors(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/productos"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-muted)' }}
        >
          ← Volver a productos
        </Link>
      </div>

      <div>
        <h1
          className="text-2xl font-serif font-semibold"
          style={{ color: 'var(--color-dark)' }}
        >
          Editar producto
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          {product.name}
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        <ProductForm product={product} categories={categories} flowerTypes={flowerTypes} productColors={productColors} />
      </div>
    </div>
  );
}
