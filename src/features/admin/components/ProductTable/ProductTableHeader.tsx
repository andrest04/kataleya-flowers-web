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
      <div className="flex items-center gap-4 px-4 py-3 text-xs font-semibold" style={HEADER_BASE_STYLE}>
        <span className="w-6 shrink-0" />
        <span className="w-5 shrink-0">#</span>
        <span className="w-10 shrink-0">Imagen</span>
        <span className="flex-1">Nombre</span>
        <span className="w-20 shrink-0">Precio</span>
        <span className="w-12 shrink-0 text-center">Estado</span>
        {!hasChanges ? <span className="w-36 text-right">Acciones</span> : null}
      </div>
    );
  }

  return (
    <thead>
      <tr style={HEADER_BASE_STYLE}>
        {['Imagen', 'Nombre', 'Precio', 'Estado', 'Acciones'].map((label) => (
          <th
            key={label}
            className={`px-4 py-3 font-semibold ${label === 'Acciones' ? 'text-right' : 'text-left'}`}
            style={{ color: 'var(--color-dark)' }}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
