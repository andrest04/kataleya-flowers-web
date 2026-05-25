'use client';

/**
 * ProductTableImage — celda de imagen con fallback "—" si no hay URL.
 * Reusa entre la fila reorderable (40x40) y la fila estática (48x48).
 */

import Image from 'next/image';

import type { AdminProductRow } from '@/features/admin/queries/products';

interface ProductTableImageProps {
  product: AdminProductRow;
  sizeClass: string;
  sizes: string;
}

export default function ProductTableImage({ product, sizeClass, sizes }: ProductTableImageProps) {
  // Resolve primary image from relational product_images (Phase C+)
  const sortedImages = product.product_images
    ? [...product.product_images].sort((a, b) => a.display_order - b.display_order)
    : [];
  const primaryUrl =
    sortedImages.find((i) => i.is_primary)?.url ??
    sortedImages[0]?.url ??
    product.image_url ??
    null;

  return (
    <div
      className={`relative ${sizeClass} rounded-lg overflow-hidden flex-shrink-0`}
      style={{ background: 'var(--color-surface)' }}
    >
      {primaryUrl ? (
        <Image src={primaryUrl} alt={product.name} fill className="object-cover" sizes={sizes} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
        </div>
      )}
    </div>
  );
}
