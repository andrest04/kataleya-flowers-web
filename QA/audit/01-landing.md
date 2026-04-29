# Auditoría: Landing `/`

**Ruta:** `src/app/(public)/page.tsx`
**URL analizada (PSI):** `https://kataleya-flawers.vercel.app/`
**Fecha:** 2026-04-29
**Archivos analizados (slice):** 11
**Stack:** Next.js 16 · React 19 · TS strict · Tailwind v4 · Framer Motion 12 · Supabase · Cloudinary

> Alcance: este reporte cubre el **slice de la Landing**: root layout, route group `(public)/layout.tsx`, `page.tsx` de la home, secciones de `src/features/landing/components/` y `src/app/globals.css`.
> **Fuera de alcance (cubierto por el agente de globales):** `Navbar`, `Footer`, `WhatsAppFloat`, `BusinessHoursBadge`, `Toaster`, `Button`, `SectionHeader`, `WhatsAppContactLink`, `clientTrack`, `getCategories`. Cuando un hallazgo apunta a uno de estos archivos, se referencia pero no se evalúa internamente.

---

## PageSpeed Insights (4 ejes)

| Eje | Puntaje | Fuente |
|-----|---------|--------|
| Rendimiento | ~70 | **estimado** (manual sobre código + WebFetch) |
| Accesibilidad | ~85 | **estimado** (manual) |
| Buenas prácticas | ~80 | **estimado** (manual) |
| SEO | ~75 | **estimado** (manual) |

> **No se pudo correr Lighthouse / PSI API** desde este entorno (sin acceso a `pagespeed.web.dev/runPagespeed`). Los puntajes son estimados a partir de revisión de código + `WebFetch` parcial del HTML servido. **Acción para el usuario:** correr `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fkataleya-flawers.vercel.app%2F&form_factor=mobile` (mobile y desktop) y pegar resultados aquí.

> **Core Web Vitals (field):** `@vercel/analytics` y `@vercel/speed-insights/next` están integrados en `src/app/layout.tsx` (líneas 80-81). Revisar dashboard en Vercel → Speed Insights del proyecto para LCP/INP/CLS reales sobre `/`.

### Críticos 🔴 (PSI / Lighthouse)

- **`<html lang>` y `<head>` no verificables vía WebFetch** — el WebFetch resume HTML por modelo y no expone literal `<head>`. **Acción:** confirmar con `curl -s https://kataleya-flawers.vercel.app/ | head -200` que aparezcan: `lang="es"` (definido en `layout.tsx:42`), `<title>`, `meta description`, og tags y JSON-LD `Florist`. El código indica que están todos, pero hay que validar el render real.
- **No existe `sitemap.ts`** — verificado: `Glob src/app/sitemap.*` → 0 resultados. Bloquea descubrimiento por crawlers. **Acción:** crear `src/app/sitemap.ts` con la home + `/catalogo` + categorías dinámicas.
- **No existe `robots.ts`** — verificado: `Glob src/app/robots.*` → 0 resultados. **Acción:** crear `src/app/robots.ts` con `userAgent: '*', allow: '/', sitemap: <url>/sitemap.xml`.

### Mejoras 🟡 (PSI / Lighthouse)

- **`uses-rel-preconnect` (fuentes Google)** — `globals.css:1` importa Google Fonts vía `@import url("https://fonts.googleapis.com/...")`. Esto bloquea render y no usa preconnect. **Acción:** migrar a `next/font/google` con `Playfair_Display` y `Lato`, asignar a `--font-heading` / `--font-body` desde el layout (elimina round-trip a `fonts.googleapis.com` y mejora LCP).
- **`unused-css-rules` (shadcn import)** — `globals.css:4` importa `shadcn/tailwind.css` global. **Acción:** confirmar que se usa shadcn en la landing; si no, removerlo de la landing o purgarlo.
- **`unsized-images` / CLS riesgo en hero** — `HeroSection.tsx` usa `<Image fill priority>` dentro de un contenedor con `h-64 sm:h-80 lg:h-[440px]` (línea 206). El contenedor tiene altura fija, pero el slide arranca **vacío** mostrando `"Cargando imagen..."` mientras `imageExists` es `undefined` (líneas 152-162). **Acción:** mostrar la imagen directamente con `next/image` (que ya maneja loading) en vez del check manual con `new window.Image()` — el patrón actual fuerza un round-trip extra y puede impactar LCP.
- **Cloudinary sin loader optimizado** — `next.config.ts` permite Cloudinary, pero no usa `loader: 'cloudinary'` ni transformaciones (`f_auto,q_auto`). Las imágenes de Testimonials se sirven en `.jpg` originales, optimizadas por Next image (vía `_next/image`), no por Cloudinary. **Acción:** considerar `next-cloudinary` o agregar `f_auto,q_auto,w_400` en URLs.
- **`render-blocking-resources` font import** — el `@import url(...)` en CSS bloquea render hasta resolverse. Mismo punto que preconnect.

### Recomendaciones 🟢 (PSI / Lighthouse)

- **`structured-data`** — `layout.tsx:44-77` define un JSON-LD `Florist`. Validar con [validator.schema.org](https://validator.schema.org/) y considerar añadir `priceRange`, `image`, `geo` (lat/lng de Lima) y `aggregateRating` si hay reseñas reales.
- **`meta-description`** — `layout.tsx:11` tiene una descripción genérica. Bien que use `BUSINESS.experience` dinámicamente. Considerar variantes localizadas (Lima Norte, Surco, etc.) si segmentás campañas.
- **`og:image` ausente** — `layout.tsx:22-28` define `openGraph` pero **no incluye `images`**. Esto rompe los previews al compartir por WhatsApp / Facebook / Twitter. **Acción:** agregar `images: [{ url: '/og-image.jpg', width: 1200, height: 630 }]` al openGraph y crear el asset.
- **`twitter:card` summary** — `layout.tsx:30` usa `summary`. Sin imagen grande, el preview es un thumbnail chico. Cambiar a `summary_large_image` cuando exista og:image.
- **Vercel Analytics y Speed Insights** — confirmados en `layout.tsx:80-81`. Recomendar al usuario chequear el dashboard regularmente.

---

## Puntaje (código)

| Aspecto | Puntaje |
|---------|---------|
| Responsabilidad única | 75/100 |
| Longitud de archivo | 78/100 |
| Seguridad | 90/100 |
| SEO | 65/100 |
| UI / UX | 85/100 |
| Reutilización | 88/100 |
| Separación de capas | 80/100 |
| Tipado | 92/100 |
| Mantenibilidad | 78/100 |
| Escalabilidad | 80/100 |
| **Promedio general** | **81/100** |

---

## Archivos analizados

Lista (líneas) — solo > 100 listadas como hallazgo automático mínimo 🟡:

| Archivo | Líneas |
|---------|--------|
| `src/features/landing/components/HeroSection.tsx` | **345** 🟡 |
| `src/app/globals.css` | 135 🟡 |
| `src/features/landing/components/ContactSection.tsx` | 137 🟡 |
| `src/features/landing/components/CatalogSection.tsx` | 122 🟡 |
| `src/features/landing/components/TrustBar.tsx` | 116 🟡 |
| `src/features/landing/components/TestimonialsSection.tsx` | 86 ✓ |
| `src/app/layout.tsx` | 85 ✓ |
| `src/features/landing/components/AboutSection.tsx` | 80 ✓ |
| `src/features/landing/components/HeroButtons.tsx` | 76 ✓ |
| `src/app/(public)/page.tsx` | 20 ✓ |
| `src/app/(public)/layout.tsx` | 19 ✓ |

---

## Hallazgos críticos 🔴

### `src/features/landing/components/AboutSection.tsx`
- **Problema:** Imagen `/about-placeholder.svg` con `width={600} height={400}` y `className="h-auto w-full"`. Es un asset placeholder con nombre auto-explicativo en producción real — **negocio en activo no debería mostrar un placeholder**.
- **Línea(s):** 69-75
- **Solución:** reemplazar por una foto real de la florería / del equipo en Cloudinary (consistente con el resto del sitio). Mantener `next/image` con `width`/`height` correctos del asset real para evitar CLS, y agregar `sizes` (la imagen es responsive de ancho 50vw en lg).

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** **Archivo de 345 líneas** mezcla múltiples responsabilidades en un mismo módulo: hook `usePrefersReducedMotion`, dos íconos SVG inline (`ChevronLeftIcon`, `ChevronRightIcon`), constantes `slides` + `slideVariants`, configuración `CAMPAIGN_MODE`, lógica de touch/swipe, autoplay, lógica de "image-exists check" manual y el JSX. Viola SRP.
- **Línea(s):** 1-345
- **Solución:** extraer en módulos:
  - `src/features/landing/components/Hero/useHeroCarousel.ts` (paginate, goToSlide, autoplay, touch handlers, prefers-reduced-motion)
  - `src/features/landing/components/Hero/HeroSlide.tsx` (renderiza un slide)
  - `src/features/landing/components/Hero/constants.ts` (`slides`, `slideVariants`, `CAMPAIGN_MODE`, `AUTOPLAY_INTERVAL`)
  - `src/components/ui/icons/Chevron.tsx` (íconos reutilizables — ya hay `lucide-react` instalado, ver `CatalogSection.tsx:3` que usa `Flower2`; usar `ChevronLeft`/`ChevronRight` de lucide en lugar de inlinear SVG).
  - `HeroSection.tsx` queda como composición de < 100 líneas.

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** **`'use client'` en una landing es justificado por el carousel**, pero el componente fuerza el render del cliente para todo el bloque hero (texto, h1, párrafo, badges). El texto es estático y debería ser server-rendered para SEO/LCP. Hoy todo el hero es client-bundle.
- **Línea(s):** 1, 178-202
- **Solución:** dejar el hero como Server Component con texto/h1, y embeber el `<HeroCarousel>` como child client component. Esto reduce JS hidratado y mejora LCP del texto principal.

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** Lógica de **detección manual de imágenes** con `new window.Image()` (líneas 153-162). Esto:
  1. Hace requests duplicados (uno para el check, otro para el `<Image>` real),
  2. El primer render siempre muestra "Cargando imagen..." — degrada LCP visible,
  3. Las imágenes ya existen en `/public/images/hero/*.webp` (verificado), no es necesario el check.
- **Línea(s):** 105, 152-162, 165, 243-263
- **Solución:** eliminar `imageExists` y el `useEffect`. Renderizar siempre `<Image src={currentSlide.image} fill priority sizes="..." alt={...} />`. Si una imagen falla a futuro, usar `onError` del `next/image` para fallback.

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** Statement `import Image from "next/image"` aparece **mezclado en medio de funciones** (línea 23), después del hook `usePrefersReducedMotion`. Imports deben ir al tope.
- **Línea(s):** 23
- **Solución:** mover al bloque de imports al inicio (líneas 1-5).

---

## Hallazgos importantes 🟡

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** `addEventListener("change", (e) => setPrefersReduced(e.matches))` con función inline — el `removeEventListener` recibe **otra referencia** y no remueve el listener real. Memory leak en navegación SPA.
- **Línea(s):** 14, 17
- **Solución:**
  ```ts
  const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
  ```

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** `paginate` depende de `page` en su closure, pero el `useEffect` del autoplay reinstala el `setInterval` cada vez que `page` cambia (`paginate` en deps). Cada slide reinicia el timer.
- **Línea(s):** 110-115, 144-150
- **Solución:** usar `setPage((prev) => [prev[0] + 1, 1])` dentro del autoplay y quitar `paginate` de deps; o usar la versión functional.

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** `aria-live="polite"` en un carousel **con autoplay de 4s** anuncia constantemente al lector de pantalla cada cambio. Es una mala práctica de a11y.
- **Línea(s):** 228, 144-150
- **Solución:** usar `aria-live="off"` cuando el carousel auto-rota, y solo activar `polite` cuando el usuario interactúa con flechas/dots. O directamente pausar el autoplay al detectar foco/hover.

### `src/features/landing/components/HeroSection.tsx`
- **Problema:** `transition={{ type: "spring" as const, ... }}` — el `as const` es un workaround. Definir el tipo correcto evitaría el cast.
- **Línea(s):** 176
- **Solución:** importar `Transition` de `framer-motion` y tipar la constante explícitamente.

### `src/app/globals.css`
- **Problema:** Google Fonts importado vía `@import url(...)` (línea 1) en lugar de `next/font`. Bloquea render y pierde optimización automática de Next (subset, preload, fontDisplay swap).
- **Línea(s):** 1
- **Solución:** en `src/app/layout.tsx` usar `next/font/google`:
  ```ts
  import { Playfair_Display, Lato } from "next/font/google";
  const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
  const lato = Lato({ subsets: ["latin"], weight: ["400","700"], variable: "--font-body" });
  ```
  y aplicar `className={\`${playfair.variable} ${lato.variable}\`}` al `<html>`. Eliminar el `@import` del CSS.

### `src/app/globals.css`
- **Problema:** Variables `--color-flower-*` (rojo, rosa, amarillo, blanco, etc.) y `--color-status-*` definidas en `:root` (líneas 22-30) no se usan en la **landing**. Son colores de catálogo/admin que viven en CSS global y se descargan en cada ruta.
- **Línea(s):** 22-30
- **Solución:** mover esas variables a un CSS específico de catálogo/admin, o mantenerlas con un comentario explicando dónde se usan. (Bajo impacto, pero higiene de código.)

### `src/features/landing/components/ContactSection.tsx`
- **Problema:** **Archivo de 137 líneas** mezcla SVG inline `ArrowRightIcon`, lógica del mapa, dos botones (WhatsApp/Instagram), y card de horario. Tiene `lucide-react` disponible y puede usar `ArrowRight` directamente.
- **Línea(s):** 9-23, 1-137
- **Solución:** reemplazar `ArrowRightIcon` por `import { ArrowRight } from "lucide-react"`. Considerar extraer el botón social como `<SocialContactCard icon, label, sub, href, color>` reutilizable (Instagram + WhatsApp comparten estructura).

### `src/features/landing/components/ContactSection.tsx`
- **Problema:** El `<iframe>` del mapa **no tiene height responsive** (`height="220"` fijo) y carga 220px en mobile, igual que en desktop. En mobile es chico, en desktop podría ser más grande.
- **Línea(s):** 41-50
- **Solución:** usar wrapper con aspect ratio, o `height` responsive con CSS.

### `src/features/landing/components/CatalogSection.tsx`
- **Problema:** **Archivo de 122 líneas**. JSX repite estilos inline `style={{...}}` con `color-mix` para cada categoría. Más legible si se extrae a una clase CSS o a un sub-componente `<CategoryCard>`.
- **Línea(s):** 32-87
- **Solución:** extraer `<CategoryCard category={category}>` a su propio archivo en `src/features/landing/components/CatalogSection/CategoryCard.tsx`.

### `src/features/landing/components/CatalogSection.tsx`
- **Problema:** Botón "Ver catálogo completo" tiene SVG inline (líneas 103-117). Mismo problema que ContactSection — usar `ArrowRight` de lucide.
- **Línea(s):** 103-117
- **Solución:** `<ArrowRight className="h-5 w-5" />` desde lucide.

### `src/features/landing/components/CatalogSection.tsx`
- **Problema:** `priceFrom.toFixed(2)` (línea 79) puede dar problemas si `priceFrom` es string desde Supabase, o si la moneda cambia. El formato no respeta locale.
- **Línea(s):** 79
- **Solución:** usar un helper `formatPriceFrom(price: number)` con `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`. Definirlo en `src/lib/format.ts`.

### `src/features/landing/components/TrustBar.tsx`
- **Problema:** **Archivo de 116 líneas** con `'use client'`. La animación de números (count up) es bonita pero todo el componente se hidrata. Si `usePrefersReducedMotion` está activo, el counter podría no animar y entonces no hay justificación para client.
- **Línea(s):** 1-116
- **Solución:** considerar versión SSR-first que renderiza el valor final y solo hidrata el counter si `prefers-reduced-motion: no-preference`. O al menos respetar `prefers-reduced-motion` saltando la animación.

### `src/features/landing/components/TrustBar.tsx`
- **Problema:** `parseInt(BUSINESS.experience, 10)` (línea 14) — `BUSINESS.experience` es string `"32"`. Si alguien lo cambia a `"32+"` o `"+30"`, esto rompe silenciosamente.
- **Línea(s):** 14
- **Solución:** mejor tipar `experience` como `number` en `BUSINESS` y formatear en presentación. O agregar fallback `Number.isNaN(parsed) ? 0 : parsed`.

### `src/features/landing/components/TestimonialsSection.tsx`
- **Problema:** Las URLs de Cloudinary están **hardcoded** en el componente (líneas 8-46). Si el negocio sube fotos nuevas o las cambia, requiere editar código.
- **Línea(s):** 5-48
- **Solución:** mover el array `photos` a Supabase como tabla `testimonials` (mismo patrón que `categories`). O al menos a `src/data/testimonials.ts` con tipo definido. Permitiría administrarlas desde admin a futuro.

### `src/features/landing/components/TestimonialsSection.tsx`
- **Problema:** `transform: rotate(...)` aplicado vía `style` inline a cada foto. En mobile, las fotos rotadas pueden generar **CLS** si la imagen aún no cargó (la rotación cambia bounding box).
- **Línea(s):** 70-71
- **Solución:** verificar con DevTools → Performance → Layout Shift sobre la sección. Si hay CLS, reservar el espacio con `aspect-ratio` y aplicar la rotación solo al contenido interno.

### `src/features/landing/components/HeroButtons.tsx`
- **Problema:** `'use client'` justificado por `onClick` y `clientTrackEvent`, pero el componente recibe `campaignMode` como prop con `CAMPAIGN_MODE` definido en server (HeroSection es client igual, pasa). El botón "Explorar Catálogo" llama a `handleScroll` solo en la rama `catalog` — pero en la rama `contact` es un link a `/catalogo`, no a un anchor. Ok, está bien — pero `handleScroll` no se usa en la rama actual (`CAMPAIGN_MODE === "contact"`). Código muerto si la flag no cambia.
- **Línea(s):** 16-31, 67
- **Solución:** dejar el `handleScroll` solo si se usa, o comentar que es para el modo `catalog` y mantener la rama por flexibilidad.

### `src/app/layout.tsx`
- **Problema:** El `<script type="application/ld+json">` está dentro de `<body>` (línea 44-77). Funciona, pero **debería estar en `<head>` para que crawlers lo encuentren temprano**. Next.js permite inyectarlo vía `metadata.alternates` u `other` o usando un `<Script>` con `strategy="beforeInteractive"`.
- **Línea(s):** 44-77
- **Solución:** mover a la Metadata API o usar el patrón:
  ```ts
  export default function RootLayout(...) {
    return (
      <html lang="es">
        <head>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </head>
        ...
  ```

### `src/app/layout.tsx`
- **Problema:** El JSON-LD tiene `telephone: \`+${BUSINESS.phone}\`` (línea 53). `BUSINESS.phone = "51990051041"`. El resultado es `+51990051041` — falta el espacio o formato E.164 estándar. Es válido, pero menos claro para Google.
- **Línea(s):** 53
- **Solución:** considerar formato `+51 990 051 041` o consistente con el resto del sitio. Validar con Rich Results Test de Google.

### `src/app/layout.tsx`
- **Problema:** No declara `metadataBase`. Next 16 lo necesita para resolver URLs absolutas de OG/Twitter cuando se usan paths relativos. Sin esto, og:url puede salir relativo y romper preview.
- **Línea(s):** 13-34
- **Solución:** agregar `metadataBase: new URL(BUSINESS.website)` al objeto `metadata`.

### `src/app/layout.tsx`
- **Problema:** Falta `viewport` en metadata. En Next 16 se exporta separado:
  ```ts
  export const viewport: Viewport = { themeColor: '...', width: 'device-width' }
  ```
- **Línea(s):** 13-34
- **Solución:** agregar export `viewport` con `themeColor: '#c0392b'` (color primary) para barra de status del browser.

### `src/app/(public)/page.tsx`
- **Problema:** Llama a `getCategories()` server-side (línea 9) — pero **todas las secciones tras `HeroSection` están debajo del fold**. La query bloquea el render del hero, retrasando TTFB y por ende LCP del hero.
- **Línea(s):** 8-19
- **Solución:** envolver `<CatalogSection />` en `<Suspense>` con un fallback ligero, mover `await getCategories()` dentro de `<CatalogSection>` server component (data fetching colocated). El hero se renderiza inmediato y el catálogo streamea.
  ```tsx
  <main>
    <HeroSection />
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogSection />  {/* fetchea adentro */}
    </Suspense>
    ...
  </main>
  ```

---

## Mejoras propuestas 🟢

### `src/features/landing/components/HeroSection.tsx`
- **Propuesta:** mover `CAMPAIGN_MODE` a una variable de entorno o feature flag (`process.env.NEXT_PUBLIC_CAMPAIGN_MODE`) para poder cambiar la campaña sin redeploy de código.
- **Justificación:** hoy cambiar el CTA primario requiere edit + commit + deploy. Con env var es solo cambio en Vercel + redeploy de la rama.

### `src/features/landing/components/HeroSection.tsx`
- **Propuesta:** las animaciones del overlay de texto (`m.p` con `delay: 0.2`, `delay: 0.3`) re-animan en cada slide change. Considerar marcarlas como entrada solo en mount, no en cambio de página.
- **Justificación:** menos jitter visual, sensación más estable en autoplay.

### `src/features/landing/components/HeroSection.tsx`
- **Propuesta:** tres slides con `priority` — solo el primero debería tener `priority`. Como `<Image>` se monta dinámicamente con `key={page}`, técnicamente solo uno está en DOM, pero el `priority` es por slide actual. Funciona, pero documentar.
- **Justificación:** claridad para futuros mantenedores.

### `src/features/landing/components/CatalogSection.tsx`
- **Propuesta:** las primeras 4 categorías cargan con imagen Cloudinary. Considerar `priority` solo en la primera (las que están above-the-fold en mobile son 1, en desktop 4).
- **Justificación:** mejor ranking de imágenes prioritarias para LCP secundario.

### `src/features/landing/components/AboutSection.tsx`
- **Propuesta:** los 3 highlights (`years`, `monthly orders`, `100% dedicación`) son estáticos en code. Considerar consolidarlos con TrustBar — ambos comunican lo mismo.
- **Justificación:** evita duplicación visual y mantiene consistencia narrativa.

### `src/features/landing/components/ContactSection.tsx`
- **Propuesta:** el iframe de Google Maps **no tiene `sandbox`**. Considerar `sandbox="allow-scripts allow-same-origin allow-popups"` para reducir superficie de ataque.
- **Justificación:** Best practice security; reduce score de "Best Practices" en Lighthouse.

### `src/app/(public)/page.tsx`
- **Propuesta:** orden actual: Hero → Catalog → Testimonials → About → Contact. Esto es razonable. Considerar A/B test con Testimonials antes de Catalog (prueba social temprana puede mejorar conversión).
- **Justificación:** experimento de UX, no técnico.

### `src/app/layout.tsx`
- **Propuesta:** agregar `alternates: { canonical: BUSINESS.website }` al metadata.
- **Justificación:** indica a crawlers la URL canónica, evita duplicate content si llegan visits desde dominios alternativos (preview Vercel).

### `src/lib/constants.ts`
- **Propuesta:** `experience: "32"` está como string. Considerar `experience: 32` (number) y formatear en presentación. Hoy `TrustBar.tsx:14` hace `parseInt(BUSINESS.experience, 10)`.
- **Justificación:** elimina parseo defensivo y hace los datos más type-safe.

---

## Resumen accionable (priorizado)

**Top 5 acciones de mayor impacto en producción:**

1. 🔴 **Reemplazar `/about-placeholder.svg`** con foto real (negocio activo no debe mostrar placeholder).
2. 🔴 **Crear `sitemap.ts` y `robots.ts`** (`src/app/sitemap.ts`, `src/app/robots.ts`) — bloqueante para SEO.
3. 🔴 **Refactor `HeroSection.tsx`** — extraer hooks/constantes/iconos, eliminar el "image exists" check manual, mover el `import` mal posicionado, fix del listener leak.
4. 🟡 **Migrar Google Fonts a `next/font`** — elimina render-blocking, mejora LCP medible.
5. 🟡 **Agregar `og:image` y `metadataBase`** en `layout.tsx` — los previews de WhatsApp/Instagram al compartir el link hoy salen sin imagen.

**Validaciones que solo el usuario puede hacer:**

- Correr `https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fkataleya-flawers.vercel.app%2F` (mobile y desktop) y pegar resultados.
- Revisar dashboard de **Vercel Speed Insights** para LCP/INP/CLS field reales.
- Validar JSON-LD en [Google Rich Results Test](https://search.google.com/test/rich-results?url=https://kataleya-flawers.vercel.app/).
- `curl -s https://kataleya-flawers.vercel.app/ | rg "<head" -A 200` para confirmar que el `<head>` tiene `lang="es"`, `<title>`, `meta description`, OG tags y JSON-LD reales.
