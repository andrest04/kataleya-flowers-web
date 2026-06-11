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
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Lato, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.78
  label:
    fontFamily: "Lato, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  pill: "9999px"
spacing:
  gutter: "1rem"
  card: "1.25rem"
  section-y: "5rem"
  section-y-lg: "7rem"
  container-max: "80rem"
components:
  button-primary:
    backgroundColor: "{colors.rojo-tulipan}"
    textColor: "{colors.crema}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.crema}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
  button-whatsapp:
    backgroundColor: "{colors.verde-whatsapp}"
    textColor: "{colors.crema}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
---

# Design System: Kataleya Flawers

## 1. Overview

**Creative North Star: "El Taller de la Florista"**

El sistema visual nace de la mesa de trabajo: tallos elegidos uno a uno, tijeras, papel, el ramo componiéndose delante del cliente. Todo lo que se ve debe sentirse **hecho a mano por alguien que sabe** — elegante, romántico, artesanal — nunca generado, nunca de plantilla. La fotografía real es la materia prima del sistema: ramos reales en el hero, clientas reales de Lima en polaroids, la mesa de la florista en el About. La paleta y la tipografía son el marco del taller; las flores son el cuadro.

La densidad es generosa en aire: una idea dominante por fold, scroll pausado, secciones que respiran (`5rem`/`7rem` vertical). El sistema rechaza explícitamente (de PRODUCT.md): la florería genérica de plantilla WordPress/Wix, el e-commerce frío tipo marketplace, la saturación de color que grita, y la estética "hecha con IA" (gradientes violeta, glassmorphism, eyebrows en cada sección, hero-metric template).

**Key Characteristics:**
- Fotografía real protagonista; la UI es marco, no decoración
- Serif romántica (Playfair) solo para hablar; sans (Lato) para explicar
- Crema como lienzo, rojo tulipán como voz, dorado como destello escaso
- Pills suaves, bordes delicados, sombras solo donde hay foto o estado
- WhatsApp es la caja: cada fold acerca al pedido sin fricción

## 2. Colors: La Paleta del Taller

Paleta fija de negocio (definida en `src/app/globals.css`, **prohibido modificarla** sin aprobación explícita); restraint sobre crema con una voz roja y destellos dorados.

### Primary
- **Rojo Tulipán** (#c0392b): la voz de la marca. Títulos de sección, botón primario, logo en estado scrolled. Es el color que HABLA; nunca como fondo masivo.

### Secondary
- **Dorado** (#e8b84b): el destello. Íconos de confianza, precios sobre scrims oscuros, kicker del hero, acentos hover. **Solo como texto sobre fondos oscuros verificados** — sobre claros falla AA (1.8:1), ver Named Rules.

### Tertiary
- **Verde Tallo** (#2d5a1b): el sostén. Subtítulos de SectionHeader, fondo del footer, badge ABIERTO. Aparece donde la marca toca tierra (cierre, datos, confianza).
- **Verde WhatsApp** (#25d366): exclusivo del canal WhatsApp (FAB, botones de pedido). No es color de marca; es color de canal.

### Neutral
- **Crema** (#fdfcfa): el lienzo. Fondo de página, texto sobre fotos oscuras y botones rojos.
- **Tinta** (#1a1a1a): texto body y scrims del hero (via `color-mix`).
- **Derivados** (canónicos como `color-mix` en `globals.css`, no redefinir en hex): `--color-surface` (~6% tinta sobre crema, cards), `--color-border` (~12% tinta, bordes), `--color-muted` (50% tinta transparente, texto secundario), `--bg-about` (~10% dorado sobre crema, fondo del About).

### Named Rules
**La Regla del Dorado-No-Es-Texto.** El dorado #e8b84b está prohibido como color de texto sobre crema, blanco o fotos claras (contraste 1.8:1, falla WCAG AA). Sobre fondos claros, el texto dorado usa `--color-gold-text` (#8a6a1f, 4.92:1 sobre crema); sobre el verde del footer usa `--color-gold-text-dark` (#f0c668, 5.01:1). Ambos definidos en `globals.css` (ver QA/audit/10 P1-1). El dorado vivo #e8b84b vive en fills, íconos y texto sobre scrims oscuros verificados.

**La Regla de la Foto Real.** La calidez de la página la pone la fotografía, no el fondo. El lienzo se queda crema y neutro; jamás compensar "calidez de marca" tiñendo fondos.

## 3. Typography

**Display Font:** Playfair Display (fallback Georgia, serif) — 400/600/700, vía `next/font/google` como `--font-heading`
**Body Font:** Lato (fallback system-ui, sans-serif) — 400/700, vía `next/font/google` como `--font-body`

**Character:** Serif romántica de alto contraste para la emoción; sans humanista neutra para la información. La pareja es clásica florista-boutique: Playfair pone el perfume, Lato pone los datos.

### Hierarchy
- **Display** (700, clamp 3rem→4.5rem, lh 1.05): solo el H1 del hero ("Flores que emocionan"). `text-balance`.
- **Headline** (700, 2.25rem→3rem, lh 1.15): H2 de sección en Rojo Tulipán.
- **Title** (600, 1.5rem–1.875rem, lh 1.3): headings de tiles y cards, H3 de contacto.
- **Body** (400, 1.125rem, lh 1.78): párrafos; máx ~70ch.
- **Label** (600–700, 0.875rem, tracking 0.18–0.2em, UPPERCASE): kickers y botones `lg` (tracking 0.08em). Uso CONTADO — ver Don'ts.

### Named Rules
**La Regla Serif-Habla-Sans-Explica.** Playfair solo donde la marca habla (display, headlines, nombres). Todo lo funcional (body, labels, precios, formularios) es Lato. Nunca Playfair en texto largo ni Lato en el titular del hero.

## 4. Elevation

Plano por defecto con capas tonales: la profundidad la dan los derivados de tinta (`--color-surface`, `--color-border`) y los scrims sobre fotografía, no las sombras. Las sombras existen solo en dos situaciones: **fotografía física** (polaroids `shadow-xl`, hover `shadow-2xl` — simulan papel real) y **respuesta a estado** (navbar al scrollear gana sombra 14px + blur 8px; nunca en reposo).

### Shadow Vocabulary
- **Papel polaroid** (`shadow-xl` Tailwind): fotos de clientas en reposo; son objetos físicos, la sombra es su materialidad.
- **Papel levantado** (`shadow-2xl` en hover): la polaroid que se mira de cerca.
- **Navbar despierta** (sombra suave 14px al scrollear): señal de que el header se separó del hero.

### Named Rules
**La Regla Plano-Por-Defecto.** Las superficies de UI (cards, botones, inputs) viven planas con borde `--color-border`. Si un elemento de UI pide sombra en reposo, la respuesta es no; solo la fotografía y los cambios de estado proyectan sombra.

## 5. Components

Carácter global: **refinados y contenidos** — pills suaves, bordes delicados, transiciones ease-out 200–700ms, `motion-safe:` siempre.

### Buttons
- **Shape:** pill completa (`rounded-full`, 9999px); tamaño `lg` agrega UPPERCASE + tracking 0.08em
- **Primary:** Rojo Tulipán con texto crema, `px-7 py-3` (lg)
- **Secondary:** outline (borde primario o crema según fondo), bg transparente, mismo pill
- **WhatsApp:** Verde WhatsApp con texto blanco — exclusivo de acciones de pedido (⚠ contraste 2.0:1 pendiente de fix, ver QA/audit/10 P2-1)
- **Hover / Focus:** oscurecimiento sutil del fill; `focus-visible:ring-2` con `--ring`
- **Ghost / Destructive:** `rounded-lg`, solo admin

### Cards / Containers
- **Corner Style:** `rounded-xl`/`rounded-2xl` (0.875–1.125rem); nunca radii arbitrarios fuera de escala
- **Background:** `--color-surface` o crema
- **Shadow Strategy:** plano + borde (ver Elevation)
- **Border:** 1px `--color-border` (jamás side-stripes de color)
- **Internal Padding:** 1.25–1.5rem

### Navigation
- Header fijo `z-[90]`, transparente sobre el hero (texto crema) → crema con sombra al scrollear (texto tinta/rojo). Links Lato uppercase pequeños; CTA "Hacer pedido" pill rojo. Móvil: drawer con CTA sticky en thumb zone.

### Category Tile (signature)
- Foto full-bleed `aspect-[3/4]`, scrim inferior `linear-gradient(to top, tinta 62% → transparent 72%)`, nombre en Playfair crema + precio dorado (sobre scrim oscuro = permitido), hover: zoom 1.06 700ms + CTA "Ver arreglos" que asciende. Bento desktop (hero 2×2 + wide), snap-carousel móvil 72vw.

### Polaroid (signature)
- Foto 160×220 (md 200×280), borde blanco 4px, `rounded-sm`, rotación -3°/+3°, `shadow-xl`. Es EL diferencial visual de la página: clientas reales, calles reales de Lima.

### Badges / Chips
- **BusinessHoursBadge:** pill Verde Tallo "ABIERTO" / Rojo Tulipán "CERRADO", calcula hora de Perú
- **FilterChip / PillToggle:** tinte 10% del color activo, pill

## 6. Do's and Don'ts

### Do:
- **Do** usar SIEMPRE `var(--color-*)` o `color-mix(...)` — cero hex/rgb hardcodeado en clases o `style` (regla ESLint del proyecto).
- **Do** dejar que la fotografía cargue la emoción; la UI enmarca con crema, borde fino y aire (`5rem`/`7rem` entre secciones).
- **Do** verificar contraste real (≥4.5:1 texto, 3:1 large/íconos) sobre el FONDO REAL, incluida cada foto del carrusel.
- **Do** `LazyMotion + m` para Framer Motion, `motion-safe:`/`prefers-reduced-motion` en toda animación, `next/image` siempre.
- **Do** respetar la escala z-index documentada: FAB `z-50` → Navbar `z-[90]` → Lightbox `z-[100]` → skip link 200.
- **Do** un solo verbo de pedido repetido verbatim en toda la página (pendiente de unificar, QA/audit/10 P2-2).

### Don't:
- **Don't** parecer "florería genérica de plantilla" (WordPress/Wix, stock cliché, carruseles por defecto) — anti-referencia literal de PRODUCT.md.
- **Don't** parecer "e-commerce frío tipo marketplace" (grilla impersonal densa estilo Linio/Amazon).
- **Don't** recargar ni saturar: la paleta respira sobre crema; si el rojo, el dorado y el verde compiten en un mismo fold, sobra uno.
- **Don't** estética "hecha con IA": gradientes violeta, glassmorphism, gradient text, hero-metric template (número grande + label chico ×3), card grids idénticas, eyebrow uppercase en CADA sección (máximo 1-2 kickers deliberados por página).
- **Don't** dorado #e8b84b como texto sobre fondos claros (La Regla del Dorado-No-Es-Texto).
- **Don't** tocar la paleta, agregar dependencias, ni modificar `app/layout.tsx` sin aprobación explícita (CLAUDE.md).
- **Don't** modales custom (usar `LightboxDialog`/`ConfirmDialog`), SVG inline para íconos comunes (usar lucide-react), ni side-stripe borders como acento.
- **Don't** español sin tildes en NINGÚN string visible — "español peruano correcto" es principio de marca.
