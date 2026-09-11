import { Search } from 'lucide-react';

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
          placeholder="Buscar"
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-md border border-(--color-border) bg-(--color-white) pr-4 pl-[39px] font-body text-base text-(--color-dark) outline-none placeholder:text-(--color-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>
    </form>
  );
}
