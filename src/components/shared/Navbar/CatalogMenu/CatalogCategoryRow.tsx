import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/features/catalog/types";

interface CatalogCategoryRowProps {
  category: Category;
  onNavigate: () => void;
}

export default function CatalogCategoryRow({
  category,
  onNavigate,
}: CatalogCategoryRowProps) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      onClick={onNavigate}
      className="group flex items-center gap-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-(--color-surface)">
        {category.imageUrl && (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="4rem"
          />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-heading text-base text-(--color-dark) transition-colors duration-200 group-hover:text-(--color-primary)">
          {category.name}
        </h3>
        <p className="mt-1 line-clamp-1 font-body text-sm text-(--color-muted)">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
