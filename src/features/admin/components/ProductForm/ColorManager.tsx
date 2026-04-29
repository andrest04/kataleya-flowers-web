'use client';

import { deleteProductColor, renameProductColor } from '@/features/admin/actions/productColors';

import TaxonomyManager, { type TaxonomyActionResult } from './TaxonomyManager';
import { DEFAULT_NEW_COLOR_HEX } from './validation';

export interface ColorOption {
  id: string;
  name: string;
  label: string;
  hex: string | null;
}

interface Props {
  /** Colores cargados desde la DB. */
  productColors: ColorOption[];
  /** Colores pendientes de creación (creados localmente, aún no en DB). */
  pendingNewColors: { name: string; hex: string }[];
  /** Colores actualmente seleccionados (form.colors). */
  selected: string[];
  /** Callbacks al hook del form. */
  onToggle: (name: string) => void;
  onAddPending: (color: { name: string; hex: string }) => void;
  onItemRenamedInForm: (oldName: string, newName: string) => void;
  onItemRemovedFromForm: (name: string) => void;
  onError: (msg: string) => void;
}

async function fetchColorUsageCount(name: string): Promise<number> {
  const res = await fetch(
    `/api/admin/product-color-usage?name=${encodeURIComponent(name)}`,
  );
  const data = (await res.json()) as { products: { product_id: string }[] };
  return data.products.length;
}

export default function ColorManager({
  productColors,
  pendingNewColors,
  selected,
  onToggle,
  onAddPending,
  onItemRenamedInForm,
  onItemRemovedFromForm,
  onError,
}: Props) {
  // Construye la lista visible: DB colors + pendientes que aún no estén en DB.
  const dbNames = productColors.map((c) => c.name);
  const items: ColorOption[] = [
    ...productColors,
    ...pendingNewColors
      .filter((pc) => !dbNames.includes(pc.name))
      .map((pc) => ({
        id: pc.name,
        name: pc.name,
        label: pc.name.charAt(0).toUpperCase() + pc.name.slice(1),
        hex: pc.hex,
      })),
  ];
  const pendingNames = pendingNewColors.map((pc) => pc.name);

  return (
    <TaxonomyManager<ColorOption>
      label="Colores"
      items={items}
      selected={selected}
      pendingNames={pendingNames}
      activeColor="primary"
      newPlaceholder="nombre del color..."
      addLabel="Nuevo color"
      onToggle={onToggle}
      onAddPending={(name, extra) =>
        onAddPending({ name, hex: extra.hex || DEFAULT_NEW_COLOR_HEX })
      }
      onRename={async (oldName, newName): Promise<TaxonomyActionResult> => {
        const r = await renameProductColor(oldName, newName);
        return r.success ? { success: true } : { success: false, error: r.error };
      }}
      onItemRenamedInForm={onItemRenamedInForm}
      onDelete={async (name): Promise<TaxonomyActionResult> => {
        const r = await deleteProductColor(name);
        return r.success ? { success: true } : { success: false, error: r.error };
      }}
      onItemRemovedFromForm={onItemRemovedFromForm}
      getUsageCount={fetchColorUsageCount}
      onError={onError}
      renderIcon={(c) =>
        c.hex ? (
          <span
            className="w-3 h-3 rounded-full inline-block border"
            style={{ background: c.hex, borderColor: 'var(--color-border)' }}
          />
        ) : null
      }
      renderExtraInput={(extra, setExtra) => (
        <label
          className="w-7 h-7 rounded-full border cursor-pointer block shrink-0 overflow-hidden relative"
          style={{
            borderColor: 'var(--color-border)',
            background: extra.hex || DEFAULT_NEW_COLOR_HEX,
          }}
          title="Elegir color"
        >
          <span className="sr-only">Elegir color</span>
          <input
            type="color"
            value={extra.hex || DEFAULT_NEW_COLOR_HEX}
            onChange={(e) => setExtra({ hex: e.target.value })}
            className="opacity-0 w-0 h-0 absolute"
          />
        </label>
      )}
      initialExtra={{ hex: DEFAULT_NEW_COLOR_HEX }}
    />
  );
}
