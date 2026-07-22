import SectionHeader from "@/components/ui/SectionHeader";
import { BUSINESS } from "@/lib/constants";

import TestimonialsGallery from "./TestimonialsGallery";

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

const testimonials = [
  {
    id: "t-001",
    name: "Mariana R.",
    detail: "Compra verificada · Cumpleaños",
    quote: "El arreglo llegó precioso y justo a tiempo para hacer el día todavía más especial.",
    photos: [photos[0], photos[1], photos[2]],
  },
  {
    id: "t-002",
    name: "Lucía M.",
    detail: "Compra verificada · Aniversario",
    quote: "Me ayudaron a elegir flores que se sintieran personales. La presentación fue hermosa.",
    photos: [photos[3], photos[4], photos[5]],
  },
  {
    id: "t-003",
    name: "Valeria C.",
    detail: "Compra verificada · Sorpresa",
    quote: "Todo fue muy sencillo desde el pedido hasta la entrega. Volvería a elegirlas sin dudar.",
    photos: [photos[6], photos[0], photos[4]],
  },
  {
    id: "t-004",
    name: "Sofía P.",
    detail: "Compra verificada · Agradecimiento",
    quote: "Las flores tenían una combinación delicada y fresca. Fue un regalo que encantó.",
    photos: [photos[5], photos[2], photos[3]],
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonios"
      className="scroll-mt-20 pt-8 pb-24"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          subtitle="Momentos especiales"
          title="Clientas felices"
          description={`Historias de quienes eligieron flores para celebrar en ${BUSINESS.location}`}
        />
      </div>

      <TestimonialsGallery testimonials={testimonials} />
    </section>
  );
}
