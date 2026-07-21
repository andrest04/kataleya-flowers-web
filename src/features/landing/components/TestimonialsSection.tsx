import Image from "next/image";

import SectionHeader from "@/components/ui/SectionHeader";
import { BUSINESS } from "@/lib/constants";

const photos = [
  {
    id: "p-001",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c6f000787c85909/view?project=6a2addf8001b6e77ce0d",
    alt: "Clienta con tulipanes morados",
    rotation: 2,
  },
  {
    id: "p-002",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c70003d00a730a0/view?project=6a2addf8001b6e77ce0d",
    alt: "Clienta con bouquet colorido",
    rotation: -1,
  },
  {
    id: "p-003",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c720016e99bc7bc/view?project=6a2addf8001b6e77ce0d",
    alt: "Clienta con rosas blancas y rosas",
    rotation: 3,
  },
  {
    id: "p-004",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c730038cb96079b/view?project=6a2addf8001b6e77ce0d",
    alt: "Clienta con rosas rojas",
    rotation: -2,
  },
  {
    id: "p-005",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c75000ceb507227/view?project=6a2addf8001b6e77ce0d",
    alt: "Clienta con dos bouquets y globo corazón",
    rotation: 1,
  },
  {
    id: "p-006",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c760022f81b8151/view?project=6a2addf8001b6e77ce0d",
    alt: "Clienta con hortensias rosadas",
    rotation: -3,
  },
  {
    id: "p-007",
    src: "https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/6a5f0c7700363a028895/view?project=6a2addf8001b6e77ce0d",
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
