'use server';

import { getCategories } from '@/features/catalog/queries/getCategories';
import { getProducts } from '@/features/catalog/queries/getProducts';
import type { CatalogCardProduct, Category } from '@/features/catalog/types';
import { pickBestSellerCards } from '@/features/catalog/utils/pickBestSellers';

export interface SearchSuggestions {
  categories: Category[];
  products: CatalogCardProduct[];
}

export async function getSearchSuggestions(): Promise<SearchSuggestions> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return { categories, products: pickBestSellerCards(products) };
}
