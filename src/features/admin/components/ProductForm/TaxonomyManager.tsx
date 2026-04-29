'use client';

import { Pencil, Plus, X } from 'lucide-react';
import { type ReactNode,useEffect, useRef, useState, useTransition } from 'react';

import { FormField } from '@/components/ui/FormField';
import PillToggle from '@/components/ui/PillToggle';

/**
 * Manager genérico de taxonomías inline (colores y tipos de flor).
 *
 * Funcionalidad:
 *  - Pills seleccionables (toggle) con `activeColor`.
 *  - Botón "Gestionar" que activa modo edición: renombrar / eliminar pills existentes.
 *  - Botón "+ Nuevo" que activa input para agregar un item nuevo (opcionalmente con
 *    extras como un color picker via `renderExtraInput`).
 *  - Llama a `onRename` / `onDelete` (Server Actions del feature admin) y refleja el
 *    resultado en el form via `onItemRenamedInForm` / `onItemRemovedFromForm`.
 *
 * Es el patrón compartido entre colores y flowerTypes — antes estaba duplicado al ~90%
 * en `ProductForm.tsx` (audit 🔴 4 / hallazgo de duplicación).
 */

export interface TaxonomyItem {
  /** Identificador único (también usado como key del item). */
  name: string;
  /** Texto visible (capitalizado). */
  label: string;
}

export type TaxonomyActionResult = { success: true } | { success: false; error?: string };

interface TaxonomyManagerProps<TItem extends TaxonomyItem> {
  /** Etiqueta del fieldset ("Colores", "Tipos de flor"). */
  label: string;
  /** Items completos (DB + pendientes locales). */
  items: TItem[];
  /** Items actualmente seleccionados (form.colors / form.flowerTypes). */
  selected: string[];
  /** Items pendientes de creación (no se pueden gestionar todavía). */
  pendingNames: string[];
  /** Color activo de las pills. */
  activeColor: 'primary' | 'accent';
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
   * Recibe un setter para acumular el `extra` y lo recibe `onAddPending`.
   */
  renderExtraInput?: (extra: { hex: string }, setExtra: (v: { hex: string }) => void) => ReactNode;

  /** Valor inicial del extra (ej: hex por defecto). */
  initialExtra?: { hex: string };

  /** Si las pills usan capitalize CSS (flowerTypes lo hace, colors no). */
  capitalizePill?: boolean;
}

export default function TaxonomyManager<TItem extends TaxonomyItem>({
  label,
  items,
  selected,
  pendingNames,
  activeColor,
  newPlaceholder,
  addLabel,
  onToggle,
  onAddPending,
  onRename,
  onItemRenamedInForm,
  onDelete,
  onItemRemovedFromForm,
  getUsageCount,
  onError,
  renderIcon,
  renderExtraInput,
  initialExtra,
  capitalizePill,
}: TaxonomyManagerProps<TItem>) {
  // ── Modo "gestionar" (edit) ──────────────────────────────────────────────
  const [manageMode, setManageMode] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Modo "agregar" ────────────────────────────────────────────────────────
  const [showNewInput, setShowNewInput] = useState(false);
  const [newInput, setNewInput] = useState('');
  const [extra, setExtra] = useState<{ hex: string }>(initialExtra ?? { hex: '' });
  const newInputRef = useRef<HTMLInputElement>(null);

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (showNewInput) newInputRef.current?.focus();
  }, [showNewInput]);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  // ── Helpers internos ──────────────────────────────────────────────────────

  const exists = (name: string) => items.some((i) => i.name === name);

  const commitRename = (oldName: string) => {
    const newName = renameValue.toLowerCase().trim();
    if (!newName || newName === oldName || exists(newName)) return;
    startTransition(async () => {
      const result = await onRename(oldName, newName);
      if (result.success) {
        onItemRenamedInForm(oldName, newName);
        setRenaming(null);
      } else {
        onError(result.error ?? 'Error al renombrar');
      }
    });
  };

  const commitDelete = (name: string) => {
    startTransition(async () => {
      const result = await onDelete(name);
      if (result.success) {
        onItemRemovedFromForm(name);
        setDeleting(null);
        setUsageCount(null);
      } else {
        onError(result.error ?? 'Error al eliminar');
      }
    });
  };

  const startDelete = (name: string) => {
    setDeleting(name);
    setRenaming(null);
    setUsageCount(null);
    void (async () => {
      try {
        const count = await getUsageCount(name);
        setUsageCount(count);
      } catch {
        setUsageCount(0);
      }
    })();
  };

  const commitAdd = () => {
    const name = newInput.toLowerCase().trim();
    if (!name || exists(name)) return;
    onAddPending(name, extra);
    setNewInput('');
    setExtra(initialExtra ?? { hex: '' });
    setShowNewInput(false);
  };

  // ── Estilos compartidos ───────────────────────────────────────────────────
  const pillBase: React.CSSProperties = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-dark)',
    background: 'var(--color-surface)',
  };
  const pillSelectedBg = activeColor === 'primary'
    ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-white))'
    : 'color-mix(in srgb, var(--color-accent) 12%, var(--color-white))';

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <FormField label={label}>
          <></>
        </FormField>
        <button
          type="button"
          onClick={() => {
            setManageMode((v) => !v);
            setRenaming(null);
            setDeleting(null);
          }}
          className="text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-muted)' }}
        >
          {manageMode ? 'Listo' : 'Gestionar'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {items.map((item) => {
          const isSelected = selected.includes(item.name);
          const isPendingItem = pendingNames.includes(item.name);

          // ── Modo manage: rename ───────────────────────────────────────────
          if (manageMode && !isPendingItem && renaming === item.name) {
            return (
              <div key={item.name} className="flex items-center gap-1">
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitRename(item.name);
                    }
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                  className="rounded-full px-3 py-1 text-sm border outline-none focus:ring-1"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-dark)',
                    background: 'var(--color-white)',
                    width: '130px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setRenaming(null)}
                  className="text-xs"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          // ── Modo manage: delete confirm ───────────────────────────────────
          if (manageMode && !isPendingItem && deleting === item.name) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-full px-3 py-1 text-sm border"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-white))',
                }}
              >
                <span className={capitalizePill ? 'capitalize' : ''}>{item.label}</span>
                {usageCount !== null && usageCount > 0 && (
                  <span className="text-xs">
                    ({usageCount} producto{usageCount !== 1 ? 's' : ''})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => commitDelete(item.name)}
                  className="text-xs font-medium underline"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleting(null);
                    setUsageCount(null);
                  }}
                  className="text-xs"
                  aria-label="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          // ── Modo manage: vista normal con botones rename/delete ──────────
          if (manageMode && !isPendingItem) {
            return (
              <div
                key={item.name}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm border"
                style={{
                  ...pillBase,
                  background: isSelected ? pillSelectedBg : pillBase.background,
                }}
              >
                {renderIcon?.(item)}
                <span className={capitalizePill ? 'capitalize' : ''}>{item.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRenaming(item.name);
                    setRenameValue(item.name);
                    setDeleting(null);
                  }}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-muted)' }}
                  title="Renombrar"
                  aria-label="Renombrar"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => startDelete(item.name)}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-primary)' }}
                  title="Eliminar"
                  aria-label="Eliminar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          // ── Modo normal: pill toggle ──────────────────────────────────────
          return (
            <PillToggle
              key={item.name}
              label={item.label}
              active={isSelected}
              onClick={() => onToggle(item.name)}
              activeColor={activeColor}
              icon={renderIcon?.(item)}
              className={capitalizePill ? 'capitalize' : ''}
            />
          );
        })}

        {/* Add new */}
        {showNewInput ? (
          <div className="flex items-center gap-2">
            <input
              ref={newInputRef}
              type="text"
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitAdd();
                }
                if (e.key === 'Escape') {
                  setNewInput('');
                  setShowNewInput(false);
                }
              }}
              placeholder={newPlaceholder}
              className="rounded-full px-3 py-1.5 text-sm border outline-none focus:ring-1"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-dark)',
                background: 'var(--color-white)',
                width: '150px',
              }}
            />
            {renderExtraInput?.(extra, setExtra)}
            <button
              type="button"
              onClick={commitAdd}
              className="rounded-full px-3 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
              style={{
                color: activeColor === 'primary' ? 'var(--color-primary)' : 'var(--color-accent)',
                borderColor: activeColor === 'primary' ? 'var(--color-primary)' : 'var(--color-accent)',
              }}
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setNewInput('');
                setShowNewInput(false);
              }}
              className="rounded-full px-2 py-1.5 text-sm transition-colors"
              style={{ color: 'var(--color-muted)' }}
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewInput(true)}
            className="rounded-full px-3 py-1 text-sm border border-dashed transition-colors hover:opacity-70 inline-flex items-center gap-1"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
