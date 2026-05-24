'use client';

import PillToggle from '@/components/ui/PillToggle';

import TaxonomyDeleteConfirm from './TaxonomyDeleteConfirm';
import TaxonomyPillManage from './TaxonomyPillManage';
import TaxonomyRenameInput from './TaxonomyRenameInput';
import type { TaxonomyItem, TaxonomyManagerProps } from './types';
import type { useTaxonomyManager } from './useTaxonomyManager';

type TaxonomyManagerState = ReturnType<typeof useTaxonomyManager<TaxonomyItem>>;

interface Props<TItem extends TaxonomyItem> {
  readonly item: TItem;
  readonly state: TaxonomyManagerState;
  readonly props: TaxonomyManagerProps<TItem>;
}

/**
 * Resuelve qué sub-componente renderizar para un item según el modo:
 *  - manage + renaming → TaxonomyRenameInput
 *  - manage + deleting → TaxonomyDeleteConfirm
 *  - manage          → TaxonomyPillManage
 *  - normal          → PillToggle
 */
export default function TaxonomyItemRow<TItem extends TaxonomyItem>({
  item,
  state,
  props,
}: Props<TItem>) {
  const isSelected = props.selected.includes(item.name);
  const isManageable =
    state.manageMode && !props.pendingNames.includes(item.name);

  if (isManageable && state.renaming === item.name) {
    return (
      <TaxonomyRenameInput
        value={state.renameValue}
        inputRef={state.renameInputRef}
        originalName={item.name}
        onChange={state.setRenameValue}
        onCommit={state.commitRename}
        onCancel={state.cancelRename}
      />
    );
  }

  if (isManageable && state.deleting === item.name) {
    return (
      <TaxonomyDeleteConfirm
        name={item.name}
        label={item.label}
        usageCount={state.usageCount}
        capitalizePill={props.capitalizePill}
        onConfirm={state.commitDelete}
        onCancel={state.cancelDelete}
      />
    );
  }

  if (isManageable) {
    return (
      <TaxonomyPillManage<TItem>
        item={item}
        isSelected={isSelected}
        activeColor={props.activeColor}
        capitalizePill={props.capitalizePill}
        renderIcon={props.renderIcon}
        onStartRename={state.startRename}
        onStartDelete={state.startDelete}
      />
    );
  }

  return (
    <PillToggle
      label={item.label}
      active={isSelected}
      onClick={() => props.onToggle(item.name)}
      activeColor={props.activeColor}
      icon={props.renderIcon?.(item)}
      className={props.capitalizePill ? 'capitalize' : ''}
    />
  );
}
