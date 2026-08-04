'use client';

import Image from '@/components/ui/AppwriteImage';
import type { CategoryRow } from '@/lib/db/rows';

interface CategoryRowImageProps {
  category: CategoryRow;
}

export default function CategoryRowImage({ category }: CategoryRowImageProps) {
  return (
    <div
      className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
      style={{ background: 'var(--color-surface)' }}
    >
      {category.image_url ? (
        <Image src={category.image_url} alt={category.name} fill className="object-cover" sizes="40px" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
        </div>
      )}
    </div>
  );
}
