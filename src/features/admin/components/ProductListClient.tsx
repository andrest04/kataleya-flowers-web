'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { AdminProductListPage, AdminProductListRow } from '@/features/admin/queries/products';

import ProductTable from './ProductTable';

interface ProductListClientProps {
  categoryId: string;
  products: AdminProductListRow[];
  pagination: AdminProductListPage;
  reorderMode: boolean;
  workspaceHref: string;
}

export default function ProductListClient({
  categoryId,
  products,
  pagination,
  reorderMode,
  workspaceHref,
}: ProductListClientProps) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const buildHref = useCallback((page: number, reorder = false) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (reorder) params.set('orden', 'completo');
    const query = params.toString();
    return query ? `${workspaceHref}?${query}` : workspaceHref;
  }, [workspaceHref]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {reorderMode
            ? 'Estás reordenando la categoría completa; la paginación está desactivada.'
            : 'Reordená todos los productos de esta categoría cuando necesites cambiar su orden.'}
        </p>
        <button
          type="button"
          onClick={() => router.push(buildHref(1, !reorderMode))}
          className="rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ background: 'var(--color-primary)', color: 'var(--color-white)' }}
        >
          {reorderMode ? 'Volver al listado paginado' : 'Reordenar categoría completa'}
        </button>
      </div>

      <ProductTable
        key={`${pagination.page}-${reorderMode}`}
        products={products}
        reorderable={reorderMode}
        reorderCategoryId={categoryId}
      />

      {!reorderMode && pagination.total > 0 ? (
        <nav aria-label="Paginación de productos" className="flex items-center justify-between gap-3">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Página {pagination.page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(buildHref(pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg px-3 py-2 text-sm disabled:opacity-50"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => router.push(buildHref(pagination.page + 1))}
              disabled={pagination.page >= totalPages}
              className="rounded-lg px-3 py-2 text-sm disabled:opacity-50"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Siguiente
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
