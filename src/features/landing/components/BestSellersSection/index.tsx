import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/features/catalog/components/ProductCard';
import { getFeaturedProducts } from '@/features/catalog/queries/getFeaturedProducts';
import type { Category } from '@/features/catalog/types';

interface BestSellersSectionProps {
  categories: Category[];
}

export default async function BestSellersSection({ categories }: BestSellersSectionProps) {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return null;
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeader
            align="left"
            subtitle="Los favoritos"
            title="Nuestros más pedidos"
          />
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-2 pb-1 text-sm font-semibold tracking-wide text-(--color-primary) transition-colors hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary)"
          >
            Ver todo el catálogo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => {
            const category = categoryById.get(product.categoryId);
            return (
              <ProductCard
                key={product.id}
                product={product}
                categorySlug={category?.slug}
                categoryName={category?.name}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
