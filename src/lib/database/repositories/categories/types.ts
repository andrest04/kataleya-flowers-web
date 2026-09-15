export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  occasion: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWritePayload {
  name: string;
  slug: string;
  description: string;
  occasion: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface CategoryRepository {
  listActive(): Promise<Category[]>;
  listAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  listPriceFrom(): Promise<Map<string, number>>;
  getNextOrder(): Promise<number>;
  create(payload: CategoryWritePayload): Promise<string>;
  update(id: string, payload: CategoryWritePayload): Promise<void>;
  countProducts(categoryId: string): Promise<number>;
  deleteCascade(categoryId: string): Promise<string[]>;
  deleteReassign(categoryId: string, reassignToId: string): Promise<string | null>;
  setActive(id: string, isActive: boolean): Promise<void>;
  reorder(orderedIds: string[]): Promise<void>;
  setFeatured(id: string, isFeatured: boolean): Promise<void>;
  listAllSlugs(): Promise<string[]>;
}
