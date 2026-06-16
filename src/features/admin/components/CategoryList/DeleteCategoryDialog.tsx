'use client';

/**
 * DeleteCategoryDialog — dialog primario + segunda confirmación para eliminar
 * una categoría con dos modos: `reassign` (mover productos a otra categoría)
 * y `cascade` (borrar todo).
 *
 * Se mantiene como dialog custom (no se migra a `ConfirmDialog` simple) porque
 * el escenario tiene 2 variantes y un cuerpo no trivial (radio + select). Sí
 * reusa `ConfirmDialog` como contenedor para conservar focus trap, ESC y
 * cierre por backdrop.
 */

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { CategoryRow } from '@/lib/db/rows';

import DeleteModeOption from './DeleteModeOption';
import type { DeleteMode, DeleteTarget } from './useCategoryDelete';

interface DeleteCategoryDialogProps {
  target: DeleteTarget | null;
  deleteMode: DeleteMode;
  reassignTo: string;
  showCascadeConfirm: boolean;
  isDeleting: boolean;
  candidates: CategoryRow[];
  onSelectMode: (mode: DeleteMode) => void;
  onSelectReassignTarget: (id: string) => void;
  onConfirm: () => void;
  onConfirmCascade: () => void;
  onCancel: () => void;
  onCancelCascade: () => void;
}

export default function DeleteCategoryDialog({
  target,
  deleteMode,
  reassignTo,
  showCascadeConfirm,
  isDeleting,
  candidates,
  onSelectMode,
  onSelectReassignTarget,
  onConfirm,
  onConfirmCascade,
  onCancel,
  onCancelCascade,
}: DeleteCategoryDialogProps) {
  const description = !target
    ? ''
    : target.productCount > 0
      ? `La categoría "${target.name}" tiene ${target.productCount} producto${target.productCount !== 1 ? 's' : ''}.`
      : `¿Eliminar la categoría "${target.name}"?`;

  const confirmLabel =
    !target || target.productCount === 0
      ? 'Eliminar'
      : deleteMode === 'reassign'
        ? 'Mover y eliminar'
        : 'Eliminar todo';

  const confirmDisabled =
    target !== null && target.productCount > 0 && deleteMode === 'reassign' && !reassignTo;

  return (
    <>
      <ConfirmDialog
        open={target !== null && !showCascadeConfirm}
        title="Eliminar categoría"
        description={description}
        confirmLabel={confirmLabel}
        confirmDisabled={confirmDisabled}
        loading={isDeleting}
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        {target && target.productCount > 0 && (
          <div className="space-y-3">
            <DeleteModeOption
              mode="reassign"
              selected={deleteMode === 'reassign'}
              onSelect={() => onSelectMode('reassign')}
              title="Mover productos a otra categoría"
              hint="Los productos se reasignan antes de eliminar la categoría"
            />

            {deleteMode === 'reassign' && (
              <select
                id="reassign-category"
                value={reassignTo}
                onChange={(e) => onSelectReassignTarget(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-white)',
                  color: 'var(--color-dark)',
                }}
              >
                <option value="">Seleccionar categoría…</option>
                {candidates
                  .filter((c) => c.id !== target.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            )}

            <DeleteModeOption
              mode="cascade"
              selected={deleteMode === 'cascade'}
              onSelect={() => onSelectMode('cascade')}
              title="Eliminar categoría y todos sus productos"
              hint={`Se eliminarán permanentemente ${target.productCount} producto${target.productCount !== 1 ? 's' : ''}`}
              titleEmphasis
            />
          </div>
        )}
      </ConfirmDialog>

      {showCascadeConfirm && target && (
        <ConfirmDialog
          open
          title="¿Estás seguro?"
          description={`Se eliminará la categoría "${target.name}" junto con ${target.productCount} producto${target.productCount !== 1 ? 's' : ''} de forma permanente. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar todo"
          loading={isDeleting}
          onConfirm={onConfirmCascade}
          onCancel={onCancelCascade}
        />
      )}
    </>
  );
}
