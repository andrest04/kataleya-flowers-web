import { BUSINESS } from "@/lib/constants";

const trustItems = [
  {
    stat: `${BUSINESS.experience} años`,
    label: "de experiencia en Lima",
  },
  {
    stat: BUSINESS.monthlyOrders,
    label: "arreglos al mes",
  },
  {
    stat: "Entrega",
    label: "el mismo día en Lima",
  },
  {
    stat: "100%",
    label: "satisfacción garantizada",
  },
] as const;

export default function TrustBar() {
  return (
    <section
      aria-label="Razones para elegirnos"
      style={{ backgroundColor: "var(--color-dark)" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0">
          {trustItems.map((item, index) => (
            <li
              key={item.stat}
              className="flex flex-col items-center text-center relative"
              style={{ color: "var(--color-cream)" }}
            >
              {/* Vertical separator — only between items on desktop */}
              {index > 0 && (
                <span
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-10 w-px"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-cream) 20%, transparent)" }}
                  aria-hidden="true"
                />
              )}

              <span
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.stat}
              </span>
              <span className="text-sm mt-1 opacity-75">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
