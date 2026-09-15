import type { DocumentRecord } from '@/lib/database/types';

import type {
  PriceVariant,
  Product,
  ProductColorAssignment,
  ProductFlowerTypeAssignment,
  ProductImage,
} from './types';

export interface ProductDocRecord extends DocumentRecord {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  includes: string[];
  occasion: string | null;
  note: string | null;
  price_variants: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface RelatedData {
  colorAssignmentsByProduct: Map<string, ProductColorAssignment[]>;
  flowerAssignmentsByProduct: Map<string, ProductFlowerTypeAssignment[]>;
  imagesByProduct: Map<string, ProductImage[]>;
}

export function deriveProductImages(
  images: ProductImage[],
): { imageUrl: string; gallery: string[] } {
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const primary = sorted.find((image) => image.isPrimary) ?? sorted[0];
  const gallery = sorted.flatMap((image) => (image.isPrimary ? [] : [image.url]));
  return { imageUrl: primary?.url ?? '', gallery };
}

function isPriceVariant(value: unknown): value is PriceVariant {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.label === 'string' && typeof candidate.price === 'number';
}

export function parsePriceVariants(value: string | null): PriceVariant[] | null {
  if (value === null) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(isPriceVariant) ? parsed : null;
  } catch {
    return null;
  }
}

export function toProduct(doc: ProductDocRecord, related: RelatedData): Product {
  const colorAssignments = related.colorAssignmentsByProduct.get(doc.id) ?? [];
  const flowerTypeAssignments = related.flowerAssignmentsByProduct.get(doc.id) ?? [];
  const productImages = related.imagesByProduct.get(doc.id) ?? [];
  const { imageUrl, gallery } = deriveProductImages(productImages);

  return {
    id: doc.id,
    categoryId: doc.category_id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    price: doc.price,
    imageUrl,
    images: gallery,
    includes: doc.includes ?? [],
    colors: colorAssignments.flatMap((assignment) => (assignment.color ? [assignment.color.name] : [])),
    flowerTypes: flowerTypeAssignments.flatMap((assignment) =>
      assignment.flowerType ? [assignment.flowerType.name] : [],
    ),
    occasion: doc.occasion,
    note: doc.note,
    priceVariants: parsePriceVariants(doc.price_variants),
    displayOrder: doc.display_order,
    isActive: doc.is_active,
    isFeatured: doc.is_featured,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    colorAssignments,
    flowerTypeAssignments,
    productImages,
  };
}
