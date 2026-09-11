"use client";

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
    </div>
  );
}
