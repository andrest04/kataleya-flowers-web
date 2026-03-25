import Image from "next/image";

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
        <div className="space-y-4 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Momentos especiales
          </p>
          <div className="space-y-3">
            <h2
              className="text-4xl sm:text-5xl"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Clientas felices
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8">
              Más de 32 años creando momentos especiales en Lima
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative shrink-0 overflow-hidden rounded-sm border-4 border-white shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                width: 200,
                height: 280,
                transform: `rotate(${photo.rotation}deg)`,
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
