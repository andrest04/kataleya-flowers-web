'use client';

/**
 * ProductTableImage — celda de imagen con fallback "—" si no hay URL.
 * Reusa entre la fila reorderable (40x40) y la fila estática (48x48).
 */

import Image from 'next/image';

import type { Database } from '@/lib/supabase/types';

type ProductRow = Database['public']['Tables']['products']['Row'];

interface ProductTableImageProps {
  product: ProductRow;
  sizeClass: string;
  sizes: string;
}

export default function ProductTableImage({ product, sizeClass, sizes }: ProductTableImageProps) {
  return (
    <div
      className={`relative ${sizeClass} rounded-lg overflow-hidden flex-shrink-0`}
      style={{ background: 'var(--color-surface)' }}
    >
      {product.image_url ? (
        <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes={sizes} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
        </div>
      )}
    </div>
  );
}
