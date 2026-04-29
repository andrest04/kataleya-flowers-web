'use client';

/**
 * CategoryListHeader — encabezado del listado en flex (alineado con
 * `CategoryRow`). Cuando hay cambios pendientes, oculta la columna de
 * acciones para que coincida con la fila (que también las oculta).
 */

interface CategoryListHeaderProps {
  hasChanges: boolean;
}

export default function CategoryListHeader({ hasChanges }: CategoryListHeaderProps) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 text-xs font-semibold"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        color: 'var(--color-dark)',
      }}
    >
      <span className="w-6 flex-shrink-0" />
      <span className="w-5 flex-shrink-0">#</span>
      <span className="w-10 flex-shrink-0">Imagen</span>
      <span className="flex-1">Nombre</span>
      <span className="hidden md:block w-28 flex-shrink-0">Ocasión</span>
      <span className="w-12 flex-shrink-0 text-center">Estado</span>
      <span className="w-20 flex-shrink-0 text-center">Destacado</span>
      {!hasChanges && <span className="w-36 text-right">Acciones</span>}
    </div>
  );
}
