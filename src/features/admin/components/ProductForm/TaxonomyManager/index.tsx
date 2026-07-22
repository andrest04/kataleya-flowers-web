'use client';

import TaxonomyAddButton from './TaxonomyAddButton';
import TaxonomyAddInput from './TaxonomyAddInput';
import TaxonomyHeader from './TaxonomyHeader';
import TaxonomyItemRow from './TaxonomyItemRow';
import type { TaxonomyItem, TaxonomyManagerProps } from './types';
import { useTaxonomyManager } from './useTaxonomyManager';

export type {
  ActiveColor,
  TaxonomyActionResult,
  TaxonomyItem,
  TaxonomyManagerProps,
} from './types';

export default function TaxonomyManager<TItem extends TaxonomyItem>(
  props: TaxonomyManagerProps<TItem>,
) {
  const m = useTaxonomyManager<TItem>({
    items: props.items,
    initialExtra: props.initialExtra,
    onRename: props.onRename,
    onItemRenamedInForm: props.onItemRenamedInForm,
    onDelete: props.onDelete,
    onItemRemovedFromForm: props.onItemRemovedFromForm,
    getUsageCount: props.getUsageCount,
    onAddPending: props.onAddPending,
    onError: props.onError,
  });

  return (
    <div>
      <TaxonomyHeader
        label={props.label}
        manageMode={m.manageMode}
        onToggleManageMode={m.toggleManageMode}
      />

      <div className="flex flex-wrap gap-2 items-center">
        {props.items.map((item) => (
          <TaxonomyItemRow<TItem>
            key={item.name}
            item={item}
            state={m}
            props={props}
          />
        ))}

        {m.showNewInput ? (
          <TaxonomyAddInput
            value={m.newInput}
            placeholder={props.newPlaceholder}
            ariaLabel={props.addLabel}
            activeColor={props.activeColor}
            inputRef={m.newInputRef}
            extra={m.extra}
            renderExtraInput={props.renderExtraInput}
            setExtra={m.setExtra}
            onChange={m.setNewInput}
            onCancel={m.cancelAdd}
            onCommit={m.commitAdd}
          />
        ) : (
          <TaxonomyAddButton label={props.addLabel} onClick={m.openAdd} />
        )}
      </div>
    </div>
  );
}
