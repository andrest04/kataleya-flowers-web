import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--color-cream)' }}
    >
      <p
        className="text-8xl font-serif font-bold"
        style={{ color: 'var(--color-primary)' }}
      >
        404
      </p>

      <h1
        className="mt-4 text-2xl font-serif font-semibold"
        style={{ color: 'var(--color-dark)' }}
      >
        Página no encontrada
      </h1>

      <p
        className="mt-2 max-w-md text-sm"
        style={{ color: 'var(--color-muted)' }}
      >
        La página que buscás no existe o fue removida. Podés volver al inicio para seguir explorando nuestro catálogo.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-cream)',
        }}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
