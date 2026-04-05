import type { PriceVariantRow } from '@/features/catalog/types';

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  images: string[];
  colors: string[];
  flowerTypes: string[];
  includes: string[];
  priceVariants: PriceVariantRow[] | null;
  occasion: string;
  note: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  newFlowerTypes?: string[];
  newColors?: { name: string; hex: string }[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  occasion: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}
