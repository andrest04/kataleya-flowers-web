import type { LucideIcon } from "lucide-react";
import { Flower2, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { BUSINESS } from "@/lib/constants";

interface TrustItem {
  readonly Icon: LucideIcon;
  readonly text: string;
}

const TRUST_ITEMS: readonly TrustItem[] = [
  { Icon: Flower2, text: "Flores frescas a diario" },
  { Icon: Truck, text: "Entrega el mismo día" },
  { Icon: Sparkles, text: `${BUSINESS.experience} años de experiencia` },
  { Icon: ShieldCheck, text: "Calidad garantizada" },
];

/**
 * Cinta de confianza al pie del Hero. Señales escaneables (icono + frase
 * corta) en lugar del "dashboard" de métricas grandes: la confianza de una
 * florería se transmite con frescura y servicio, no con un tablero de KPIs.
 * Server Component — texto estático, sin JS.
 */
export default function TrustBar() {
  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 sm:pb-6 lg:px-8">
      {/*
        Mobile: grid 2×2 para que los 4 signals sean visibles sin scroll, con
        pb-24 que despeja el FAB de WhatsApp (fixed bottom-right). Desde sm:
        una sola fila que envuelve.
      */}
      <ul
        aria-label="Por qué elegirnos"
        className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-5 text-xs text-(--color-cream) sm:flex sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-2 sm:text-sm"
        style={{
          borderColor: "color-mix(in srgb, var(--color-cream) 24%, transparent)",
        }}
      >
        {TRUST_ITEMS.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon
              className="h-4 w-4 shrink-0 text-(--color-secondary)"
              aria-hidden="true"
              strokeWidth={2}
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
