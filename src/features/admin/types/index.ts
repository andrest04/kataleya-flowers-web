import type { ProductColor, ProductFlowerType, PriceVariantRow } from '@/lib/supabase/types';

export type { ProductColor, ProductFlowerType };

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  images: string[];
  colors: ProductColor[];
  flowerTypes: ProductFlowerType[];
  includes: string[];
  priceVariants: PriceVariantRow[] | null;
  occasion: string;
  note: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
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
