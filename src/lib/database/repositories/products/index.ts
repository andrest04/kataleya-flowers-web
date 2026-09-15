import { documentStore } from '@/lib/database';

import { createProductsRepository, deleteKnownProductRelations } from './appwriteRepository';
import type { ProductsRepository } from './types';

export const productsRepository: ProductsRepository = createProductsRepository(documentStore);

export { createProductsRepository, deleteKnownProductRelations };
export type {
  AdminProductListPage,
  AdminProductListRow,
  DeletedProductMetadata,
  ListAdminProductPageInput,
  PriceVariant,
  Product,
  ProductCategorySlug,
  ProductColorAssignment,
  ProductFlowerTypeAssignment,
  ProductImage,
  ProductRelationDocumentIds,
  ProductsRepository,
  ProductTaxonomySyncInput,
  ProductWritePayload,
  SitemapProductRow,
} from './types';
