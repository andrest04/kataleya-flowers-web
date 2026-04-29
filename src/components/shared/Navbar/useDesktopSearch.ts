"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchProducts } from "@/features/catalog/actions/searchProducts";

import type { SearchResult } from "./constants";

const DEBOUNCE_MS = 250;

interface UseDesktopSearchResult {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

/**
 * Hook que maneja la búsqueda con autocomplete del navbar.
 *
 * Responsabilidades:
 *  - Estado del query y de los resultados.
 *  - Debounce de 250ms antes de llamar al server action `searchProducts`.
 *  - Descarte de respuestas obsoletas (race condition cuando el usuario
 *    tipea rápido) via flag `stale` capturado en el cleanup del effect.
 *  - Click outside del contenedor desktop -> limpia el query (cierra
 *    el dropdown). Solo se monta el listener cuando hay query — sin
 *    query no hay dropdown para cerrar.
 *
 * El server action `searchProducts` es fire-and-forget intencional desde
 * la perspectiva del effect: la respuesta entra por `setSearchResults`,
 * los errores los maneja el propio action (devuelve `[]` ante fallo de
 * Supabase). Por eso usamos `.catch()` para silenciar promesas rechazadas
 * en lugar de `void`, dejando un log de error en dev sin romper la UI.
 *
 * NOTA: el setter `setSearchQuery` que se expone es un WRAPPER que limpia
 * los resultados en el MISMO render cuando el query queda vacío. Esto evita
 * un setState dentro de un useEffect (regla `react-hooks/set-state-in-effect`),
 * que de otro modo dispararía un re-render en cascada cada vez que se
 * borra el input.
 */
export function useDesktopSearch(): UseDesktopSearchResult {
  const [searchQuery, setSearchQueryState] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const setSearchQuery = useCallback((next: string) => {
    setSearchQueryState(next);
    // Sincronizamos los resultados con el query en el mismo render: si el
    // usuario borra el input, el dropdown se cierra de inmediato sin esperar
    // a que el effect del debounce corra.
    if (!next.trim()) {
      setSearchResults([]);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
    setSearchResults([]);
  }, []);

  // Click outside del contenedor desktop. Solo se monta cuando hay query
  // (si no hay query, no hay dropdown abierto que cerrar). De-monto el
  // listener cuando el query queda vacío para no consumir mousedown global.
  useEffect(() => {
    if (!searchQuery) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setSearchQueryState("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery]);

  // Autocomplete: debounce + descarte de respuestas obsoletas.
  // Cuando el query queda vacío salimos temprano (sin setState) — la
  // limpieza ya la hizo el wrapper de setSearchQuery en el render previo.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    let stale = false;
    const timer = window.setTimeout(() => {
      // Fire-and-forget intencional: la UI se actualiza por setState,
      // los errores del server action ya se manejan dentro (devuelve []).
      // El .catch() evita que una promesa rechazada se vuelva un
      // unhandledrejection en runtime.
      searchProducts(q)
        .then((results) => {
          if (!stale) setSearchResults(results);
        })
        .catch((err: unknown) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("[Navbar] searchProducts failed:", err);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    desktopSearchRef,
    clearSearch,
  };
}
