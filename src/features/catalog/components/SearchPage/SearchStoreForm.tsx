import { Search, X } from 'lucide-react';
import Link from 'next/link';

interface SearchStoreFormProps {
  query: string;
}

export default function SearchStoreForm({ query }: SearchStoreFormProps) {
  return (
    <form
      action="/buscar"
      method="get"
      role="search"
      className="mx-auto mt-4 w-[700px] max-w-full"
    >
      <label htmlFor="buscar-q" className="sr-only">
        Buscar productos
      </label>
      <div className="relative h-12">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--color-muted)"
          aria-hidden="true"
          strokeWidth={1.8}
        />
        <input
          id="buscar-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Buscar ramos, rosas, cumpleaños…"
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-md border border-(--color-border) bg-(--color-white) pr-12 pl-[39px] [&::-webkit-search-cancel-button]:appearance-none font-body text-base text-(--color-dark) outline-none placeholder:text-(--color-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        />
        {query && (
          <Link
            href="/buscar"
            aria-label="Borrar búsqueda"
            className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-(--color-muted) transition-colors hover:text-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            <X className="size-4" aria-hidden="true" strokeWidth={1.8} />
          </Link>
        )}
      </div>
    </form>
  );
}
