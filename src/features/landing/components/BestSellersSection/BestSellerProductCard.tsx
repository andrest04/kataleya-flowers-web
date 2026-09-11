import Link from 'next/link';

import Image from '@/components/ui/AppwriteImage';
import type { Product } from '@/features/catalog/types';
import { getEffectivePrice } from '@/features/catalog/utils/filterProducts';

interface BestSellerProductCardProps {
  product: Product;
  categorySlug?: string;
  className?: string;
  onClick?: () => void;
}

const DEFAULT_CLASSNAME = 'w-[80vw] shrink-0 snap-start sm:w-[23rem] lg:w-[25rem]';

export default function BestSellerProductCard({
  product,
  categorySlug,
  className = DEFAULT_CLASSNAME,
  onClick,
}: BestSellerProductCardProps) {
  const effectivePrice = getEffectivePrice(product);
  const hasVariants = Boolean(product.priceTable?.length);

  return (
    <Link
      href={`/catalogo/${categorySlug ?? ''}/${product.slug}`}
      onClick={onClick}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-(--color-surface) outline outline-1 -outline-offset-1 outline-[color-mix(in_srgb,var(--color-dark)_5%,transparent)]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 23rem, 25rem"
        />
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-heading text-xl leading-tight text-(--color-dark)">
          {product.name}
        </h3>
        <p className="mt-2 font-body text-sm font-semibold tabular-nums text-(--color-primary)">
          {hasVariants ? 'Desde ' : ''}S/{' '}
          {effectivePrice.toLocaleString('es-PE', {
            minimumFractionDigits: effectivePrice % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </Link>
  );
}
