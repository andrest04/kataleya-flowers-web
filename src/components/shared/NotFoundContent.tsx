import Image from 'next/image';
import Link from 'next/link';

import { getCategories } from '@/features/catalog/queries/getCategories';

export default async function NotFoundContent() {
  const categories = await getCategories();
  const suggestions = categories.slice(0, 5);

  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center"
      style={{ background: 'var(--color-cream)' }}
    >
      <Image
        src="/flower-scissors.svg"
        alt=""
        aria-hidden="true"
        width={179}
        height={144}
        priority
        unoptimized
        className="h-auto w-56 opacity-80 sm:w-64"
      />

      <h1
        className="mt-8 max-w-2xl font-serif text-3xl leading-snug sm:text-4xl"
        style={{ color: 'var(--color-dark)' }}
      >
        <span className="italic">¡Ups!</span> Esta página se cortó.
      </h1>

      <p
        className="mt-2 max-w-2xl font-serif text-2xl leading-snug sm:text-3xl"
        style={{ color: 'var(--color-dark)' }}
      >
        Prueba con una de nuestras categorías
      </p>

      <nav aria-label="Categorías sugeridas" className="mt-8">
        <ul className="flex flex-wrap items-center justify-center gap-3">
          {suggestions.map((category) => (
            <li key={category.id}>
              <Link
                href={`/catalogo/${category.slug}`}
                className="inline-flex items-center rounded-md border border-(--color-border) px-4 py-2 text-sm text-(--color-dark) transition-colors duration-300 hover:border-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-cream)"
              >
                {category.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/catalogo"
              className="inline-flex items-center rounded-md border border-(--color-border) px-4 py-2 text-sm text-(--color-dark) transition-colors duration-300 hover:border-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-cream)"
            >
              Ver todo el catálogo
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
