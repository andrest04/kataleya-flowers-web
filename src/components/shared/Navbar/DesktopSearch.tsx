"use client";

import { Search } from "lucide-react";
import type { RefObject } from "react";

interface DesktopSearchProps {
  onOpen: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function DesktopSearch({ onOpen, triggerRef }: DesktopSearchProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={onOpen}
      className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
      aria-label="Buscar"
    >
      <Search className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
    </button>
  );
}
