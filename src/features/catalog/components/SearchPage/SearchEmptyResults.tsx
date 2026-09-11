import Link from 'next/link';

interface SearchEmptyResultsProps {
  query: string;
}

export default function SearchEmptyResults({ query }: SearchEmptyResultsProps) {
  return (
    <div className="mt-16 max-w-2xl">
      <p className="font-body text-base text-(--color-dark)" role="status">
        No encontramos resultados para “{query}”. Prueba otra búsqueda o mira el
        catálogo.
      </p>
      <p className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-body text-sm">
        <Link
          href="/buscar"
          className="underline underline-offset-4 text-(--color-dark) transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          Limpiar búsqueda
        </Link>
        <Link
          href="/catalogo"
          className="underline underline-offset-4 text-(--color-dark) transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          Ver catálogo
        </Link>
      </p>
    </div>
  );
}
