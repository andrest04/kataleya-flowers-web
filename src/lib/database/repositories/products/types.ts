export interface PriceVariant {
  label: string;
  price: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductColorAssignment {
  colorId: string;
  color: { id: string; name: string; hex: string | null; label: string } | null;
}

export interface ProductFlowerTypeAssignment {
  flowerTypeId: string;
  flowerType: { id: string; name: string } | null;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  images: string[];
  includes: string[];
  colors: string[];
  flowerTypes: string[];
  occasion: string | null;
  note: string | null;
  priceVariants: PriceVariant[] | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  colorAssignments: ProductColorAssignment[];
  flowerTypeAssignments: ProductFlowerTypeAssignment[];
  productImages: ProductImage[];
}

export interface AdminProductListRow {
  id: string;
  categoryId: string;
  displayOrder: number;
  imageUrl: string;
  isActive: boolean;
  name: string;
  price: number;
  slug: string;
}

export interface AdminProductListPage {
  items: AdminProductListRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminProductPageInput {
  page: number;
  pageSize: number;
  categoryId?: string;
  search?: string;
  status?: 'active' | 'inactive';
  gallery?: 'at-most-one-image';
}

export interface SitemapProductRow {
  slug: string;
  categorySlug: string;
  updatedAt: string | null;
}

export interface ProductCategorySlug {
  categoryId: string;
  categorySlug: string | null;
}

export interface ProductWritePayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  includes: string[];
  priceVariants: unknown;
  occasion: string | null;
  note: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface ProductTaxonomySyncInput {
  productName: string;
  colorNames: string[];
  flowerTypeNames: string[];
  imageUrl: string;
  galleryImages: string[];
  imageAlts?: Record<string, string>;
}

export interface ProductRelationDocumentIds {
  colorAssignmentIds: string[];
  flowerTypeAssignmentIds: string[];
  imageIds: string[];
}

export interface DeletedProductMetadata {
  categoryId: string;
  categorySlug: string | null;
  imageUrls: string[];
  slug: string;
}

export interface ProductsRepository {
  listActiveJoined(): Promise<Product[]>;
  findActiveJoinedBySlug(slug: string): Promise<Product | null>;
  listActiveJoinedByCategorySlug(categorySlug: string): Promise<Product[]>;
  listSitemap(): Promise<SitemapProductRow[]>;
  listAdmin(): Promise<Product[]>;
  listAdminPage(input: ListAdminProductPageInput): Promise<AdminProductListPage>;
  findAdminById(id: string): Promise<Product | null>;
  listAdminCategoryCounts(
    categoryIds: string[],
    gallery?: 'at-most-one-image',
  ): Promise<Record<string, number>>;
  getImageUrls(productId: string): Promise<string[]>;
  getNextOrder(): Promise<number>;
  getCategorySlug(productId: string): Promise<ProductCategorySlug | null>;
  getSlugById(id: string): Promise<string | null>;
  getCategorySlugById(categoryId: string): Promise<string | null>;
  getCategorySlugsForProducts(productIds: string[]): Promise<Map<string, string>>;
  createProductDocument(payload: ProductWritePayload): Promise<string>;
  updateProductDocument(id: string, payload: ProductWritePayload): Promise<void>;
  deleteProductDocument(id: string): Promise<void>;
  createProductWithTaxonomy(
    payload: ProductWritePayload,
    taxonomy: ProductTaxonomySyncInput,
  ): Promise<string>;
  updateProductWithTaxonomy(
    id: string,
    payload: ProductWritePayload,
    taxonomy: ProductTaxonomySyncInput,
  ): Promise<void>;
  deleteProductWithRelations(id: string): Promise<void>;
  setProductActive(id: string, isActive: boolean): Promise<void>;
  bulkSetProductActive(ids: string[], isActive: boolean): Promise<void>;
  reorderProductsAppwrite(orderedIds: string[]): Promise<void>;
  bulkDeleteProductsWithRelations(ids: string[]): Promise<DeletedProductMetadata[]>;
}
