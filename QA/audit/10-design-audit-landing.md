# 10 — Auditoría de diseño: Landing (2026-06-05)

> **Estado: P1 IMPLEMENTADO (2026-06-11).** P1-1/P1-2/P1-3 implementados y verificados en browser (1440px + 390px); P1-4 sigue pendiente del lado de la dueña (Google Business Profile). P2s sin implementar. Tokens creados: `--color-gold-text: #8a6a1f` (4.92:1 sobre crema) y `--color-gold-text-dark: #f0c668` (5.01:1 sobre verde footer); el candidato `#9a7625` del backlog se descartó (4.10:1, falla AA). Kicker del hero pasó a crema (alternativa acordada). Falta: re-correr critique para medir delta vs 28/40.
> Reporte completo: `.impeccable/critique/2026-06-05T17-43-22Z__src-app-public-page-tsx.md` · Contexto estratégico: `PRODUCT.md` (raíz)

## Metodología

- **Assessment A**: design review ciega (agente independiente, Nielsen + cognitive load + personas, browser propio en 1440×900 y 390×844).
- **Assessment B**: detector determinístico (`detect.mjs` CLI = 0 hallazgos) + inyección de `detect.js` en browser (20 hallazgos, ver falsos positivos abajo).
- **Pasada visual del orquestador**: Chrome DevTools en ambos viewports, verificación matemática de contrastes.
- A y B aislados entre sí; los hallazgos donde coinciden las tres fuentes se consideran robustos.

## Score

**28/40 Nielsen (banda: Good)** — 8 heurísticas aplicables (sin formularios → #5 y #9 n/a). Laggard: **#4 Consistencia (2/4)**.
**Anti-slop: PASS con reservas** — las fotos reales (clientas, ramos) son el antídoto; el tell restante es el eyebrow uppercase repetido en 5 secciones.

## Decisiones del dueño (2026-06-05)

| Tema | Decisión |
|------|----------|
| Pin del mapa "Florería Floritel" | **Es el nombre registral del local en Google.** Acción operacional (Google Business Profile), no es bug de código. |
| Prioridad | **Accesibilidad/contraste primero.** |
| Scope acordado | **Los 4 P1 primero**, luego reevaluar P2s. |
| Quotes de clientas | **Sí puede conseguirlas** (WhatsApp/IG) → habilita el upgrade de Testimonios (P2). |

---

## Backlog P1 (scope acordado)

### P1-1 · Dorado `#e8b84b` como texto falla WCAG AA — `/i-impeccable polish`

- **Evidencia**: 1.80:1 sobre crema/claros (necesita 4.5:1); 4.37:1 sobre verde footer (falla 4.5:1 texto normal). Confirmado por A, B y verificación matemática.
- **Dónde falla**:
  - Kicker hero "FLORERÍA PREMIUM EN LIMA, PERÚ" (`HeroSection/HeroContent.tsx`) — ilegible sobre el slide de peonías claras en 390px.
  - Precios "Desde S/ 30" (`CatalogSection/CategoryTile.tsx`) — sobre foto variable; el scrim oscuro del tile suele rescatarlo, verificar por foto.
  - Link "Ver ubicacion y mapa" (`Footer.tsx:102`) — dorado sobre verde `#2d5a1b`.
- **Fix acordado**: crear token `--color-gold-text` en `globals.css` (dorado oscurecido que cumpla ≥4.5:1 sobre crema; candidato: bajar luminancia hasta ~#8a6a1f–#9a7625, validar) y usarlo para TODO texto dorado sobre fondos claros/variables. El `#e8b84b` vivo queda para fills, íconos y texto sobre scrims oscuros verificados. Alternativa para el kicker: pasarlo a crema (como el H1) + reservar dorado para acentos.
- **Criterio de aceptación**: ningún texto de la landing por debajo de 4.5:1 (normal) / 3:1 (large) medido sobre su fondo real; re-correr detect.js → cero `low-contrast` reales.

### P1-2 · Footer sin tildes — `/i-impeccable clarify`

- **Dónde**: `src/components/shared/Footer.tsx`
  - L23: `ocasion` → `ocasión`
  - L70-72: `Navegacion` → `Navegación`
  - L94: `Atencion` → `Atención`
  - L102: `ubicacion` → `ubicación`
- **Por qué P1**: principio de marca "español peruano correcto"; peak-end rule — es lo último que lee la clienta.
- **Bonus en el mismo PR**: quitar la "o" separadora huérfana de `ContactSection.tsx:110-117` (entre Instagram y horarios; implica una alternativa que no existe — parece glitch).
- **Criterio de aceptación**: `rg "ocasion|Navegacion|Atencion|ubicacion" src/` sin matches; sin "o" suelta en contacto.

### P1-3 · Catálogo degrada con pocas categorías — `/i-impeccable harden`

- **Evidencia**: `getLayout(1)` (`CatalogSection/gridLayout.ts`) estira un tile único a banner full-width con banda vacía debajo (desktop); en móvil el snap-carousel de 1 tile invita un swipe muerto. Estado alcanzable desde el admin (y el estado real en dev: la DB local devuelve 1 categoría vs 6 en prod).
- **Lo que NO se toca**: el bento de 4-6 tiles (hero 2×2 + wide) es genuinamente bueno.
- **Fix acordado**: para counts ≤ 2, fallback centrado con max-width contenido (no full-bleed), sin carrusel en móvil si no hay overflow real.
- **Criterio de aceptación**: con 1, 2, 3 y 6 categorías el layout se ve intencional (probar mockeando `getCategories`); sin swipe muerto.

### P1-4 · Pin del mapa "Florería Floritel" — OPERACIONAL (sin código)

- La dueña debe actualizar el nombre en **Google Business Profile** (el local figura registrado como "Florería Floritel"). Mientras tanto, cualquier clienta que valide el mapa ve otro nombre de negocio.
- Si el rebrand del listing demora, evaluar: caption junto al mapa tipo "(antes Florería Floritel)" para puentear la confianza — decisión de la dueña.

---

## Backlog P2 (siguiente tanda, reevaluar al cerrar P1)

| # | Issue | Dónde | Fix | Comando |
|---|-------|-------|-----|---------|
| P2-1 | Blanco sobre verde WhatsApp `#25d366` = 2.0:1 (solo lo vio el detector) | Cards de contacto (`ContactSection.tsx:68-107`), botón footer | Token `--color-whatsapp-deep` (~`#075e54`, 7.7:1 con blanco) para superficies con texto; `#25d366` queda para el FAB icon-only (ojo: WCAG 1.4.11 también pide 3:1 en íconos) | `polish` |
| P2-2 | 3 labels para una acción ("Hacer pedido" / "Pedir por WhatsApp" / "Escribir por WhatsApp") + action cards bespoke fuera del DS | Navbar, hero, contact, footer, FAB | UN verbo de marca repetido verbatim; decidir si las cards de contacto se vuelven variante sancionada de `Button` | `clarify` |
| P2-3 | Eyebrow uppercase en 5 secciones = "AI grammar" | `SectionHeader.tsx:24` + hero kicker | Variar cadencia: secciones sin kicker o kicker integrado; máx 1-2 deliberados | `typeset` |
| P2-4 | "Testimonios" sin testimonios | `TestimonialsSection.tsx` | 2-3 quotes reales con nombre + ocasión sobre las polaroids (dueña confirmó que las consigue). Formato sugerido: "Para el cumple de mi mamá — Andrea, San Isidro" | `delight` |
| P2-5 | Stats del About rozan hero-metric template; "100% Dedicación y amor" es métrica de vanidad | `AboutSection.tsx:18` | Tercera stat real (ej. barrios con entrega, tiempo de entrega) o quitar la card | `delight` |

## Menores (oportunistas, en cualquier PR que toque el archivo)

- Párrafos del About pegados — sin gap entre `<p>` siblings dentro del `<header>` (`AboutSection.tsx:38-48`).
- Radii arbitrarios fuera de escala: `rounded-[1.5rem]` y `rounded-[2rem]` (`AboutSection.tsx:56,73`), `borderRadius: "12px"` inline en iframe (`ContactSection.tsx:48`).
- **Sin OG image** — shares de IG/WhatsApp salen sin preview; para un negocio que vive de IG es pérdida real. (`layout.tsx` define openGraph sin imagen; hay `opengraph-image.tsx` file-based — verificar que renderice.)
- `WhatsAppFloat.tsx:52`: focus ring hereda `--ring` rojo sobre botón verde.
- `TestimonialsSection.tsx:66`: `max-w-4xl` vs `max-w-7xl` del resto (muesca en viewports anchos).
- Iframe del mapa captura el scroll táctil en móvil (gesture trap) — considerar `pointer-events` hasta tap.
- `about-florist-table.jpg` es imagen generada donde la tesis de marca es foto real — reemplazar con foto real del local/dueña cuando exista.
- Logo navbar `text-[1.5rem]` fuera de escala tipográfica.
- `next-themes` instalado sin uso en landing; `COPYRIGHT_YEAR = 2026` hardcodeado (`Footer.tsx:11`).

## Falsos positivos del detector (NO arreglar)

- `low-contrast 1.0:1` en H1/copy del hero y heading del catálogo: el detector muestrea el bg CSS (`#fdfcfa`), no el scrim oscuro sobre la foto. El contraste real es alto.
- `text-overflow` del skip link: `sr-only` clippea a propósito.
- `clipped-overflow-container` ×7 en polaroids + hero/catalog: `overflow-hidden` intencional para radius + zoom de imagen; no hay dropdowns que clippear.
- `transition: height` en body: inyectado por tooling de dev, no es código de la app.
- `overused-font` (Lato 85%): es la fuente body por diseño.

## Fortalezas a PRESERVAR (no romper al implementar)

1. Sistema de imágenes auténtico (hero real, polaroids de clientas con rotación -3°/+3°, mesa de florista).
2. Ingeniería del hero: H1 server-rendered (LCP/SEO), `pointer-events-none` con CTAs re-habilitados, variants reduced-motion, `--hero-focus` por slide, dots fuera del FAB.
3. Mobile-first real: CTAs en thumb zone, drawer con "Hacer pedido" sticky, trust bar 2×2.

## Al terminar

Re-correr `/i-impeccable critique src/app/(public)/page.tsx` para medir el delta contra el baseline **28/40** (trend automático en `.impeccable/critique/`).
