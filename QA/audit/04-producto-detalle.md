# Auditoría: Producto detalle

**Ruta:** `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`
**URL analizada (PSI):** `https://kataleya-flawers.vercel.app/catalogo/flores-amarillas/ramo-de-girasoles`
**Fecha:** 2026-04-29
**Archivos analizados:** 11
**Stack:** Next.js 16 · React 19 · TS strict · Tailwind v4 · Framer Motion (LazyMotion) · Supabase · Cloudinary

---

## PageSpeed Insights (4 ejes)

Puntajes **0-100** estimados a partir de inspección del HTML servido en producción y revisión de código (no se ejecutó Lighthouse CLI ni la API de PSI por restricción de la sesión: solo lectura). Marcar como **estimado**.

| Eje | Puntaje | Fuente |
|-----|---------|--------|
| Rendimiento | 78 | estimado (HTML servido + código) |
| Accesibilidad | 70 | estimado (revisión a11y código + HTML) |
| Buenas prácticas | 85 | estimado (revisión código + headers HTML) |
| SEO | 62 | estimado (HTML servido — falta Product schema, OG genérico, title duplicado) |

**Core Web Vitals (field, Vercel Speed Insights):** no disponible en esta sesión (requiere acceso al dashboard de Vercel). Recomendación: cruzar con el dashboard de Speed Insights ya integrado.

### Críticos 🔴 (PSI / Lighthouse)

- **`document-title` / título duplicado** — El HTML servido muestra `<title>Ramo de Girasoles | Flores Amarillas | Kataleya Flawers | Kataleya Flawers</title>`. `generateMetadata` retorna `${product.name} | ${category.name} | ${BUSINESS.name}` y el root layout aplica `template: '%s | ${BUSINESS.name}'` encima, lo que duplica el sufijo. **Acción:** en `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx` líneas 59, 70, 76 retornar `title` sin `| ${BUSINESS.name}` (el template del root layout lo agrega) o pasar `title: { absolute: '...' }` cuando se quiera control total.
- **`structured-data` (Product) ausente** — La página de producto no expone JSON-LD `Product` (precio, marca, imagen, availability). Solo existe el `Florist` global heredado del root layout. Para una página de producto es esperable Lighthouse lo marque y Google no la muestre como rich result. **Acción:** agregar `<script type="application/ld+json">` en `[slug]/page.tsx` con `@type: "Product"` (name, image, description, brand=BUSINESS.name, offers con price/priceCurrency=PEN/availability/url) y `@type: "BreadcrumbList"`.
- **Open Graph y Twitter Card sin datos del producto** — En el HTML servido `og:title`, `og:description`, `og:image`, `twitter:title` siguen siendo los del root layout (`Kataleya Flawers — Floristería en Lima, Perú`). Compartir un producto en WhatsApp/Facebook no muestra ni el nombre ni la imagen del producto. **Acción:** en `generateMetadata` agregar `openGraph: { title, description, type: 'website' (no hay 'product' en next 16, dejar website), images: [{ url: product.imageUrl, width, height, alt }] }` y `twitter: { card: 'summary_large_image', title, description, images: [product.imageUrl] }`.

### Mejoras 🟡 (PSI / Lighthouse)

- **`canonical-link`** — No se sirve `<link rel="canonical">`. Al haber productos accesibles por slug podría perderse señal canónica si llega tráfico a variantes (querystrings). **Acción:** declarar `alternates: { canonical: \`/catalogo/${categoria}/${slug}\` }` en `generateMetadata`.
- **`meta-description` genérica para 404 fallback** — En `generateMetadata` el fallback usa "El producto solicitado no esta disponible…" sin tilde ("está"). **Acción:** corregir tilde en línea 60 de `[slug]/page.tsx`.
- **`aria-modal` sin `aria-labelledby` real** — El lightbox usa `aria-label` con string compuesto, pero no hay `aria-labelledby` apuntando al H1 del modal (no existe título visible). Para una imagen de producto es aceptable, pero Lighthouse puede marcar `dialog-name` si queda solo `aria-label` y la imagen carece de alt visible — está OK porque el `<Image>` interno tiene `alt={name}`.
- **`unsized-images`** — La imagen principal del lightbox usa `fill` con `object-contain` y un contenedor de altura `max-h-[85vh]`, lo que está OK, pero el contenedor no tiene proporción intrínseca. En conexiones lentas puede provocar pequeño CLS al abrir el lightbox. **Acción:** considerar `width`/`height` reales (Cloudinary los expone) o reservar `aspect-ratio` en el contenedor del modal.
- **`lcp-lazy-loaded` / verificación LCP** — La imagen principal usa `priority` correctamente (línea 45 de `ProductGallery.tsx`), pero al ser **client component** debe hidratarse antes de pintarse. La imagen se renderiza en el primer paint del HTML (Next 16 incluye los `<img>` del componente client en el HTML inicial), validar en field data que LCP < 2.5s.
- **`uses-rel-preconnect`** — No se preconecta a `res.cloudinary.com`. **Acción:** agregar `<link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />` en root layout para mejorar LCP de la imagen del hero/producto.

### Recomendaciones 🟢 (PSI / Lighthouse)

- **`hreflang`** — sitio en español único (es_PE). No es bloqueante; si en el futuro se agrega EN, declarar `alternates.languages`.
- **`robots`/`sitemap`** — no se inspeccionó `sitemap.ts` en este slice; recomendar verificar que `/catalogo/[categoria]/[slug]` esté incluido para el producto de mayor tráfico.
- **`offscreen-images`** — los thumbnails podrían usar `loading="lazy"` (next/image lo aplica por defecto cuando no hay `priority`); ya está OK.
- **Open Graph image** — usar la imagen del producto a 1200x630 (Cloudinary admite transformación `c_fill,w_1200,h_630`) para que se vea bien al compartir. **Acción:** transformar `product.imageUrl` antes de pasarlo a `openGraph.images`.

---

## Puntaje (código)

| Aspecto | Puntaje |
|---------|---------|
| Responsabilidad única | 75/100 |
| Longitud de archivo | 70/100 |
| Seguridad | 90/100 |
| SEO | 55/100 |
| UI / UX | 72/100 |
| Reutilización | 85/100 |
| Separación de capas | 90/100 |
| Tipado | 92/100 |
| Mantenibilidad | 80/100 |
| Escalabilidad | 88/100 |
| **Promedio general** | **79.7/100** |

---

## Archivos analizados

Archivos del slice y su árbol de dependencias inmediatas:

- `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx` — **202 líneas** ⚠️ supera 100
- `src/features/catalog/components/ProductGallery.tsx` — **126 líneas** ⚠️ supera 100
- `src/features/catalog/components/BackButton.tsx` — 31 líneas
- `src/features/catalog/queries/getProductBySlug.ts` — 24 líneas
- `src/features/catalog/queries/getProducts.ts` — 21 líneas
- `src/features/catalog/queries/getCategories.ts` — 50 líneas
- `src/features/catalog/queries/mappers.ts` — 25 líneas
- `src/features/catalog/types/index.ts` — 38 líneas
- `src/features/analytics/components/TrackProductView.tsx` — 27 líneas
- `src/features/analytics/components/WhatsAppProductButton.tsx` — 36 líneas
- `src/components/ui/Breadcrumb.tsx` — 42 líneas
- `src/lib/constants.ts` — 28 líneas (referenciado vía `BUSINESS`)
- `src/app/layout.tsx` — 86 líneas (root layout — fuente del JSON-LD global y plantilla de title)

**Slice (4 archivos pedidos):** 390 líneas.

---

## Hallazgos críticos 🔴

### `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`

- **Problema:** El título sale duplicado (`... | Kataleya Flawers | Kataleya Flawers`). `generateMetadata` ya incluye `BUSINESS.name` en el título, pero el root layout aplica `template: '%s | Kataleya Flawers'` por encima. Es un bug visible en el HTML servido.
  - **Línea(s):** 59, 70, 76
  - **Solución:** retornar el título SIN sufijo de marca, o usar `title: { absolute: '...' }`. Ej: `title: \`${product.name} | ${category.name}\`` (el template del root agrega el `| Kataleya Flawers`).

- **Problema:** `generateMetadata` no expone `openGraph` ni `twitter` ni `alternates.canonical` específicos del producto. El HTML servido confirma que las cards sociales heredan los del root (genéricos del negocio), perdiendo conversión al compartir.
  - **Línea(s):** 46-85
  - **Solución:** agregar `openGraph: { title: product.name, description: product.description, images: [{ url: cloudinaryTransform(product.imageUrl, 'c_fill,w_1200,h_630'), width: 1200, height: 630, alt: product.name }] }`, `twitter: { card: 'summary_large_image', images: [...] }`, y `alternates: { canonical: \`/catalogo/${categoria}/${slug}\` }`.

- **Problema:** No hay JSON-LD `Product` ni `BreadcrumbList`. La página tiene precio, descripción, imagen y categoría — datos perfectos para rich results. El HTML servido solo muestra el `Florist` global del root.
  - **Línea(s):** 113-201 (componente `ProductoPage`)
  - **Solución:** insertar un `<script type="application/ld+json">` con `@type: "Product"` (name, image, description, brand: { @type: 'Brand', name: BUSINESS.name }, offers: { @type: 'Offer', price: product.price, priceCurrency: 'PEN', availability: 'https://schema.org/InStock', url }), y un segundo bloque `BreadcrumbList` reutilizando el array `items` del `<Breadcrumb>`. Ambos son seguros como `dangerouslySetInnerHTML` con `JSON.stringify` (mismo patrón que `app/layout.tsx`).

- **Problema:** Archivo de 202 líneas — supera el umbral de 100 y mezcla layout, metadata builder, generateStaticParams, fetching y JSX de detalle (incluye una tabla de variantes inline de ~30 líneas).
  - **Línea(s):** 142-181 (tabla de precios), 113-201 (todo el componente)
  - **Solución:** extraer `PriceVariantsTable` a `src/features/catalog/components/PriceVariantsTable.tsx`, y `ProductInfo` (la columna derecha) a `src/features/catalog/components/ProductInfo.tsx`. La página queda como composición. `generateMetadata` puede vivir en un módulo `metadata.ts` adyacente si crece.

### `src/features/catalog/components/ProductGallery.tsx` (Lightbox)

- **Problema:** **Sin focus trap.** Al abrir el lightbox no se mueve el foco al diálogo, y `Tab` puede salir del modal hacia el resto de la página (Navbar, links de catálogo). Lighthouse lo marca como `interactive-element-affordance` / WAI-ARIA.
  - **Línea(s):** 77-122
  - **Solución:** al abrir, mover foco al botón de cerrar (`useRef` + `.focus()`); al cerrar, restaurar foco al thumbnail / botón que lo abrió (guardar referencia en `useRef` antes del open). Implementar focus trap manual (escuchar Tab dentro del effect) o, mejor, montar el lightbox sobre Radix `Dialog` (ya está en el proyecto vía shadcn primitives) que entrega focus trap, escape, restore-focus y aria-modal cumpliendo WAI-ARIA Authoring Practices.

- **Problema:** **No restaura foco** al cerrar. Tras cerrar con Esc o click en backdrop, el foco vuelve al `body`, no al botón que abrió el modal. Es regresión de a11y para usuarios de teclado y lectores de pantalla.
  - **Línea(s):** 18-29 (useEffect)
  - **Solución:** ver punto anterior; también puede resolverse con `Dialog` de Radix.

- **Problema:** **Cierre con Esc/backdrop OK, pero falta navegación de teclado entre imágenes.** Hay galería con thumbnails pero el lightbox solo muestra `selected` sin flechas ←/→ ni swipe touch. UX por debajo del estándar de e-commerce.
  - **Línea(s):** 77-122
  - **Solución:** agregar listeners `ArrowLeft`/`ArrowRight` dentro del effect cuando `lightboxOpen`, y opcionalmente mostrar botones prev/next en el modal. Para touch usar `onTouchStart`/`onTouchEnd` con threshold de swipe (~50px).

- **Problema:** El `aria-label` del backdrop dice "Imagen completa de {name}" pero ese atributo está en el `m.div` que es el dialog. Sin embargo, el botón de cerrar tampoco tiene foco inicial y el dialog no tiene nada `aria-labelledby`. El elemento focusable inicial dentro del modal no existe (ni botón cerrar tiene `autoFocus`).
  - **Línea(s):** 84-90, 110-120
  - **Solución:** añadir `ref` al botón cerrar y `.focus()` al abrir, o `autoFocus` (con la salvedad SSR/CSR habitual). Mejor: usar Radix Dialog.

- **Problema:** **Sin `inert` / sin ocultar el resto del DOM a SR.** Mientras el lightbox está abierto, lectores de pantalla pueden seguir leyendo Navbar, contenido de la página, etc. WAI-ARIA recomienda `inert` en los hermanos del dialog o `aria-hidden="true"` en el `<main>`.
  - **Línea(s):** 77-122
  - **Solución:** marcar `<main>` con `inert` cuando `lightboxOpen` (atributo HTML moderno, soportado en Chromium/FF/Safari recientes), o aplicar `aria-hidden="true"` al elemento `body > *` excepto el portal del modal.

- **Problema:** Archivo de 126 líneas — supera el umbral. Mezcla galería + thumbnails + lightbox modal en un único componente client.
  - **Línea(s):** todas
  - **Solución:** separar `ProductLightbox` en su propio archivo (también facilita reemplazarlo por Radix Dialog), y `ProductThumbnails` para la fila de miniaturas.

---

## Hallazgos importantes 🟡

### `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`

- **Problema:** Falta `loading.tsx` y `error.tsx` para esta ruta dinámica. `/catalogo` sí los tiene (según `CLAUDE.md`), pero `/catalogo/[categoria]/[slug]` no los hereda. Si la query a Supabase es lenta o falla, el usuario ve flash de hidratación o el error boundary global.
  - **Solución:** crear `src/app/(public)/catalogo/[categoria]/[slug]/loading.tsx` con un esqueleto de la galería + columna info (mantiene CLS bajo) y `error.tsx` con CTA "Volver al catálogo".

- **Problema:** Doble fetch de `getCategories()` entre `generateStaticParams`, `generateMetadata` y el render de la página. Sin `unstable_cache`/`React.cache()` se ejecuta múltiples veces durante el build/SSR.
  - **Línea(s):** 22-25, 51-55, 92-95
  - **Solución:** envolver `getCategories` y `getProductBySlug` en `React.cache()` (per-request dedupe) y/o `unstable_cache` con tag/`revalidate`. Es una de las recomendaciones de `vercel-react-best-practices` (`server-cache-react`).

- **Problema:** En el render principal hay duplicación de la lógica `categories.find(cat => cat.slug === categoria && cat.id === product.categoryId)` (líneas 64-66 y 101-103).
  - **Solución:** extraer un helper `findCategoryForProduct(categories, categoria, product)` en `src/features/catalog/utils/`.

- **Problema:** La tabla de variantes (líneas 142-181) usa `style={{ borderColor: 'var(--color-border)' }}` cuatro veces. Verbose.
  - **Solución:** definir la regla en `globals.css` (`.kf-table { border-color: var(--color-border); }`) o pasar al CSS inline una sola vez en el wrapper `<table>` con descendent selector. Mejor aún: extraer a `PriceVariantsTable`.

- **Problema:** El precio muestra `S/ {product.price}` sin `.toFixed(2)` cuando hay `priceTable` (línea 145), pero sí usa `.toFixed(2)` cuando NO hay `priceTable` (línea 179). Inconsistencia visible al usuario (ej. `Desde S/ 90` vs `S/ 90.00`).
  - **Línea(s):** 145, 165, 179
  - **Solución:** decidir un formato único (recomiendo `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })` extraído a `src/features/catalog/utils/formatPrice.ts`) y usarlo en TODAS las posiciones (incluida la tabla `S/ {v.price}`).

- **Problema:** El `<table>` no tiene `<caption>` ni `aria-label` describiéndola, ni el `<th>` define `scope`. A11y básica para tablas perdida.
  - **Línea(s):** 147-170
  - **Solución:** agregar `<caption className="sr-only">Precios por cantidad para {product.name}</caption>`, `scope="col"` en cada `<th>`.

### `src/features/catalog/components/ProductGallery.tsx`

- **Problema:** El botón principal (línea 34-49) tiene `cursor-zoom-in` pero a teclado no comunica que abre un modal — `aria-haspopup="dialog"` ayuda.
  - **Solución:** añadir `aria-haspopup="dialog"` y `aria-expanded={lightboxOpen}` al botón.

- **Problema:** Las miniaturas seleccionan imagen pero su estado (cuál está activa) no se comunica a SR. Hay borde visual pero no `aria-current` ni `aria-pressed`.
  - **Línea(s):** 53-72
  - **Solución:** `aria-pressed={selected === img}` o `aria-current={selected === img ? 'true' : undefined}`.

- **Problema:** `key={i}` en thumbnails (línea 55). Si `images` cambia (no aplica hoy, pero futuro) puede provocar reorder bugs en React.
  - **Solución:** usar `key={img}` (URL de Cloudinary, única).

- **Problema:** El `priority` está bien pero el contenedor del thumbnail principal usa `aspect-[4/3] lg:aspect-square` — en mobile la imagen no es cuadrada, lo cual cambia el aspecto entre breakpoints y puede provocar CLS al cruzar `lg`.
  - **Solución:** unificar aspect ratio o, si se quiere mantener diferente por breakpoint, asegurar `aspect-ratio` en CSS para evitar re-layout.

### `src/features/catalog/queries/getProductBySlug.ts`

- **Problema:** `getProductBySlug(slug)` no filtra por `categoryId`, por lo que un slug existente bajo otra categoría devuelve el producto y luego la página rechaza por `category.slug === categoria`. Funciona, pero hace una vuelta extra; además permite que un slug duplicado en otra categoría exponga datos en `generateMetadata` antes del `notFound()` final.
  - **Línea(s):** 8-13
  - **Solución:** aceptar parámetro opcional `categorySlug` y joinear con `categories` en el `select` para filtrar en SQL, o validar `category.slug` antes de retornar el producto.

### `src/features/catalog/types/index.ts`

- **Problema:** El tipo `Product.images` está como `string[]` opcional, pero `mapProductRow` siempre asigna `[]` cuando es null (mappers.ts línea 15). Inconsistencia: en runtime nunca es undefined, pero en types sí.
  - **Línea(s):** types/index.ts:34, mappers.ts:15
  - **Solución:** alinear: o `images: string[]` (no opcional) en el type, o `mapProductRow` que devuelva `undefined` cuando no haya imágenes.

- **Problema:** `priceTable: PriceVariant[]` y `PriceVariantRow` declaran exactamente lo mismo. Comentario reconoce el tipo no auto-generado, pero podría unificarse.
  - **Línea(s):** 12-21
  - **Solución:** definir uno solo (`PriceVariant`) y exportar alias `PriceVariantRow = PriceVariant` si se quiere semántica diferente.

---

## Mejoras propuestas 🟢

### `src/features/catalog/components/ProductGallery.tsx`

- **Propuesta:** Reemplazar el lightbox manual por `Dialog` de `@/components/ui/primitives/dialog` (Radix). Ya está en el design system del proyecto (vía shadcn). Provee focus trap, restore focus, `aria-modal`, escape, scroll lock y portal — TODOS los hallazgos críticos de a11y se resuelven sin código extra.
  - **Justificación:** elimina deuda de a11y y reduce ~40 líneas de lógica manual; consistente con el resto del proyecto.

- **Propuesta:** Agregar contador "1 / N" en el lightbox cuando hay múltiples imágenes.
  - **Justificación:** UX estándar en e-commerce, mejora orientación.

- **Propuesta:** Soporte de zoom in-place (`object-cover` con scale on hover, o pan al click) — ya hay `cursor-zoom-in`, conviene cumplir la promesa.
  - **Justificación:** mejora percepción de calidad del producto.

### `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`

- **Propuesta:** Mostrar `product.includes` (lista) y `product.occasion` cuando existan. El campo está en el tipo y en el mapper, pero la UI no lo usa.
  - **Justificación:** datos de producto desperdiciados; mejora conversión y SEO (más texto indexable).

- **Propuesta:** Sección "Productos relacionados" (mismas categorías, máx 4). Server-side, sin costo client.
  - **Justificación:** retención y discoverability.

- **Propuesta:** Pre-llenar nombre del producto en el `whatsappProduct` con un identificador (slug + S/ {price}) para que el equipo identifique el ítem rápido.
  - **Justificación:** acelera la atención post-click.

- **Propuesta:** Reemplazar `style={{ borderColor: ... }}` recurrente por clases utility que lean tokens (`border-[color:var(--color-border)]`) o por `@apply` en `globals.css`. Tailwind v4 soporta arbitrary values con CSS vars.
  - **Justificación:** limpieza y consistencia de estilos.

### `src/features/catalog/queries/getProductBySlug.ts`

- **Propuesta:** Envolver en `React.cache()` para deduplicar el fetch entre `generateMetadata` y el render principal en el mismo request.
  - **Justificación:** una llamada a Supabase menos por SSR/build.

### Cloudinary / LCP

- **Propuesta:** Generar URL transformada para el OG image (`c_fill,w_1200,h_630`) y para los thumbnails (`w_160,c_fill`). Hoy se sirve la misma URL para todos los tamaños y `next/image` re-optimiza vía proxy `/_next/image`, lo que cuesta CPU del edge.
  - **Justificación:** menos transformaciones server-side, mejor caching, OG image correcto al compartir.

- **Propuesta:** `<link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous">` en root layout.
  - **Justificación:** mejora LCP en mobile real.

---

## Resumen ejecutivo

**Lo que está bien:**
- `params: Promise<{...}>` con `await` ✅ (Next 16 correcto)
- `generateStaticParams` presente ✅
- `generateMetadata` presente (aunque incompleto) ✅
- Server Component por defecto, solo lo client donde toca ✅
- `next/image` en todas las imágenes (galería + thumbnails + lightbox) ✅
- `priority` en imagen principal ✅
- `LazyMotion` + `domAnimation` en el lightbox ✅ (regla del proyecto cumplida)
- Lightbox `z-[100]` correcto sobre Navbar `z-[90]` y WhatsAppFloat `z-50` ✅
- `BUSINESS` constants usado, sin datos de contacto hardcodeados ✅
- Sin `<img>` nativo, sin `any`, sin colores hex hardcodeados en JSX ✅
- Tracking analytics dentro de un client wrapper ✅
- Cierre del lightbox con Esc + click backdrop ✅
- Scroll lock del body cuando el lightbox está abierto ✅
- Server Actions / RLS Supabase: no aplica al detalle público (solo lectura)

**Lo que urge corregir (bloqueante para producto público):**
1. Title duplicado en HTML servido (regresión visible).
2. Faltan OG/Twitter por producto — compartir es genérico.
3. Falta JSON-LD `Product` + `BreadcrumbList`.
4. Lightbox sin focus trap, sin restore focus, sin navegación entre imágenes.
5. Inconsistencia en formato de precio (`S/ 90` vs `S/ 90.00`).

**Próximos pasos recomendados (orden de impacto):**
1. Arreglar el title (5 min) → SEO inmediato.
2. Agregar OG/Twitter por producto + canonical (15 min) → compartibilidad.
3. Migrar lightbox a Radix Dialog (1 h) → a11y completa + menos código.
4. JSON-LD Product/BreadcrumbList (30 min) → rich results.
5. Extraer `PriceVariantsTable` y formatPrice (20 min) → mantenibilidad y consistencia.
6. `loading.tsx`/`error.tsx` para esta ruta (15 min) → UX en mala red.
