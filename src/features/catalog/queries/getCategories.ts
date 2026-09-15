import { unstable_cache } from 'next/cache';

import type { Category } from '@/features/catalog/types';
import type { Category as CategoryEntity } from '@/lib/database/repositories/categories';
import { categoryRepository } from '@/lib/database/repositories/categories';

function mapCategoryEntity(
  entity: CategoryEntity,
  priceFrom: number | undefined
): Category {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    occasion: entity.occasion ?? undefined,
    imageUrl: entity.imageUrl ?? undefined,
    priceFrom,
    isFeatured: entity.isFeatured,
  };
}

const getCachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const [entities, priceFromMap] = await Promise.all([
      categoryRepository.listActive(),
      categoryRepository.listPriceFrom(),
    ]);
    return entities.map((entity) => mapCategoryEntity(entity, priceFromMap.get(entity.id)));
  },
  ['catalog-active-categories'],
  { tags: ['catalog-categories'], revalidate: 3600 },
);

export async function getCategories(): Promise<Category[]> {
  return getCachedCategories();
}
