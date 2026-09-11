'use server';

import { getCategories } from '@/features/catalog/queries/getCategories';
import { getProducts } from '@/features/catalog/queries/getProducts';
import type { Category, Product } from '@/features/catalog/types';
import { pickBestSellers } from '@/features/catalog/utils/pickBestSellers';

export interface SearchSuggestions {
  categories: Category[];
  products: Product[];
}

export async function getSearchSuggestions(): Promise<SearchSuggestions> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return { categories, products: pickBestSellers(products) };
}
