'use client';

import { deleteFlowerType, renameFlowerType } from '@/features/admin/actions/flowerTypes';

import TaxonomyManager, { type TaxonomyActionResult, type TaxonomyItem } from './TaxonomyManager';

export interface FlowerTypeOption extends TaxonomyItem {
  id: string;
}

interface Props {
  /** Flower types cargados desde la DB. */
  flowerTypes: { id: string; name: string }[];
  /** Tipos pendientes de creación (creados localmente, aún no en DB). */
  pendingNewTypes: string[];
  /** Tipos actualmente seleccionados (form.flowerTypes). */
  selected: string[];
  /** Callbacks al hook del form. */
  onToggle: (name: string) => void;
  onAddPending: (name: string) => void;
  onItemRenamedInForm: (oldName: string, newName: string) => void;
  onItemRemovedFromForm: (name: string) => void;
  onError: (msg: string) => void;
}

async function fetchFlowerTypeUsageCount(name: string): Promise<number> {
  const res = await fetch(
    `/api/admin/flower-type-usage?name=${encodeURIComponent(name)}`,
  );
  const data = (await res.json()) as { products: { product_id: string }[] };
  return data.products.length;
}

export default function FlowerTypeManager({
  flowerTypes,
  pendingNewTypes,
  selected,
  onToggle,
  onAddPending,
  onItemRenamedInForm,
  onItemRemovedFromForm,
  onError,
}: Props) {
  const dbNames = new Set(flowerTypes.map((ft) => ft.name));
  const items: FlowerTypeOption[] = [
    ...flowerTypes.map((ft) => ({ id: ft.id, name: ft.name, label: ft.name })),
    ...pendingNewTypes.flatMap((t) =>
      dbNames.has(t) ? [] : [{ id: t, name: t, label: t }],
    ),
  ];

  return (
    <TaxonomyManager<FlowerTypeOption>
      label="Tipos de flor"
      items={items}
      selected={selected}
      pendingNames={pendingNewTypes}
      activeColor="accent"
      newPlaceholder="nuevo tipo..."
      addLabel="Nuevo tipo"
      capitalizePill
      onToggle={onToggle}
      onAddPending={(name) => onAddPending(name)}
      onRename={async (oldName, newName): Promise<TaxonomyActionResult> => {
        const r = await renameFlowerType(oldName, newName);
        return r.success ? { success: true } : { success: false, error: r.error };
      }}
      onItemRenamedInForm={onItemRenamedInForm}
      onDelete={async (name): Promise<TaxonomyActionResult> => {
        const r = await deleteFlowerType(name);
        return r.success ? { success: true } : { success: false, error: r.error };
      }}
      onItemRemovedFromForm={onItemRemovedFromForm}
      getUsageCount={fetchFlowerTypeUsageCount}
      onError={onError}
    />
  );
}
