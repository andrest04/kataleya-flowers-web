import type { ReactNode } from 'react';

/**
 * Tipos públicos del TaxonomyManager. Re-exportados desde `./index.tsx`
 * para preservar el contrato de import de los consumidores
 * (ColorManager, FlowerTypeManager).
 */

export interface TaxonomyItem {
  /** Identificador único (también usado como key del item). */
  name: string;
  /** Texto visible (capitalizado). */
  label: string;
}

export type TaxonomyActionResult =
  | { success: true }
  | { success: false; error?: string };

export type ActiveColor = 'primary' | 'accent';

export interface TaxonomyManagerProps<TItem extends TaxonomyItem> {
  /** Etiqueta del fieldset ("Colores", "Tipos de flor"). */
  label: string;
  /** Items completos (DB + pendientes locales). */
  items: TItem[];
  /** Items actualmente seleccionados (form.colors / form.flowerTypes). */
  selected: string[];
  /** Items pendientes de creación (no se pueden gestionar todavía). */
  pendingNames: string[];
  /** Color activo de las pills. */
  activeColor: ActiveColor;
  /** Placeholder del input para crear un nuevo item. */
  newPlaceholder: string;
  /** Texto del botón para agregar un nuevo item (ej: "+ Nuevo color"). */
  addLabel: string;

  /** Toggle local de selección (persiste en form). */
  onToggle: (name: string) => void;

  /** Crear un nuevo item localmente (queda como pendiente para el submit). */
  onAddPending: (name: string, extra: { hex?: string }) => void;

  /** Renombrar item en el server. */
  onRename: (oldName: string, newName: string) => Promise<TaxonomyActionResult>;
  /** Refleja el rename exitoso en el form local. */
  onItemRenamedInForm: (oldName: string, newName: string) => void;

  /** Eliminar item del server. */
  onDelete: (name: string) => Promise<TaxonomyActionResult>;
  /** Refleja el delete exitoso en el form local. */
  onItemRemovedFromForm: (name: string) => void;

  /** Devuelve cuántos productos usan este item (para mostrar warning antes de borrar). */
  getUsageCount: (name: string) => Promise<number>;

  /** Notifica errores al padre (lo muestra en el FormError global). */
  onError: (msg: string) => void;

  /** Render opcional del icono de cada pill (ej: muestra del color hex). */
  renderIcon?: (item: TItem) => ReactNode;

  /**
   * Render opcional para inputs adicionales del modo "agregar"
   * (ej: el color picker para crear un nuevo color).
   */
  renderExtraInput?: (
    extra: { hex: string },
    setExtra: (v: { hex: string }) => void,
  ) => ReactNode;

  /** Valor inicial del extra (ej: hex por defecto). */
  initialExtra?: { hex: string };

  /** Si las pills usan capitalize CSS (flowerTypes lo hace, colors no). */
  capitalizePill?: boolean;
}
