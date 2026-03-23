import { BUSINESS } from "@/lib/constants";

const deliveryCards = [
  {
    icon: "🚀",
    title: "Mismo Día",
    description:
      "Pedidos antes de las 2:00pm tienen entrega garantizada el mismo día en Lima Metropolitana",
  },
  {
    icon: "📍",
    title: "Lima Metropolitana",
    description:
      "Entregamos en todos los distritos de Lima: Miraflores, San Isidro, La Molina, Surco, Barranco y más",
  },
  {
    icon: "🌸",
    title: "Flores Frescas",
    description:
      "Garantizamos la frescura de cada arreglo. Si no estás satisfecho, lo reponemos sin costo adicional",
  },
  {
    icon: "💬",
    title: "Pide por WhatsApp",
    description:
      "Contáctanos y en minutos te confirmamos disponibilidad, precio final y hora de entrega estimada",
  },
];

export default function DeliverySection() {
  return (
    <section
      id="delivery"
      className="scroll-mt-32 px-4 pt-8 pb-24 sm:px-6 lg:px-8"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-accent) 8%, var(--color-cream))",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-4 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Llevamos flores a toda Lima
          </p>
          <div className="space-y-3">
            <h2
              className="text-4xl sm:text-5xl"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Delivery en Lima
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8">
              Recibí tus flores frescas sin salir de casa
            </p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {deliveryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl p-6 space-y-3 shadow-sm transition-transform duration-200 hover:-translate-y-1"
              style={{ backgroundColor: "var(--color-white)" }}
            >
              <span className="block text-4xl leading-none" aria-hidden="true">
                {card.icon}
              </span>
              <p
                className="font-bold text-base"
                style={{ color: "var(--color-dark)" }}
              >
                {card.title}
              </p>
              <p
                className="text-sm leading-6"
                style={{ color: "color-mix(in srgb, var(--color-dark) 65%, transparent)" }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-base" style={{ color: "var(--color-dark)" }}>
            ¿Tu distrito no está en la lista? Consúltanos
          </p>
          <a
            href={BUSINESS.whatsappWithMessage(
              "Hola, quiero consultar si hacen delivery a mi distrito"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full px-8 py-3 font-semibold text-sm tracking-wide transition-opacity duration-200 hover:opacity-90"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-cream)",
            }}
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
