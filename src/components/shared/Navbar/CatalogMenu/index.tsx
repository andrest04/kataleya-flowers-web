"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import Link from "next/link";
import type { RefObject } from "react";

import type { Category } from "@/features/catalog/types";

import { PANEL_CONTAINER } from "../SearchOverlay/constants";
import CatalogCategoryRow from "./CatalogCategoryRow";
import CatalogFeaturedCard from "./CatalogFeaturedCard";
import CatalogMenuSkeleton from "./CatalogMenuSkeleton";

interface CatalogMenuProps {
  categories: Category[] | null;
  catalogMenuRef: RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
}

export default function CatalogMenu({
  categories,
  catalogMenuRef,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: CatalogMenuProps) {
  const featuredCategories =
    categories?.filter((category) => category.isFeatured).slice(0, 2) ?? [];

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={catalogMenuRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="absolute inset-x-0 top-full hidden w-full border-t border-(--color-border) bg-(--color-cream) md:block"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          boxShadow:
            "0 16px 32px color-mix(in srgb, var(--color-dark) 12%, transparent)",
        }}
      >
        <div className={`${PANEL_CONTAINER} py-7`}>
          {!categories ? (
            <>
              <div className="flex items-center border-b border-(--color-border) pb-4">
                <h2 className="font-heading text-3xl text-(--color-dark)">
                  Categorías
                </h2>
              </div>
              <CatalogMenuSkeleton />
            </>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-[460px_1fr]">
              <div className="flex items-center justify-between border-b border-(--color-border) pb-4 lg:col-start-1 lg:row-start-1">
                <h2 className="font-heading text-3xl text-(--color-dark)">
                  Categorías
                </h2>
                <Link
                  href="/catalogo"
                  onClick={onNavigate}
                  className="border border-(--color-dark) px-5 py-2.5 font-body text-xs font-semibold tracking-[0.08em] text-(--color-dark) uppercase transition-colors duration-200 hover:border-(--color-primary) hover:text-(--color-primary)"
                >
                  Ver todo
                </Link>
              </div>

              <ul className="flex flex-col gap-3 pt-6 lg:col-start-1 lg:row-start-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <CatalogCategoryRow
                      category={category}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>

              {featuredCategories.length > 0 && (
                <div className="relative hidden lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:block">
                  <div
                    className={
                      featuredCategories.length > 1
                        ? "grid h-full grid-cols-2 gap-1"
                        : "h-full"
                    }
                  >
                    {featuredCategories.map((category) => (
                      <CatalogFeaturedCard
                        key={category.id}
                        category={category}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </m.div>
    </LazyMotion>
  );
}
