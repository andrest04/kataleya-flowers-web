import Image from "next/image";

import SectionHeader from "@/components/ui/SectionHeader";
import { BUSINESS } from "@/lib/constants";

const photos = [
  {
    id: "p-001",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452924/chica-gafas-tulipanes-morados_h6dter.jpg",
    alt: "Clienta con tulipanes morados",
    rotation: 2,
  },
  {
    id: "p-002",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452923/mujer-saco-negro-bouquet-colorido_tipbdr.jpg",
    alt: "Clienta con bouquet colorido",
    rotation: -1,
  },
  {
    id: "p-003",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452923/mujer-bouquet-rosas-blancas-rosas_lzwmzg.jpg",
    alt: "Clienta con rosas blancas y rosas",
    rotation: 3,
  },
  {
    id: "p-004",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452922/mujer-rojo-rosas-rojas_z3p4w2.jpg",
    alt: "Clienta con rosas rojas",
    rotation: -2,
  },
  {
    id: "p-005",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452922/chica-dos-bouquets-globo-corazon_xofgxq.jpg",
    alt: "Clienta con dos bouquets y globo corazón",
    rotation: 1,
  },
  {
    id: "p-006",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452922/chica-ramo-hortensias-rosadas_mzfdlg.jpg",
    alt: "Clienta con hortensias rosadas",
    rotation: -3,
  },
  {
    id: "p-007",
    src: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774452922/chica-rosas-azules_h6m8ow.jpg",
    alt: "Clienta con rosas azules",
    rotation: 2,
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonios"
      className="scroll-mt-20 pt-8 pb-24"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="Momentos especiales"
          title="Clientas felices"
          description={`Más de ${BUSINESS.experience} años creando momentos especiales en ${BUSINESS.location}`}
        />
      </div>

      <div className="mx-auto mt-12 max-w-4xl overflow-hidden px-4 sm:px-6 md:overflow-visible lg:px-8">
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:flex-wrap md:justify-center md:gap-6 md:overflow-visible md:pb-0">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative h-[220px] w-[160px] shrink-0 snap-center overflow-hidden rounded-sm border-4 border-white shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl md:h-[280px] md:w-[200px]"
              style={{ transform: `rotate(${photo.rotation}deg)` }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 200px, 160px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
