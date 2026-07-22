export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  occasion?: string;
  imageUrl?: string;
  priceFrom?: number;
  isFeatured?: boolean;
}

export interface PriceVariant {
  label: string;
  price: number;
}

export interface PriceVariantRow {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceTable?: PriceVariant[];
  categoryId: string;
  imageUrl: string;
  images?: string[];
  includes?: string[];
  occasion?: string;
  note?: string;
  colors?: string[];
  flowerTypes?: string[];
  isFeatured?: boolean;
}
