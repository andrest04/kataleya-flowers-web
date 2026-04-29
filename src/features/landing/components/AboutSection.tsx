import Image from "next/image";

import SectionHeader from "@/components/ui/SectionHeader";
import { BUSINESS } from "@/lib/constants";

// TODO: reemplazar con foto profesional del local cuando el dueño la provea.
// Mientras tanto usamos un placeholder SVG con la paleta de marca.
const ABOUT_IMAGE_SRC = "/about-placeholder.svg";

interface Highlight {
  readonly value: string;
  readonly label: string;
}

const highlights: readonly Highlight[] = [
  { value: BUSINESS.experience, label: "Años de experiencia" },
  { value: BUSINESS.monthlyOrders, label: "Arreglos al mes" },
  { value: "100%", label: "Dedicación y amor" },
];

export default function AboutSection() {
  return (
    <section
      id="nosotros"
      className="scroll-mt-20 flex items-center justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      style={{
        backgroundColor: "var(--bg-about)",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <header>
            <SectionHeader
              subtitle="Desde Lima para cada ocasión"
              title="Nuestra Historia"
              align="left"
            />
            <p className="max-w-2xl text-lg leading-8">
              En Kataleya Flawers llevamos {BUSINESS.experience} años transformando flores en
              gestos memorables. Nuestra pasión por los arreglos florales y las
              orquídeas nace del cuidado por cada detalle, desde la selección de
              cada tallo hasta la composición final.
            </p>
            <p className="max-w-2xl text-lg leading-8">
              Desde nuestra ubicación en Lima acompañamos celebraciones,
              homenajes y momentos cotidianos con propuestas hechas para
              emocionar y perdurar en la memoria.
            </p>
          </header>

          <article>
            <dl className="grid gap-5 sm:grid-cols-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-[1.5rem] border px-5 py-6"
                  style={{
                    backgroundColor: "var(--color-cream)",
                    borderColor:
                      "color-mix(in srgb, var(--color-accent) 16%, transparent)",
                  }}
                >
                  <dt className="text-4xl leading-none font-heading text-accent">
                    {highlight.value}
                  </dt>
                  <dd className="mt-3 text-sm leading-6">{highlight.label}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <div className="relative overflow-hidden rounded-[2rem]">
          <Image
            src={ABOUT_IMAGE_SRC}
            alt="Nuestra historia"
            width={600}
            height={400}
            className="h-auto w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
