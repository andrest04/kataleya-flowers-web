'use client';

import Image from '@/components/ui/AppwriteImage';
import type { AdminProductListRow } from '@/features/admin/queries/products';

interface ProductTableImageProps {
  product: AdminProductListRow;
  sizeClass: string;
  sizes: string;
}

export default function ProductTableImage({ product, sizeClass, sizes }: ProductTableImageProps) {
  const primaryUrl = product.image_url || null;

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
