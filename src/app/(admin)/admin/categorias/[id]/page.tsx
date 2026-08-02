import Link from 'next/link';
import { notFound } from 'next/navigation';

import CategoryForm from '@/features/admin/components/CategoryForm';
import { getAdminCategoryById } from '@/features/admin/queries/categories';

interface EditarCategoriaPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditarCategoriaPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);
  return { title: category ? `Editar ${category.name}` : 'Editar categoría' };
}

export default async function EditarCategoriaPage({ params }: EditarCategoriaPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/categorias"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-muted)' }}
        >
          ← Volver a categorías
        </Link>
      </div>

      <div>
        <h1
          className="text-2xl font-serif font-semibold"
          style={{ color: 'var(--color-dark)' }}
        >
          Editar categoría
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          {category.name}
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
