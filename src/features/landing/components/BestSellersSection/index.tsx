import { getProducts } from '@/features/catalog/queries/getProducts';
import type { Category } from '@/features/catalog/types';
import { buildBestSellersByTab } from '@/features/catalog/utils/pickBestSellers';

import BestSellersTabs from './BestSellersTabs';

interface BestSellersSectionProps {
  categories: Category[];
}

export default async function BestSellersSection({ categories }: BestSellersSectionProps) {
  const products = await getProducts();

  if (products.length === 0) {
    return null;
  }

  const categoryIdsWithProducts = new Set(products.map((product) => product.categoryId));
  const tabCategories = categories
    .filter((category) => categoryIdsWithProducts.has(category.id))
    .map(({ id, name, slug }) => ({ id, name, slug }));
  const bestSellersByTab = buildBestSellersByTab(products, tabCategories);

  return (
    <section id="mas-vendidos" className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl leading-tight text-(--color-primary) sm:text-4xl lg:text-5xl">
          Más vendidos
        </h2>

        <BestSellersTabs bestSellersByTab={bestSellersByTab} tabCategories={tabCategories} />
      </div>
    </section>
  );
}
