import Image from 'next/image';
import Link from 'next/link';

import type { Product } from '@/features/catalog/types';
import { getEffectivePrice } from '@/features/catalog/utils/filterProducts';

interface BestSellerProductCardProps {
  product: Product;
  categorySlug?: string;
}

export default function BestSellerProductCard({
  product,
  categorySlug,
}: BestSellerProductCardProps) {
  const effectivePrice = getEffectivePrice(product);
  const hasVariants = Boolean(product.priceTable?.length);

  return (
    <Link
      href={`/catalogo/${categorySlug ?? ''}/${product.slug}`}
      className="group block w-[76vw] shrink-0 snap-start sm:w-[20rem] lg:w-[22rem]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-(--color-surface)">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 76vw, (max-width: 1024px) 20rem, 22rem"
        />
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-heading text-xl leading-tight text-(--color-dark)">
          {product.name}
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-(--color-primary)">
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
