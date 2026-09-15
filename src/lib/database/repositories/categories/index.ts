import { documentStore } from '../..';
import { createCategoryRepository } from './appwriteRepository';
import type { CategoryRepository } from './types';

export const categoryRepository: CategoryRepository = createCategoryRepository(documentStore);

export { createCategoryRepository };
export type { Category, CategoryRepository, CategoryWritePayload } from './types';
