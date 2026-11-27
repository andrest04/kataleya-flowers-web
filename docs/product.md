# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Register

brand

## Users

Clientes finales de una florería en Lima, Perú: parejas que regalan (amor y romance), familiares (cumpleaños, aniversarios, condolencias) y empresas (corporativo y eventos). Llegan mayormente desde Instagram o búsqueda local, en móvil, con intención de compra rápida. El pedido se cierra por WhatsApp; no hay carrito ni checkout.

## Product Purpose

Landing + catálogo que convierte visitas en pedidos por WhatsApp para Kataleya Flowers, florería real con 32 años de trayectoria en Lima. Éxito = conversación de WhatsApp iniciada y confianza transmitida (negocio físico verificable, fotos reales de clientas). El repo incluye además un admin interno (registro: product) para gestionar el catálogo; la superficie primaria es la landing pública.

## Positioning

Combina dos cosas que una florería nueva o de plantilla no puede copiar con honestidad: **trayectoria verificable** (32 años en Lima y una tienda física en Barranco que se puede visitar) y **oficio de florista** (cada ramo se arma a mano, con selección tallo por tallo). La confianza viene de la trayectoria; la emoción, del oficio.

## Operating Context

- El cliente descubre la marca por Instagram o búsqueda local, navega en el celular y cierra el pedido conversando por WhatsApp.
- El catálogo se explora por categoría y por búsqueda (`/catalogo`, `/buscar`); cada producto lleva al pedido por WhatsApp.
- El equipo de la florería gestiona productos, categorías, testimonios y datos del sitio (ubicación, horarios, anuncio) desde un admin interno.
- Los reclamos entran por el Libro de Reclamaciones digital (`/libro-de-reclamaciones`), requisito legal en Perú.

## Capabilities and Constraints

- Sin carrito, checkout ni pagos en línea: WhatsApp es el único canal de cierre.
- Ubicación, horarios y texto de anuncio son editables desde el admin; no se deben fijar en el código ni en el diseño como valores permanentes.
- Superficies: landing pública (primaria), catálogo, búsqueda, Libro de Reclamaciones, y admin con login y recuperación de contraseña.
- Todo texto visible va en español peruano con tildes correctas.

## Evidence on Hand

- Fotos reales de clientas con sus ramos, servidas como testimonios publicados desde Appwrite Storage (`src/features/landing/queries/getPublishedTestimonials.ts`).
- Fotos de producto del catálogo, también en Appwrite Storage y gestionadas desde el admin.
- Trayectoria de 32 años y tienda física en Barranco.
- No existen y no se deben inventar: reseñas con estrellas, cifras de clientes o pedidos, premios, prensa ni testimonios escritos que no estén en el admin.

## Brand Personality

Elegante, romántica, artesanal. Boutique floral premium con trato cercano: el oficio (selección de cada tallo, composición del ramo) es el mensaje. Evoca emoción y confianza, nunca urgencia ni presión de venta.

## Anti-references

- Florería genérica de plantilla (WordPress/Wix): stock photos cliché, carruseles por defecto, tipografía sin intención.
- E-commerce frío tipo marketplace: grilla impersonal y densa estilo Linio/Amazon.
- Página recargada y saturada: la paleta (rojo `#c0392b`, dorado, verde) debe respirar sobre crema, no competir.
- Estética "hecha con IA": gradientes violeta, glassmorphism, eyebrow uppercase en cada sección, hero-metric template, grillas de cards idénticas.

## Design Principles

1. **La foto real vende.** Las clientas reales con sus ramos valen más que stock perfecto; lo auténtico es el diferencial frente a la plantilla.
2. **WhatsApp es la caja.** Cada sección debe acercar al pedido sin fricción; no hay formularios ni pasos intermedios.
3. **Elegancia con oficio.** Serif protagonista, aire generoso, detalles artesanales; restraint que se nota trabajado, no plantilla segura.
4. **Confianza local.** Lima presente: ubicación, horarios, libro de reclamaciones, español peruano correcto (tildes incluidas).
5. **Móvil primero.** La mayoría llega desde Instagram en celular; el desktop es la versión extendida, no al revés.

## Accessibility & Inclusion

WCAG 2.1 AA: contraste ≥4.5:1 en texto, focus visible en todo interactivo, `prefers-reduced-motion` respetado en todas las animaciones (Framer Motion y CSS), targets táctiles ≥44px, semántica correcta y alt text descriptivo. Audiencia amplia no técnica; español claro y natural.
