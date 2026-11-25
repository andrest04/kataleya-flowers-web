import Link from "next/link";

import Image from '@/components/ui/StoredImage';

import type { SearchResult } from "../constants";
import type { ComboboxOptionProps } from "../useComboboxNavigation";

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: () => void;
  optionProps?: ComboboxOptionProps;
  className?: string;
}

export default function SearchResultCard({
  result,
  onClick,
  optionProps,
  className = "w-full",
}: SearchResultCardProps) {
  return (
    <Link
      href={`/catalogo/${result.categorySlug}/${result.slug}`}
      onClick={onClick}
      {...optionProps}
      tabIndex={optionProps ? -1 : undefined}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-(--color-surface)">
        <Image
          src={result.imageUrl}
          alt={result.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02] group-aria-selected:scale-[1.02]"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-heading text-base leading-tight text-(--color-dark) underline-offset-4 group-aria-selected:text-(--color-primary) group-aria-selected:underline">
          {result.name}
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-(--color-primary)">
          {result.hasVariants ? "Desde " : ""}S/{result.price}
        </p>
      </div>
    </Link>
  );
}
