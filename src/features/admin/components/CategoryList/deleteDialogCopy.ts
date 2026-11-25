import type { DeleteMode, DeleteTarget } from './useCategoryDelete';

function productCountLabel(count: number): string {
  return `${count} producto${count !== 1 ? 's' : ''}`;
}

function hasProducts(target: DeleteTarget | null): target is DeleteTarget {
  return target !== null && target.productCount > 0;
}

export function deleteDescription(target: DeleteTarget | null): string {
  if (!target) return '';
  if (target.productCount <= 0) return `¿Eliminar la categoría "${target.name}"?`;
  return `La categoría "${target.name}" tiene ${productCountLabel(target.productCount)}.`;
}

export function deleteConfirmLabel(target: DeleteTarget | null, deleteMode: DeleteMode): string {
  if (!hasProducts(target)) return 'Eliminar';
  return deleteMode === 'reassign' ? 'Mover y eliminar' : 'Eliminar todo';
}

export function isDeleteConfirmDisabled(
  target: DeleteTarget | null,
  deleteMode: DeleteMode,
  reassignTo: string,
): boolean {
  return hasProducts(target) && deleteMode === 'reassign' && !reassignTo;
}

export function cascadeHint(target: DeleteTarget): string {
  return `Se eliminarán permanentemente ${productCountLabel(target.productCount)}`;
}

export function cascadeConfirmDescription(target: DeleteTarget): string {
  return `Se eliminará la categoría "${target.name}" junto con ${productCountLabel(target.productCount)} de forma permanente. Esta acción no se puede deshacer.`;
}

export function reassignCandidates<T extends { id: string }>(candidates: readonly T[], targetId: string): T[] {
  return candidates.filter((candidate) => candidate.id !== targetId);
}
