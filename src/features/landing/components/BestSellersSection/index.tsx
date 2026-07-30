import { getFeaturedProducts } from '@/features/catalog/queries/getFeaturedProducts';
import type { Category } from '@/features/catalog/types';

import BestSellersTabs from './BestSellersTabs';

interface BestSellersSectionProps {
  categories: Category[];
}

export default async function BestSellersSection({ categories }: BestSellersSectionProps) {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return null;
  }

  const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
  const featuredCategoryIds = new Set(products.map((product) => product.categoryId));
  const tabCategories = categories.filter((category) => featuredCategoryIds.has(category.id));

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl leading-tight text-(--color-primary) sm:text-4xl lg:text-5xl">
          Más vendidos
        </h2>

        <BestSellersTabs
          products={products}
          categoryById={categoryById}
          tabCategories={tabCategories}
        />
      </div>
    </section>
  );
}
