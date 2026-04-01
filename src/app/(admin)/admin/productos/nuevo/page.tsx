import Link from 'next/link';
import { getAdminCategories } from '@/features/admin/queries/categories';
import ProductForm from '@/features/admin/components/ProductForm';

export default async function NuevoProductoPage() {
  const categories = await getAdminCategories();

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
          Nuevo producto
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Completá los datos del nuevo producto.
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
