const testimonials = [
  {
    id: "t-001",
    text: "El ramo de rosas llegó perfectamente fresco y a tiempo. Mi esposa quedó encantada. ¡Definitivamente volveré para su cumpleaños!",
    author: "Carlos M.",
    stars: 5,
  },
  {
    id: "t-002",
    text: "Llevamos años comprando en Kataleya para nuestras reuniones corporativas. La calidad y puntualidad son impecables.",
    author: "Empresa Rimac - Ana L.",
    stars: 5,
  },
  {
    id: "t-003",
    text: "Las orquídeas que compré hace tres semanas siguen hermosas. Se nota la diferencia en la calidad de las flores.",
    author: "Patricia V.",
    stars: 5,
  },
  {
    id: "t-004",
    text: "Pedí flores para condolencias a último momento y llegaron en menos de 2 horas. Excelente servicio y muy discretos.",
    author: "Roberto H.",
    stars: 5,
  },
  {
    id: "t-005",
    text: "El arreglo floral para la boda de mi hija superó todas las expectativas. Gracias por hacer ese día tan especial.",
    author: "María T.",
    stars: 5,
  },
  {
    id: "t-006",
    text: "32 años de experiencia se notan en cada detalle. Las flores más frescas y los arreglos más creativos de Lima.",
    author: "Jorge P.",
    stars: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonios"
      className="scroll-mt-20 px-4 pt-8 pb-24 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-4 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Lo que dicen nuestros clientes
          </p>
          <div className="space-y-3">
            <h2
              className="text-4xl sm:text-5xl"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Testimonios
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8">
              Más de 32 años creando momentos especiales en Lima
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-2xl p-6 space-y-4"
              style={{
                backgroundColor: "var(--color-white)",
                boxShadow:
                  "0 4px 24px color-mix(in srgb, var(--color-dark) 8%, transparent)",
              }}
            >
              <span
                className="block text-5xl leading-none font-serif"
                aria-hidden="true"
                style={{ color: "var(--color-secondary)" }}
              >
                &#8220;
              </span>
              <p className="text-sm leading-7" style={{ color: "var(--color-dark)" }}>
                {testimonial.text}
              </p>
              <div className="space-y-1">
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--color-dark)" }}
                >
                  {testimonial.author}
                </p>
                <p
                  className="text-base tracking-wide"
                  style={{ color: "var(--color-secondary)" }}
                  aria-label={`${testimonial.stars} estrellas`}
                >
                  {"★".repeat(testimonial.stars)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
