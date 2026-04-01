import Link from 'next/link';
import { getAdminProducts, getAdminCategories } from '@/features/admin/queries/products';
import ProductTable from '@/features/admin/components/ProductTable';

export default async function AdminProductosPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-serif font-semibold"
            style={{ color: 'var(--color-dark)' }}
          >
            Productos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} en total
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

      <ProductTable products={products} categories={categories} />
    </div>
  );
}
