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
 * Franja de confianza independiente entre Catálogo y Testimonios. Señales
 * escaneables (icono + frase corta) en lugar de un "dashboard" de métricas:
 * la confianza de una florería se transmite con frescura y servicio, no con
 * un tablero de KPIs. Server Component — texto estático, sin JS.
 */
export default function TrustBar() {
  return (
    <div
      className="border-y"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      <ul
        aria-label="Por qué elegirnos"
        className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-8 text-sm text-(--color-dark) sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-3 sm:px-6 lg:px-8"
      >
        {TRUST_ITEMS.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5">
            <Icon
              className="h-4 w-4 shrink-0 text-(--color-primary)"
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
