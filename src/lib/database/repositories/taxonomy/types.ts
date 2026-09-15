import type { DocumentRecord } from '@/lib/database/types';

export interface ColorRepoRow extends DocumentRecord {
  name: string;
  label: string;
  hex: string | null;
  display_order: number;
}

export interface FlowerTypeRepoRow extends DocumentRecord {
  name: string;
  display_order: number;
}

export interface NewColorInput {
  name: string;
  hex: string;
}

export interface TaxonomyUsage {
  product_id: string;
  product_name: string;
}

export type RenameOutcome = 'duplicate' | 'not_found' | null;

export interface TaxonomyRepository {
  listColors(): Promise<ColorRepoRow[]>;
  listFlowerTypes(): Promise<FlowerTypeRepoRow[]>;
  getColorUsage(name: string): Promise<TaxonomyUsage[]>;
  getFlowerTypeUsage(name: string): Promise<TaxonomyUsage[]>;
  ensureColors(colors: NewColorInput[]): Promise<void>;
  ensureFlowerTypes(names: string[]): Promise<void>;
  deleteColor(name: string): Promise<boolean>;
  renameColor(oldName: string, newName: string): Promise<RenameOutcome>;
  deleteFlowerType(name: string): Promise<boolean>;
  renameFlowerType(oldName: string, newName: string): Promise<RenameOutcome>;
}
