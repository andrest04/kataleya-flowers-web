"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { products, categories } from "@/data/products";
import type { SearchResult } from "./constants";

export function useNavbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const isLandingPage = pathname === "/";
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Auto-focus en el input de búsqueda al abrir el drawer
  useEffect(() => {
    if (isDrawerOpen) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  // Cerrar dropdown desktop al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setSearchQuery("");
        setDebouncedQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar dropdown/drawer con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchQuery("");
        setDebouncedQuery("");
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce: actualizar debouncedQuery 300ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Autocomplete — derivado de debouncedQuery, sin estado extra
  const searchResults = useMemo<SearchResult[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        return {
          name: p.name,
          slug: p.slug,
          categorySlug: cat?.slug ?? "",
          categoryName: cat?.name ?? "",
          price: p.price,
          hasVariants: Boolean(p.priceTable?.length),
          imageUrl: p.imageUrl,
        };
      });
  }, [debouncedQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const openDrawer = () => {
    clearSearch();
    setIsDrawerOpen(true);
  };

  const handleNavigate = (href: string) => {
    const targetId = href.startsWith("#") ? href.slice(1) : href.split("#")[1];
    if (!targetId) {
      setIsDrawerOpen(false);
      return;
    }

    if (!isLandingPage) {
      setIsDrawerOpen(false);
      window.location.href = `/#${targetId}`;
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      console.warn(`[Navbar] Target element with id "${targetId}" not found`);
      setIsDrawerOpen(false);
      return;
    }

    const scrollToTarget = () => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (isDrawerOpen) {
      setIsDrawerOpen(false);
      window.setTimeout(scrollToTarget, 320);
      return;
    }

    scrollToTarget();
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    clearSearch();
    setIsDrawerOpen(false);
    router.push(`/catalogo?q=${encodeURIComponent(q)}`);
  };

  const handleResultClick = (categorySlug: string, productSlug: string) => {
    clearSearch();
    setIsDrawerOpen(false);
    router.push(`/catalogo/${categorySlug}/${productSlug}`);
  };

  return {
    isDrawerOpen,
    setIsDrawerOpen,
    isScrolled,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchInputRef,
    desktopSearchRef,
    clearSearch,
    openDrawer,
    handleNavigate,
    handleSearchSubmit,
    handleResultClick,
  };
}
