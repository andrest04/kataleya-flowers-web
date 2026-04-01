'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Database } from '@/lib/supabase/types';
import { deleteProduct } from '@/features/admin/actions/products';

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
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          No hay productos aún. ¡Creá el primero!
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <table className="w-full text-sm" style={{ fontFamily: 'var(--font-lato, sans-serif)' }}>
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
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: product.is_active
                      ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
                      : 'color-mix(in srgb, var(--color-muted) 15%, transparent)',
                    color: product.is_active ? 'var(--color-accent)' : 'var(--color-muted)',
                  }}
                >
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70"
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-dark)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => void handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
                    style={{
                      background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                    }}
                  >
                    {deletingId === product.id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
