---
name: Kataleya Flawers
description: Florería boutique en Lima — landing que convierte emoción en pedidos por WhatsApp
colors:
  rojo-tulipan: "#c0392b"
  dorado: "#e8b84b"
  verde-tallo: "#2d5a1b"
  crema: "#fdfcfa"
  tinta: "#1a1a1a"
  verde-whatsapp: "#25d366"
  dorado-texto-claro: "#8a6a1f"
  dorado-texto-oscuro: "#f0c668"
typography:
  heading:
    fontFamily: "Crimson Text, Georgia, serif"
    cssVar: "--font-heading"
  body:
    fontFamily: "Mulish, system-ui, sans-serif"
    cssVar: "--font-body"
  hero-h1:
    fontSize: "clamp: text-3xl → sm:text-5xl → lg:text-6xl"
    lineHeight: 1.05
    transform: "uppercase"
  section-heading:
    fontSize: "text-4xl → sm:text-5xl"
  tile-heading:
    fontSize: "text-2xl"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  3xl: "1.375rem"
  4xl: "1.625rem"
  pill: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.crema-blanco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    shadow: "shadow-md (permanente, no solo hover)"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.rojo-tulipan}"
    rounded: "{rounded.pill}"
  button-whatsapp:
    note: "Usa las MISMAS clases que button-primary (blanco/tinta) — ya no es verde. Ver Named Rules."
---

# Design System: Kataleya Flawers

## 0. Estado de este documento

Este doc refleja el código real a la fecha de la última revisión (post-redesign, commits hasta `c07e405`). Fuente verificada: `src/app/globals.css`, `src/components/ui/Button.tsx`, `src/app/layout.tsx`, componentes de landing/catálogo/navbar. Donde el sistema visual actual **contradice** una regla histórica del diseño original, se documenta el estado real primero y se marca la divergencia explícitamente — no se asume que la intención original sigue vigente.

## 1. Overview

**Creative North Star: "El Taller de la Florista"**

El sistema visual nace de la mesa de trabajo: tallos elegidos uno a uno, tijeras, papel, el ramo componiéndose delante del cliente. Todo lo que se ve debe sentirse **hecho a mano por alguien que sabe** — elegante, romántico, artesanal — nunca generado, nunca de plantilla. La fotografía real es la materia prima del sistema: ramos reales en el hero, clientas reales de Lima en las fotos de testimonios, la mesa de la florista en el About.

El sistema rechaza explícitamente (de `docs/product.md`): la florería genérica de plantilla WordPress/Wix, el e-commerce frío tipo marketplace, la saturación de color que grita, y la estética "hecha con IA" (gradientes violeta, glassmorphism, eyebrows en cada sección, hero-metric template).

**Key Characteristics (verificadas en código actual):**
- Fotografía real protagonista en hero, catálogo y testimonios
- Serif (Crimson Text) para headings; sans (Mulish) para body/UI
- Crema como lienzo, rojo tulipán como voz, dorado como destello escaso
- Bordes delicados vía `outline` de 1px en vez de `border` en varias fotos/tiles
- WhatsApp es la caja: múltiples CTAs a lo largo de la página apuntan al chat (ver §6 — el verbo todavía no está unificado)

## 2. Colors

Paleta fija de negocio (definida en `src/app/globals.css`, **prohibido modificarla** sin aprobación explícita).

### Primary
- **Rojo Tulipán** (`--color-primary`, #c0392b): la voz de la marca. Títulos de sección, AnnouncementBar, hover de botones primarios/whatsapp, logo.

### Secondary
- **Dorado** (`--color-secondary`, #e8b84b): el destello — íconos de confianza (estrellas de testimonios), kicker del hero, acentos de foco (`focus-visible:outline-(--color-secondary)` en CategoryTile). **Solo decorativo o sobre fondos oscuros verificados** — sobre claros falla AA (1.8:1), ver Named Rules.

### Tertiary
- **Verde Tallo** (`--color-accent`, #2d5a1b): fondo del footer, badge "ABIERTO" (`BusinessHoursBadge`).
- **Verde WhatsApp** (`--color-whatsapp`, #25d366): definido en `globals.css` pero **actualmente no aplicado a ningún botón** — el variant `whatsapp` de `Button.tsx` usa blanco/tinta, igual que `primary`. Queda como token de canal disponible, no como color activo en UI. Ver Named Rules.

### Neutral
- **Crema** (`--color-cream`, #fdfcfa): fondo de página.
- **Tinta** (`--color-dark`, #1a1a1a): texto body.
- **Blanco** (`--color-white`, #ffffff): fondo de botones primary/whatsapp, popover.
- **Derivados** (`color-mix` en `globals.css`, no redefinir en hex): `--color-surface` (~6% tinta sobre crema), `--color-border` (~12% tinta), `--color-muted` (50% tinta transparente), `--bg-about` (~10% dorado sobre crema).

### Named Rules

**La Regla del Dorado-No-Es-Texto.** El dorado #e8b84b está prohibido como color de texto sobre crema, blanco o fotos claras (contraste 1.8:1, falla WCAG AA). Sobre fondos claros, el texto dorado usa `--color-gold-text` (#8a6a1f, 4.92:1 sobre crema); sobre el verde del footer usa `--color-gold-text-dark` (#f0c668, 5.01:1). **Estado: implementado** (P1-1 del audit, ambos tokens presentes en `globals.css`).

**El WhatsApp verde quedó sin uso real (divergencia abierta).** El variant `whatsapp` de `Button.tsx` es idéntico al `primary` (blanco/tinta) — no usa `--color-whatsapp`. El audit (`QA/audit/10-design-audit-landing.md`, P2-1) señala además que donde sí aparece verde-sobre-blanco el contraste es 2.0:1 (falla AA). **Estado: sin resolver.** Antes de usar `--color-whatsapp` en un botón nuevo, verificar contraste real contra el fondo.

## 3. Typography

**Heading Font:** Crimson Text (fallback Georgia, serif) — vía `next/font/google` como `--font-heading` (`src/app/layout.tsx`)
**Body Font:** Mulish (fallback system-ui, sans-serif) — vía `next/font/google` como `--font-body`

> ⚠️ Divergencia con `CLAUDE.md`: ese archivo todavía dice "Playfair Display + Lato". Las fuentes reales cargadas en `layout.tsx` son Crimson Text + Mulish.

**Character:** Serif para hablar (headings, nombres); sans neutra para explicar (body, labels, formularios).

### Hierarchy (clases reales, no escala custom con `clamp()`)
- **Hero H1**: `text-3xl sm:text-5xl lg:text-6xl`, `leading-[1.05]`, `uppercase`, `text-balance` (`HeroContent.tsx`)
- **Section heading** (`SectionHeader`): `text-4xl sm:text-5xl font-heading text-primary`
- **Tile heading** (CategoryTile, testimonios): `text-2xl font-heading`
- **Body:** Mulish por defecto vía `body { @apply font-body }` en `globals.css`

No hay una escala tipográfica custom vía `clamp()` como en versiones anteriores del sistema — el scale actual usa breakpoints estándar de Tailwind (`text-3xl`/`sm:text-5xl`/`lg:text-6xl`, etc).

### Named Rules
**La Regla Serif-Habla-Sans-Explica.** Crimson Text solo donde la marca habla (headings, nombres). Todo lo funcional (body, labels, precios, formularios) es Mulish.

## 4. Elevation

A diferencia del sistema original ("plano por defecto, sombra solo en foto o estado"), el código actual usa sombra en más lugares — no está limitada a fotografía o respuesta de scroll.

### Shadow Vocabulary (verificado en código)
- **`shadow-md` permanente en botones:** `Button.tsx` aplica `shadow-md` sin condición a los variants `primary` y `whatsapp` — no es hover-only ni scroll-triggered.
- **`shadow-lg` permanente en fotos de testimonios:** `TestimonialsGallery.tsx` — consistente con "la fotografía proyecta sombra".
- **`shadow-lg` en hover de cards:** `ProductCard.tsx`, `CategoryCard.tsx` (no `CategoryTile.tsx` de la landing, que no usa sombra) — sombra como micro-interacción de hover.
- **`shadow-sm`:** botones de navegación del carrusel de testimonios, CTA sticky del `MobileDrawer`.
- **Navbar:** sombra vía `boxShadow` inline (`0 14px 36px color-mix(...)`), activada por `isScrolled` (scroll > 180px + debounce 500ms) — este caso sí sigue la regla original de "sombra solo al despertar".
- **`shadow-xl`/`shadow-2xl`:** no se usan en ningún componente actual (el sistema de "papel polaroid" con esas sombras específicas ya no existe).

### Named Rules
**La Regla Plano-Por-Defecto queda parcialmente vigente.** Navbar y cards de catálogo siguen el patrón "sombra solo en hover/estado". Los botones `primary`/`whatsapp` **no** la siguen — tienen `shadow-md` en reposo. No tratar esto como bug sin confirmarlo con quien diseñó el redesign; documentado aquí como el estado real.

## 5. Components

### Buttons (`src/components/ui/Button.tsx`)
- **Shape:** `primary`/`whatsapp` → `rounded-sm`; `secondary` → `rounded-full` (pill); `ghost`/`destructive` → `rounded-lg`. **No hay una forma única de botón** — cada variant tiene su propio radius.
- **Primary:** fondo blanco (`--color-white`), texto tinta, `shadow-md`, `uppercase tracking-[0.08em]`, hover invierte a fondo rojo tulipán / texto blanco (`hover:!bg-(--color-primary) hover:!text-(--color-white)`)
- **Secondary:** outline rojo tulipán, fondo transparente, texto rojo, pill, `hover:opacity-80`
- **WhatsApp:** clases **idénticas** a `primary` (blanco/tinta) — no verde. Ver §2 Named Rules.
- **Tamaños:** `sm` (h-10), `md` (h-12), `lg` (h-14, agrega `uppercase tracking-[0.08em]` — aunque `primary`/`whatsapp` ya lo aplican en todos los tamaños)
- **Ghost / Destructive:** `rounded-lg`, uso interno/admin

### Cards / Containers
- **Corner Style:** varía por componente — `rounded-md` (CategoryTile, tiles promo), `rounded-3xl` (fotos de testimonios), `rounded-lg`/`rounded-xl` en admin. Ya no hay una escala de radius única para "cards".
- **Border:** varios componentes usan `outline outline-1 -outline-offset-1 outline-black/10` en vez de `border` (CategoryTile, PromoBannerCard, EditorialTile, fotos de testimonios) — visualmente similar pero no participa en el layout box.

### Navigation (`src/components/shared/Navbar`)
- Header **siempre** `bg-(--color-cream)` con `border-b border-(--color-primary)` — **ya no es transparente sobre el hero** como en la versión original del sistema.
- `z-[90]`, auto-hide al scrollear hacia abajo (`translate-y-full`), sombra solo cuando `isScrolled` (scroll > 180px + debounce 500ms).
- Incluye `AnnouncementBar` (franja superior roja) sobre el header principal.
- Overlay de búsqueda/menú catálogo en desktop: `z-[85]`.

### Category Tile — landing (`CategoryTile.tsx`, distinto de `CategoryCard.tsx` del catálogo)
- Foto `aspect-[4/5]`, `outline` 1px en vez de scrim/gradiente sobre la imagen (ya no hay overlay oscuro con texto encima de la foto).
- Hover: zoom `scale-[1.03]` 700ms `ease-out`, `motion-safe`.
- Nombre de categoría en Crimson Text debajo de la foto (no superpuesto) — sin CTA de texto tipo "Ver arreglos".
- `CategoryCard.tsx` (usado fuera de la landing) es distinto: `aspect-[4/3]`, `shadow-lg` en hover, sí tiene CTA "Ver productos" con chevron animado.

### Testimonial Photo Card (antes "Polaroid" — el nombre ya no aparece en el código)
- Contenedor `h-52 w-44` (`sm:h-60 sm:w-52`), `rounded-3xl`, `shadow-lg` permanente, `outline` 1px en vez de borde blanco grueso.
- Rotación vía inline style data-driven (no una clase fija -3°/+3°).
- Ya no es un marco blanco tipo papel físico — es una tarjeta con esquinas redondeadas grandes.

### Badges / Chips
- **BusinessHoursBadge:** pill, fondo `--color-accent` "ABIERTO" / `--color-primary` "CERRADO", texto crema, calcula hora de Perú.
- **FilterChip:** pill, tinte 10% rojo tulipán, siempre en estado "activo/removible" (con X).
- **PillToggle:** pill, 4 combinaciones de estado (activo/inactivo × filled/outline), color configurable (`primary`/`accent`) vía prop.

## 6. Do's and Don'ts

### Do:
- **Do** usar SIEMPRE `var(--color-*)` o `color-mix(...)` — cero hex/rgb hardcodeado en clases o `style` (regla ESLint del proyecto).
- **Do** verificar contraste real (≥4.5:1 texto, 3:1 large/íconos) sobre el FONDO REAL, incluida cada foto.
- **Do** `LazyMotion + m` para Framer Motion, `motion-safe:`/`motion-reduce:` en toda animación, `next/image` siempre.
- **Do** respetar la escala z-index real: Sheet/AlertDialog/AdminSidebar `z-50` → desktop search backdrop `z-[85]` → Navbar `z-[90]` → Lightbox `z-[100]` → skip link `zIndex: 200` (inline) → `--z-hero-overlay` (10, aislado al carousel del Hero).
- **Do** revisar `Button.tsx` antes de asumir que un botón nuevo debe ser pill — cada variant tiene su propio radius, no hay una forma única.

### Don't:
- **Don't** parecer "florería genérica de plantilla" (WordPress/Wix, stock cliché, carruseles por defecto) — anti-referencia literal de `docs/product.md`.
- **Don't** parecer "e-commerce frío tipo marketplace" (grilla impersonal densa estilo Linio/Amazon).
- **Don't** estética "hecha con IA": gradientes violeta, glassmorphism, gradient text, hero-metric template, card grids idénticas.
- **Don't** dorado #e8b84b como texto sobre fondos claros (La Regla del Dorado-No-Es-Texto).
- **Don't** tocar la paleta, agregar dependencias, ni modificar `app/layout.tsx` sin aprobación explícita (`CLAUDE.md`).
- **Don't** modales custom (usar `LightboxDialog`/`ConfirmDialog`), SVG inline para íconos comunes (usar lucide-react).
- **Don't** español sin tildes en NINGÚN string visible.
- **Don't** asumir que `--color-whatsapp` está en uso solo porque el token existe en `globals.css` — hoy no lo está (§2).

## 7. Deuda de diseño conocida (QA/audit/10-design-audit-landing.md)

P1s (accesibilidad/contraste crítico) están implementados. **P2s siguen abiertos** a la fecha de esta revisión:

- **P2-1:** contraste blanco-sobre-verde-WhatsApp (2.0:1, falla AA) en tarjetas de contacto/footer.
- **P2-2:** el verbo del CTA de WhatsApp **no está unificado** — conviven "Pedir por WhatsApp" (AnnouncementBar, Hero, PromoBanners, DiscoverMoreSection, Footer), "Hacer pedido" (Navbar desktop/mobile) y "Consultar por WhatsApp" (detalle de producto). Antes de agregar un CTA nuevo, no inventar un cuarto verbo — pero tampoco asumir cuál de los tres es el "correcto" sin confirmar con quien lleva el negocio.
- **P2-3:** repetición de eyebrows uppercase en varias secciones.
- **P2-5:** métrica vanidosa en la sección About.

P2-4 (testimonios sin citas reales) parece resuelto en el código actual (nombres, ocasión y quote reales en `TestimonialsGallery`), aunque el audit doc todavía no lo refleja.
