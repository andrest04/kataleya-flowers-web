import Image from "next/image";
import Link from "next/link";

import type { SearchResult } from "../constants";

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: () => void;
  className?: string;
}

export default function SearchResultCard({
  result,
  onClick,
  className = "w-full",
}: SearchResultCardProps) {
  return (
    <Link
      href={`/catalogo/${result.categorySlug}/${result.slug}`}
      onClick={onClick}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-(--color-surface)">
        <Image
          src={result.imageUrl}
          alt={result.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-heading text-base leading-tight text-(--color-dark)">
          {result.name}
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-(--color-primary)">
          {result.hasVariants ? "Desde " : ""}S/{result.price}
        </p>
      </div>
    </Link>
  );
}
