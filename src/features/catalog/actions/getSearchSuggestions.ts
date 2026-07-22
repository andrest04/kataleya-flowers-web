'use server';

import { getCategories } from '@/features/catalog/queries/getCategories';
import { getFeaturedProducts } from '@/features/catalog/queries/getFeaturedProducts';
import type { Category, Product } from '@/features/catalog/types';

export interface SearchSuggestions {
  categories: Category[];
  products: Product[];
}

export async function getSearchSuggestions(): Promise<SearchSuggestions> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return { categories, products };
}
