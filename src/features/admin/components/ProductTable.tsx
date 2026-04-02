'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Database } from '@/lib/supabase/types';
import { deleteProduct } from '@/features/admin/actions/products';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

type ProductRow = Database['public']['Tables']['products']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface ProductTableProps {
  products: ProductRow[];
  categories: CategoryRow[];
}

export default function ProductTable({ products, categories }: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeletingId(id);
    const result = await deleteProduct(id);
    if (!result.success) {
      alert(`Error al eliminar: ${result.error ?? 'Error desconocido'}`);
    }
    setDeletingId(null);
  }

  if (products.length === 0) {
    return <EmptyState message="No hay productos aún. ¡Creá el primero!" />;
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Imagen
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Nombre
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Categoría
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Precio
            </th>
            <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Estado
            </th>
            <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr
              key={product.id}
              className="transition-colors"
              style={{
                background: i % 2 === 0 ? 'var(--color-white)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background =
                  i % 2 === 0 ? 'var(--color-white)' : 'transparent';
              }}
            >
              <td className="px-4 py-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface)' }}>
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium" style={{ color: 'var(--color-dark)' }}>
                  {product.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {product.slug}
                </p>
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
                {categoryMap.get(product.category_id) ?? '—'}
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--color-dark)' }}>
                S/ {Number(product.price).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={product.is_active} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" href={`/admin/productos/${product.id}`}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Eliminando…' : 'Eliminar'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
