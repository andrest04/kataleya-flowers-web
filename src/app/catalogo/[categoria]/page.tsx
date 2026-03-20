import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products } from '@/data/products';

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>;
}

export async function generateStaticParams(): Promise<{ categoria: string }[]> {
  return categories.map((category) => ({
    categoria: category.slug,
  }));
}

export default async function CategoriaPage({
  params,
}: CategoriaPageProps): Promise<React.ReactElement> {
  const { categoria } = await params;

  const category = categories.find((cat) => cat.slug === categoria);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter(
    (product) => product.categoryId === category.id
  );

  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-dark/10 rounded-lg font-body text-dark/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          {category.name}
        </h1>
        <p className="font-body text-dark/70 text-lg mb-12 max-w-3xl">
          {category.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/catalogo/${category.slug}/${product.slug}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h2 className="font-heading text-xl text-dark mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h2>
                <p className="font-body text-primary font-bold text-lg">
                  S/ {product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {categoryProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-dark/60 text-lg">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
