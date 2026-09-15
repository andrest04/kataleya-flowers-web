import { documentStore } from '@/lib/database';

import { createTaxonomyRepository } from './appwriteRepository';
import type { TaxonomyRepository } from './types';

export const taxonomyRepository: TaxonomyRepository = createTaxonomyRepository(documentStore);

export type {
  ColorRepoRow,
  FlowerTypeRepoRow,
  NewColorInput,
  RenameOutcome,
  TaxonomyRepository,
  TaxonomyUsage,
} from './types';
