'use client';

import Image from '@/components/ui/StoredImage';
import type { Category } from '@/lib/database/repositories/categories';

interface CategoryRowImageProps {
  category: Category;
}

export default function CategoryRowImage({ category }: CategoryRowImageProps) {
  return (
    <div
      className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
      style={{ background: 'var(--color-surface)' }}
    >
      {category.imageUrl ? (
        <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="40px" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
        </div>
      )}
    </div>
  );
}
