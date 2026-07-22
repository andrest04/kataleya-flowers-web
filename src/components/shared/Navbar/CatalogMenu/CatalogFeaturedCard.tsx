import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/features/catalog/types";

interface CatalogFeaturedCardProps {
  category: Category;
  onNavigate: () => void;
  className?: string;
}

export default function CatalogFeaturedCard({
  category,
  onNavigate,
  className = "",
}: CatalogFeaturedCardProps) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      onClick={onNavigate}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-(--color-surface)">
        {category.imageUrl && (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        )}
      </div>
      <h3 className="mt-4 font-heading text-xl text-(--color-dark)">
        {category.name}
      </h3>
      <p className="mt-1 line-clamp-2 font-body text-sm text-(--color-muted)">
        {category.description}
      </p>
      <span className="mt-3 inline-block border-b border-(--color-dark) font-body text-xs font-semibold tracking-[0.08em] text-(--color-dark) uppercase transition-colors duration-200 group-hover:border-(--color-primary) group-hover:text-(--color-primary)">
        Ver más
      </span>
    </Link>
  );
}
