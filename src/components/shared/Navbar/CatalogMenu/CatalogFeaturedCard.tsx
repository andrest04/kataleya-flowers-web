import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/features/catalog/types";

interface CatalogFeaturedCardProps {
  category: Category;
  onNavigate: () => void;
}

export default function CatalogFeaturedCard({
  category,
  onNavigate,
}: CatalogFeaturedCardProps) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      onClick={onNavigate}
      className="group relative block h-full w-full overflow-hidden rounded-lg bg-(--color-surface)"
    >
      {category.imageUrl && (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 px-5 pt-20 pb-5"
        style={{
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--color-dark) 92%, transparent) 0%, color-mix(in srgb, var(--color-dark) 55%, transparent) 55%, transparent 100%)",
        }}
      >
        <h3 className="font-heading text-xl text-(--color-cream)">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-2 font-body text-sm text-(--color-cream)/85">
          {category.description}
        </p>
        <span className="mt-2 inline-block border-b border-(--color-cream) font-body text-xs font-semibold tracking-[0.08em] text-(--color-cream) uppercase transition-colors duration-200 group-hover:border-(--color-secondary) group-hover:text-(--color-secondary)">
          Ver más
        </span>
      </div>
    </Link>
  );
}
