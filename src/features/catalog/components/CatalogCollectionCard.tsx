import Link from 'next/link';

import Image from '@/components/ui/AppwriteImage';
import type { Product } from '@/features/catalog/types';
import { getEffectivePrice } from '@/features/catalog/utils/filterProducts';

interface CatalogCollectionCardProps {
  product: Product;
  categorySlug: string;
  onClick?: () => void;
  size?: 'default' | 'compact';
}

export default function CatalogCollectionCard({
  product,
  categorySlug,
  onClick,
  size = 'default',
}: CatalogCollectionCardProps) {
  const effectivePrice = getEffectivePrice(product);
  const imageUrl = product.imageUrl.trim();
  const imageSrc =
    !imageUrl || imageUrl === '/placeholder-product.jpg'
      ? '/catalog-placeholder.svg'
      : imageUrl;
  const formattedPrice = effectivePrice.toLocaleString('es-PE', {
    minimumFractionDigits: effectivePrice % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return (
    <article>
      <Link
        href={`/catalogo/${categorySlug}/${product.slug}`}
        onClick={onClick}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-primary)"
      >
        <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-(--color-surface)">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes={
              size === 'compact'
                ? '(max-width: 1024px) 50vw, 25vw'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
          />
        </span>
        <span className="block px-1 pb-2 pt-4 text-center">
          <span
            className={`line-clamp-2 block font-heading leading-tight text-(--color-dark) ${
              size === 'compact' ? 'text-xl' : 'text-2xl'
            }`}
          >
            {product.name}
          </span>
          <span
            className={`mt-1 block font-body leading-none tabular-nums text-(--color-dark) ${
              size === 'compact' ? 'text-sm' : 'text-lg'
            }`}
          >
            {product.priceTable?.length ? 'Desde ' : ''}S/ {formattedPrice}
          </span>
        </span>
      </Link>
    </article>
  );
}
