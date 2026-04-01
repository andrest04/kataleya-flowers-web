import Link from 'next/link';
import { getAdminCategories } from '@/features/admin/queries/categories';
import CategoryList from '@/features/admin/components/CategoryList';

export default async function AdminCategoriasPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-serif font-semibold"
            style={{ color: 'var(--color-dark)' }}
          >
            Categorías
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {categories.length} categoría{categories.length !== 1 ? 's' : ''} en total
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

      <CategoryList categories={categories} />
    </div>
  );
}
