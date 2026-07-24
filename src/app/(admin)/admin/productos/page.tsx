import Link from 'next/link';

export default function AdminProductosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold" style={{ color: 'var(--color-dark)' }}>
          Productos
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Los productos se administran dentro de cada categoría.
        </p>
      </div>

      <div
        className="max-w-xl rounded-xl p-6"
        style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
      >
        <h2 className="font-serif text-lg font-semibold" style={{ color: 'var(--color-dark)' }}>
          Elegí una categoría
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-muted)' }}>
          Desde Categorías podés ver el conteo, crear productos, cambiar su estado, editarlos, eliminarlos y reordenar la categoría completa.
        </p>
        <Link
          href="/admin/categorias"
          className="mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ background: 'var(--color-primary)', color: 'var(--color-white)' }}
        >
          Ir a categorías
        </Link>
      </div>
    </div>
  );
}
