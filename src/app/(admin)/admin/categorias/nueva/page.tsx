import Link from 'next/link';

import CategoryForm from '@/features/admin/components/CategoryForm';

export const metadata = { title: 'Nueva categoría' };

export default function NuevaCategoriaPage() {
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
          Nueva categoría
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Completa los datos de la nueva categoría.
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        <CategoryForm />
      </div>
    </div>
  );
}
