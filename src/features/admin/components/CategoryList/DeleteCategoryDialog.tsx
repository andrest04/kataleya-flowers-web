'use client';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Category } from '@/lib/database/repositories/categories';

import {
  cascadeConfirmDescription,
  cascadeHint,
  deleteConfirmLabel,
  deleteDescription,
  isDeleteConfirmDisabled,
  reassignCandidates,
} from './deleteDialogCopy';
import DeleteModeOption from './DeleteModeOption';
import type { DeleteMode, DeleteTarget } from './useCategoryDelete';

interface DeleteCategoryDialogProps {
  target: DeleteTarget | null;
  deleteMode: DeleteMode;
  reassignTo: string;
  showCascadeConfirm: boolean;
  isDeleting: boolean;
  candidates: Category[];
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
  return (
    <>
      <ConfirmDialog
        open={target !== null && !showCascadeConfirm}
        title="Eliminar categoría"
        description={deleteDescription(target)}
        confirmLabel={deleteConfirmLabel(target, deleteMode)}
        confirmDisabled={isDeleteConfirmDisabled(target, deleteMode, reassignTo)}
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
                aria-label="Categoría de destino para reasignar productos"
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
                {reassignCandidates(candidates, target.id).map((c) => (
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
              hint={cascadeHint(target)}
              titleEmphasis
            />
          </div>
        )}
      </ConfirmDialog>

      {showCascadeConfirm && target && (
        <ConfirmDialog
          open
          title="¿Estás seguro?"
          description={cascadeConfirmDescription(target)}
          confirmLabel="Sí, eliminar todo"
          loading={isDeleting}
          onConfirm={onConfirmCascade}
          onCancel={onCancelCascade}
        />
      )}
    </>
  );
}
