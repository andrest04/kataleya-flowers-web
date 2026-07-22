import type { ReactNode } from 'react';

export interface TaxonomyItem {
  name: string;
  label: string;
}

export type TaxonomyActionResult =
  | { success: true }
  | { success: false; error?: string };

export type ActiveColor = 'primary' | 'accent';

export interface TaxonomyManagerProps<TItem extends TaxonomyItem> {
  label: string;
  items: TItem[];
  selected: string[];
  pendingNames: string[];
  activeColor: ActiveColor;
  newPlaceholder: string;
  addLabel: string;

  onToggle: (name: string) => void;

  onAddPending: (name: string, extra: { hex?: string }) => void;

  onRename: (oldName: string, newName: string) => Promise<TaxonomyActionResult>;
  onItemRenamedInForm: (oldName: string, newName: string) => void;

  onDelete: (name: string) => Promise<TaxonomyActionResult>;
  onItemRemovedFromForm: (name: string) => void;

  getUsageCount: (name: string) => Promise<number>;

  onError: (msg: string) => void;

  renderIcon?: (item: TItem) => ReactNode;

  renderExtraInput?: (
    extra: { hex: string },
    setExtra: (v: { hex: string }) => void,
  ) => ReactNode;

  initialExtra?: { hex: string };

  capitalizePill?: boolean;
}
