'use client';

import { Pencil, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { getPillSelectedBg, PILL_BASE } from './styles';
import type { ActiveColor, TaxonomyItem } from './types';

interface Props<TItem extends TaxonomyItem> {
  readonly item: TItem;
  readonly isSelected: boolean;
  readonly activeColor: ActiveColor;
  readonly capitalizePill?: boolean;
  readonly renderIcon?: (item: TItem) => ReactNode;
  readonly onStartRename: (name: string) => void;
  readonly onStartDelete: (name: string) => void;
}

export default function TaxonomyPillManage<TItem extends TaxonomyItem>({
  item,
  isSelected,
  activeColor,
  capitalizePill,
  renderIcon,
  onStartRename,
  onStartDelete,
}: Props<TItem>) {
  const pillSelectedBg = getPillSelectedBg(activeColor);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border"
      style={{
        ...PILL_BASE,
        background: isSelected ? pillSelectedBg : PILL_BASE.background,
      }}
    >
      {renderIcon?.(item)}
      <span className={capitalizePill ? 'capitalize' : ''}>{item.label}</span>
      <button
        type="button"
        onClick={() => onStartRename(item.name)}
        className="text-xs transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-muted)' }}
        aria-label={`Renombrar ${item.label}`}
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => onStartDelete(item.name)}
        className="text-xs transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-primary)' }}
        aria-label={`Eliminar ${item.label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
