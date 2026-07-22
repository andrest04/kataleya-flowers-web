'use client';

const HEADER_BASE_STYLE: React.CSSProperties = {
  background: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-dark)',
};

interface ProductTableHeaderProps {
  reorderable: boolean;
  hasChanges: boolean;
}

export default function ProductTableHeader({ reorderable, hasChanges }: ProductTableHeaderProps) {
  if (reorderable) {
    return (
      <div
        className="flex items-center gap-4 px-4 py-3 text-xs font-semibold"
        style={HEADER_BASE_STYLE}
      >
        <span className="w-6 flex-shrink-0" />
        <span className="w-5 flex-shrink-0">#</span>
        <span className="w-10 flex-shrink-0">Imagen</span>
        <span className="flex-1">Nombre</span>
        <span className="hidden md:block w-28 flex-shrink-0">Categoría</span>
        <span className="w-20 flex-shrink-0">Precio</span>
        <span className="w-12 flex-shrink-0 text-center">Estado</span>
        {!hasChanges && <span className="w-36 text-right">Acciones</span>}
      </div>
    );
  }

  return (
    <thead>
      <tr style={HEADER_BASE_STYLE}>
        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
          Imagen
        </th>
        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
          Nombre
        </th>
        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
          Categoría
        </th>
        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
          Precio
        </th>
        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
          Estado
        </th>
        <th className="text-right px-4 py-3 font-semibold" style={{ color: 'var(--color-dark)' }}>
          Acciones
        </th>
      </tr>
    </thead>
  );
}
