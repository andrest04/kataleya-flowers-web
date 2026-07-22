"use client";

import { Search } from "lucide-react";

interface DesktopSearchProps {
  onOpen: () => void;
}

export default function DesktopSearch({ onOpen }: DesktopSearchProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
      aria-label="Buscar"
    >
      <Search className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
    </button>
  );
}
