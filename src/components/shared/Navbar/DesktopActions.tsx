"use client";

import { ShoppingBag } from "lucide-react";

import DesktopSearch from "./DesktopSearch";

interface DesktopActionsProps {
  brandName: string;
  handleNavigate: (href: string) => void;
  openSearch: () => void;
}

export default function DesktopActions({
  brandName,
  handleNavigate,
  openSearch,
}: DesktopActionsProps) {
  return (
    <div className="hidden items-center justify-end gap-6 md:flex">
      <button
        type="button"
        onClick={() => handleNavigate("#contacto")}
        className="cursor-pointer font-body text-[0.9rem] text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
        aria-label={`Hacer pedido por WhatsApp a ${brandName}`}
      >
        Hacer pedido
      </button>

      <DesktopSearch onOpen={openSearch} />

      <button
        type="button"
        className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
        aria-label="Carrito"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
      </button>
    </div>
  );
}
