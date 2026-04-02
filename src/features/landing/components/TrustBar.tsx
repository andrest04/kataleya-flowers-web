"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue } from "framer-motion";
import { BUSINESS } from "@/lib/constants";

type Stat =
  | { kind: "numeric"; target: number; suffix: string; label: string }
  | { kind: "static"; display: string; label: string };

const stats: Stat[] = [
  {
    kind: "numeric",
    target: parseInt(BUSINESS.experience, 10),
    suffix: " años",
    label: "de experiencia en Lima",
  },
  {
    kind: "numeric",
    target: 500,
    suffix: "+",
    label: "arreglos al mes",
  },
  {
    kind: "static",
    display: "Entrega",
    label: "el mismo día en Lima",
  },
  {
    kind: "numeric",
    target: 100,
    suffix: "%",
    label: "satisfacción garantizada",
  },
];

function AnimatedStat({
  stat,
  showSeparator,
}: {
  stat: Stat;
  showSeparator: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const [value, setValue] = useState(0);

  useEffect(() => {
    return count.on("change", (v) => setValue(Math.round(v)));
  }, [count]);

  useEffect(() => {
    if (inView && stat.kind === "numeric") {
      animate(count, stat.target, { duration: 1.5, ease: "easeOut" });
    }
  }, [inView, stat, count]);

  const displayText =
    stat.kind === "numeric" ? `${value}${stat.suffix}` : stat.display;

  return (
    <li ref={ref} className="flex flex-col items-center text-center relative">
      {showSeparator && (
        <span
          className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-10 w-px"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-cream) 20%, transparent)",
          }}
          aria-hidden="true"
        />
      )}
      <span
        className="text-2xl md:text-3xl font-bold"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-secondary)",
        }}
      >
        {displayText}
      </span>
      <span
        className="text-sm mt-1 opacity-75"
        style={{ color: "var(--color-cream)" }}
      >
        {stat.label}
      </span>
    </li>
  );
}

export default function TrustBar() {
  return (
    <section
      aria-label="Razones para elegirnos"
      style={{
        background:
          "linear-gradient(to right, var(--color-dark), color-mix(in srgb, var(--color-primary) 18%, var(--color-dark)), var(--color-dark))",
        borderTop: "2px solid var(--color-secondary)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0">
          {stats.map((stat, index) => (
            <AnimatedStat
              key={stat.kind === "numeric" ? stat.target : stat.display}
              stat={stat}
              showSeparator={index > 0}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
