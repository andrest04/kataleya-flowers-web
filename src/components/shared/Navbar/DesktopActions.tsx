"use client";

import type { RefObject } from "react";

import DesktopSearch from "./DesktopSearch";

interface DesktopActionsProps {
  whatsappHref: string;
  openSearch: () => void;
  searchTriggerRef: RefObject<HTMLButtonElement | null>;
}

export default function DesktopActions({
  whatsappHref,
  openSearch,
  searchTriggerRef,
}: DesktopActionsProps) {
  return (
    <div className="hidden items-center justify-end gap-6 md:flex">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="font-body text-[0.9rem] font-semibold text-(--color-primary) transition-colors duration-200 hover:text-(--color-dark)"
      >
        Pedir por WhatsApp
      </a>

      <DesktopSearch onOpen={openSearch} triggerRef={searchTriggerRef} />
    </div>
  );
}
