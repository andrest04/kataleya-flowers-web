import Image from 'next/image';
import Link from 'next/link';

import type { Product } from '@/features/catalog/types';
import { getEffectivePrice } from '@/features/catalog/utils/filterProducts';

interface ProductCardProps {
  product: Product;
  categorySlug?: string;
  categoryName?: string;
}

export default function ProductCard({ product, categorySlug, categoryName }: ProductCardProps) {
  const effectivePrice = getEffectivePrice(product);
  const hasVariants = Boolean(product.priceTable?.length);

  return (
    <Link
      href={`/catalogo/${categorySlug ?? ''}/${product.slug}`}
      className="group block rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--color-white)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-3 sm:p-4">
        {categoryName && (
          <p className="font-body text-xs text-muted mb-1 truncate">{categoryName}</p>
        )}
        <h3 className="font-heading text-sm sm:text-base text-dark leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="font-body font-semibold text-secondary text-sm sm:text-base">
          {hasVariants ? 'Desde ' : ''}S/{' '}
          {effectivePrice.toLocaleString('es-PE', {
            minimumFractionDigits: effectivePrice % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </Link>
  );
}
