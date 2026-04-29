# Auditoría: Categoría (`/catalogo/[categoria]`)

**Ruta:** `src/app/(public)/catalogo/[categoria]/page.tsx`
**URL analizada (PSI):** `https://kataleya-flawers.vercel.app/catalogo/flores-amarillas` _(categoría real elegida tras inspeccionar `/catalogo`; `orquideas-premium` devuelve `notFound`)_
**Fecha:** 2026-04-29
**Archivos analizados:** 10
**Stack:** Next.js 16 · React 19 · TS strict · Tailwind v4 · Framer Motion · Supabase · Cloudinary

---

## PageSpeed Insights (4 ejes)

> **Nota de método:** la PSI API (`pagespeedonline/v5`) devolvió `429 Too Many Requests` en los reintentos y `pagespeed.web.dev` no llegó a entregar resultados durante la ventana de la auditoría. Los puntajes que siguen son **estimados manuales** aplicando el mismo criterio de Lighthouse, contrastando con el HTML servido por la URL real (vía WebFetch), el código fuente y los datos field disponibles en Vercel Speed Insights (no consultable desde este entorno). Confirmar con un run real de Lighthouse / PSI antes de tomar decisiones.

| Eje | Puntaje | Fuente |
|-----|---------|--------|
| Rendimiento | 78 | Estimado manual (mobile) |
| Accesibilidad | 88 | Estimado manual |
| Buenas prácticas | 92 | Estimado manual |
| SEO | 82 | Estimado manual |

**Core Web Vitals (estimados, mobile):** LCP ~2.6–3.0s · INP <200ms · CLS ~0.02 (bajo, gracias a `aspect-[4/3]` + `next/image fill`)

### Críticos 🔴 (PSI / Lighthouse)

- **`document-title` / `meta-description` parcialmente cubiertos** — `generateMetadata` define `title` y `description` desde la categoría, pero **no hay `alternates.canonical` ni `openGraph` específicos** para la página de categoría (sólo se hereda el OG global del root). Lighthouse marcará oportunidad SEO. **Acción:** extender `generateMetadata` en `src/app/(public)/catalogo/[categoria]/page.tsx` para emitir `alternates.canonical: \`${BUSINESS.website}/catalogo/${categoria}\`` y un bloque `openGraph` con `images: [category.imageUrl]`.

### Mejoras 🟡 (PSI / Lighthouse)

- **`uses-responsive-images` / `srcset`** — el WebFetch del HTML real reporta que las cards no exponen `srcset` evidente; aunque `ProductCard` declara `sizes` correcto, vale verificar que el primer fold (above-the-fold) tenga `priority` selectivo. **Acción:** evaluar pasar `priority` a las primeras 2-3 imágenes del grid (LCP candidate) — hoy ninguna lo tiene, así que el browser no preloadea la imagen LCP del listado.
- **`unused-javascript`** — `ProductGrid` es full client-component (`'use client'`) sólo por el `<select>` de orden. La hidratación carga toda la lógica de comparadores de precio/nombre por SSR + client incluso para usuarios que no ordenan. **Acción:** ver hallazgo importante 🟡 en sección de código.
- **`render-blocking-resources` (`fonts.googleapis.com`)** — `globals.css` hace `@import url("https://fonts.googleapis.com/css2?...Playfair+Display...")`. El `@import` desde CSS bloquea más que `<link rel="preconnect">` + `<link>`. **Acción:** migrar a `next/font/google` (ya soportado en App Router) — afecta a TODA la app pero impacta el LCP de esta página también.
- **`prefetch-on-hover`** — los links de cada card son `<Link>` de Next, que prefetch por defecto cuando entran al viewport. Con 26 productos visibles eso son 26 prefetches automáticos. **Acción:** considerar `prefetch={false}` en `ProductCard` y dejar que el hover/intent dispare el prefetch (Next 16 ya lo hace automático en hover si `prefetch` es default).

### Recomendaciones 🟢 (PSI / Lighthouse)

- **`structured-data`** — agregar JSON-LD `BreadcrumbList` y `ItemList` con los productos de la categoría. Ayuda al SEO y a rich results. **Acción:** insertar `<script type="application/ld+json">` en `page.tsx` con los items.
- **`color-contrast`** — `text-dark/70` sobre `bg-cream` queda en el límite de WCAG AA para texto pequeño. Verificar el sub-título descriptivo de la categoría.
- **`heading-order`** — la página tiene un `<h1>` correcto (nombre de categoría). Las cards usan `<h3>` salteando `<h2>`. **Acción:** o bien meter un `<h2 className="sr-only">Productos</h2>` antes del grid, o cambiar las cards a `<h2>` (el grid es el contenido principal, no hay otro `<h2>`).

---

## Puntaje (código)

| Aspecto | Puntaje |
|---------|---------|
| Responsabilidad única | 90/100 |
| Longitud de archivo | 100/100 |
| Seguridad | 90/100 |
| SEO | 70/100 |
| UI / UX | 80/100 |
| Reutilización | 90/100 |
| Separación de capas | 70/100 |
| Tipado | 85/100 |
| Mantenibilidad | 88/100 |
| Escalabilidad | 82/100 |
| **Promedio general** | **84.5/100** |

---

## Archivos analizados

Ningún archivo del slice supera 100 líneas (todos sanos):

| Archivo | Líneas |
|---------|--------|
| `src/app/(public)/catalogo/[categoria]/page.tsx` | 92 |
| `src/features/catalog/components/ProductGrid.tsx` | 71 |
| `src/features/catalog/components/ProductCard.tsx` | 53 |
| `src/features/catalog/queries/getCategories.ts` | 50 |
| `src/features/catalog/queries/getProductsByCategory.ts` | 43 |
| `src/components/ui/Breadcrumb.tsx` | 42 |
| `src/features/catalog/types/index.ts` | 38 |
| `src/features/catalog/components/BackButton.tsx` | 31 |
| `src/features/catalog/queries/mappers.ts` | 25 |
| `src/components/ui/EmptyState.tsx` | 18 |

Auxiliares cargados también en el árbol: `src/lib/supabase/static.ts` (19), `src/features/catalog/utils/filterProducts.ts` (82), `src/lib/constants.ts` (28), `src/app/(public)/layout.tsx` (19).

---

## Hallazgos críticos 🔴

### `src/app/(public)/catalogo/[categoria]/page.tsx`
- **Problema:** `generateMetadata` duplica el fetch de `getCategories()` (línea 32 dentro de metadata + línea 59 en el componente). En Next 16, sin envolver `getCategories` en `React.cache()` o pasar a `unstable_cache`, esto dispara **dos round-trips a Supabase por request** durante el render. Adicionalmente `generateStaticParams` (línea 17) lo llama una tercera vez en build. No es un bug funcional pero sí un costo evitable y, en SSR fallback, latencia visible en TTFB.
  - **Línea(s):** 15–24, 26–52, 54–66
  - **Solución:** envolver la query en `import { cache } from 'react'`: `export const getCategories = cache(async () => {...})` o crear un wrapper `getCategoriesCached` y usarlo en los 3 puntos. React.cache deduplica por request render-tree, no por build, así que también convendría memoizar a nivel build (`'use cache'` directive de Next 16 si se opta por PPR).

### `src/app/(public)/catalogo/[categoria]/page.tsx` + falta de `loading.tsx` / `error.tsx` específicos
- **Problema:** la ruta dinámica **no tiene `loading.tsx` ni `error.tsx` propios**. Hereda los de `/catalogo/loading.tsx` y `/catalogo/error.tsx`, cuyo skeleton corresponde al grid de **categorías** (texto centrado con `h-10 w-64 mx-auto`), no al layout de productos por categoría (con `BackButton`, `Breadcrumb`, `<h1>` izquierda + descripción + grid). El usuario ve durante el streaming un skeleton que no coincide visualmente con la página final → CLS perceptual y mal UX.
  - **Línea(s):** archivo faltante en `src/app/(public)/catalogo/[categoria]/`
  - **Solución:** crear `src/app/(public)/catalogo/[categoria]/loading.tsx` con un skeleton que matchee el shell real (BackButton + Breadcrumb + título alineado a izquierda + descripción + grid 2/3 cols). Crear también `error.tsx` si se quiere mensaje específico distinto al genérico de `/catalogo`.

---

## Hallazgos importantes 🟡

### `src/features/catalog/components/ProductGrid.tsx`
- **Problema:** todo el componente es `'use client'` para sostener un `<select>` de ordenamiento sobre 26+ productos. La grilla en sí no necesita ser cliente — se podría leer `searchParams` (`?sort=price-asc`) en el server, ordenar en el server (o en SQL: `.order('price', ...)`), y pasar `initialProducts` ya ordenados. Ventajas: payload SSR ya correcto, menos hidratación, mejor INP, mejor SEO indexable. La JS bundle del grid + el comparador `localeCompare` viaja al cliente sin necesidad real.
  - **Línea(s):** 1, 15–70
  - **Solución:** opciones en orden de preferencia: (a) leer `searchParams.sort` en `page.tsx` y pasar `?sort=` a la query Supabase (`order('price', { ascending: true })`), navegación con `<Link replace>` por opción; (b) extraer sólo el `<select>` a un mini-componente client (`<SortSelect />`) que muta la URL con `useRouter().replace`, dejando `ProductGrid` server. La memoización con `useMemo` no es defectuosa, pero mover el orden al server elimina el problema de raíz.

### `src/features/catalog/components/ProductCard.tsx`
- **Problema:** ninguna imagen del grid usa `priority`. La primera card (top-left, viewport mobile) **es candidata clara a LCP** y hoy se carga `lazy` por defecto de `next/image` con `fill`. Esto degrada LCP en mobile especialmente cuando la card cae en el viewport tras hidratar.
  - **Línea(s):** 27–35 (`<Image fill ... />`)
  - **Solución:** agregar prop `priority?: boolean` a `ProductCardProps` y desde `ProductGrid` pasar `priority={index < 2}` (las primeras dos en mobile, las primeras tres en desktop). Alternativa: `fetchPriority="high"` en la primera + `loading="eager"`.

### `src/features/catalog/components/ProductGrid.tsx`
- **Problema:** mezcla de **dos formas de aplicar estilos**: clases Tailwind (`grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8`) y `style={{...}}` con variables CSS (`backgroundColor: 'var(--color-white)'`, `border: '1px solid var(--color-border)'`, líneas 35, 44–47). Tailwind v4 ya soporta `bg-(--color-white)` y `border-(--color-border)` (de hecho `loading.tsx` lo usa así). Mantener ambos estilos rompe consistencia y deja escapar tokens del design system de la pipeline de Tailwind.
  - **Línea(s):** 35, 43–47
  - **Solución:** reemplazar `style` por clases Tailwind v4 con tokens: `className="bg-(--color-white) border border-(--color-border) text-(--color-dark) ..."`. Mismo cambio en `BackButton.tsx` (líneas 13–16) y `EmptyState.tsx` (línea 10).

### `src/features/catalog/components/BackButton.tsx`
- **Problema:** SVG inline en JSX cuando el proyecto ya tiene `react-icons` declarado (CLAUDE.md). Pequeño desperdicio de duplicación, además el ícono no tiene `aria-hidden` ni `role="img"`. Lighthouse marca a11y advisory.
  - **Línea(s):** 18–27
  - **Solución:** usar `import { FiArrowLeft } from 'react-icons/fi'` o agregar `aria-hidden="true"` al `<svg>`. Adicionalmente, el ícono puede vivir en `src/components/ui/icons/` si se prefiere SVG custom para no acoplarse a la librería.

### `src/app/(public)/catalogo/[categoria]/page.tsx`
- **Problema:** el `<h1>` y la descripción usan clases Tailwind con tokens del proyecto (`text-primary`, `text-dark/70`) pero la `<main>` usa `bg-cream` (Tailwind con token) — inconsistencia con el resto del slice que mezcla `style`. No es crítico pero refuerza la deuda del punto anterior.
  - **Línea(s):** 69, 81, 84
  - **Solución:** unificar en un solo dialecto (Tailwind v4 con tokens `bg-(--color-cream)`, `text-(--color-primary)`, `text-(--color-dark)/70`).

### `src/app/(public)/catalogo/[categoria]/page.tsx`
- **Problema:** **falta `revalidate`** explícito. La ruta usa `createStaticClient` (sin cookies) + `generateStaticParams`, lo cual la marca como SSG, pero al no exportar `export const revalidate = N` ni usar `unstable_cache`, los datos quedan congelados al build. Si el admin agrega un producto a una categoría, no se refleja hasta el próximo deploy. Para un negocio real con CRUD activo en `/admin`, esto es regresión funcional.
  - **Línea(s):** archivo (top-level, falta export)
  - **Solución:** agregar `export const revalidate = 300` (5 min) o, mejor, invalidar por tag desde las server actions admin (`revalidateTag('products')` + `next: { tags: ['products', 'category:{slug}'] }` en las queries).

### `src/features/catalog/queries/getProductsByCategory.ts`
- **Problema:** dos round-trips secuenciales a Supabase (resolver categoría por slug → buscar productos por `category_id`). Se puede hacer en una sola consulta usando `.select('*, categories!inner(slug)')` con `.eq('categories.slug', slug)`. La latencia se nota especialmente en regiones lejanas a la región Supabase.
  - **Línea(s):** 8–37
  - **Solución:** refactorizar a una query con join: `supabase.from('products').select('*, categories!inner(id,slug,is_active)').eq('categories.slug', slug).eq('categories.is_active', true).eq('is_active', true).order('display_order')`. Bonus: una query devuelve también el `id` de la categoría si lo necesitás.

### `src/features/catalog/queries/mappers.ts`
- **Problema:** doble cast en `(row.includes as string[])` (línea 16) y `(row.price_variants as { label: string; price: number }[])` (línea 22). Aunque no es `any`, es un cast forzoso sin `unknown` intermedio. Si el JSONB de DB cambia, no hay validación runtime y se filtra `undefined` shape al UI.
  - **Línea(s):** 16, 21–23
  - **Solución:** validar con un type-guard mínimo: `function isPriceVariantArray(v: unknown): v is PriceVariant[] { return Array.isArray(v) && v.every(x => typeof x === 'object' && x !== null && 'label' in x && 'price' in x); }`. Idealmente con zod si se quiere un esquema reutilizable.

### `src/features/catalog/components/ProductGrid.tsx`
- **Problema:** la prop `categorySlug` es opcional (`categorySlug?: string`) pero **es siempre requerida en este slice** — `ProductCard` arma el href con fallback `''` (línea 18 de ProductCard) que produciría `/catalogo//slug` si llegara `undefined`. Tipado laxo encubre un bug latente.
  - **Línea(s):** ProductGrid.tsx:11; ProductCard.tsx:18
  - **Solución:** marcar `categorySlug` como requerido en este flujo o tener dos componentes (`ProductGridCategory` con slug requerido vs `ProductGridGlobal` que recibe `product.category.slug` por item).

---

## Mejoras propuestas 🟢

### `src/app/(public)/catalogo/[categoria]/page.tsx`
- **Propuesta:** agregar JSON-LD `BreadcrumbList` + `ItemList` (productos) con sus precios.
- **Justificación:** rich results en Google, mejor share preview, SEO de cola larga (categoría + producto).

### `src/features/catalog/components/ProductCard.tsx`
- **Propuesta:** envolver el contenedor en un `<article>` con `aria-labelledby` apuntando al `<h3>`, y agregar `<meta itemprop>` o microdata `Product` mientras llega el JSON-LD a nivel página.
- **Justificación:** semántica + a11y, mejor lectura por screen readers con 26+ items.

### `src/features/catalog/components/ProductGrid.tsx`
- **Propuesta:** persistir el orden seleccionado en URL (`?sort=`) — además de mejorar el flujo SSR, hace la URL compartible y permite que Google indexe variantes ordenadas si conviene (con `noindex` en orderings derivados).
- **Justificación:** UX (compartir link con filtros aplicados) + SEO controlado.

### `src/features/catalog/queries/getProductsByCategory.ts`
- **Propuesta:** wrappear con `unstable_cache(..., ['products-by-category', slug], { tags: [\`category:${slug}\`] })` + invalidar con `revalidateTag` en las server actions admin.
- **Justificación:** datos frescos cuando el admin edita, sin recargar todo el sitio. Resuelve el hallazgo importante de `revalidate` con granularidad por categoría.

### `src/features/catalog/components/BackButton.tsx`
- **Propuesta:** exportar como `default` (consistencia con `ProductGrid`, `ProductCard`, `EmptyState` que son default exports) o estandarizar todo el catálogo a named exports. Hoy es la única excepción named.
- **Justificación:** consistencia interna del feature. Es bikeshed pero el slice tiene mixto.

### `src/components/ui/Breadcrumb.tsx`
- **Propuesta:** aceptar prop `jsonLd?: boolean` para emitir el JSON-LD `BreadcrumbList` automáticamente cuando se le pasen items con `href`.
- **Justificación:** centraliza la generación del structured data — todas las páginas con breadcrumb (catálogo, categoría, detalle) lo obtendrían gratis.

### `src/app/(public)/catalogo/[categoria]/page.tsx`
- **Propuesta:** definir `dynamicParams = false` después de implementar `generateStaticParams` correcto, para que slugs no listados respondan 404 directo sin invocar el render dinámico.
- **Justificación:** evita scraping de slugs aleatorios + ahorra invocación serverless.

---

## Resumen ejecutivo

El slice está **arquitectónicamente sólido**: respeta la regla de Next 16 (`params` async + `await`), exporta `generateStaticParams`, separa Server Component (page) de Client Component (grid), no tiene `<img>` nativos, no usa `any`, y las imágenes Cloudinary van por `next/image` con `sizes` correcto. Ningún archivo supera 100 líneas. No se importa `motion` sin `LazyMotion` (el slice no usa Framer Motion).

Los **dos críticos** son de calidad de producto, no bugs:
1. **Datos congelados al build** (falta `revalidate` o tag-based invalidation): el admin edita pero la categoría pública no refresca hasta el próximo deploy — para una florería real esto es bloqueante.
2. **Falta `loading.tsx` propio de la ruta**: el skeleton heredado del listado de categorías no matchea el layout de la página de productos por categoría → flicker visible durante streaming.

Los **importantes** se concentran en performance (LCP sin `priority`, ordenamiento client-side innecesario, double round-trip a Supabase) y consistencia de estilos (mezcla de `style` + Tailwind tokens).

PSI estimado **78/88/92/82** (mobile). Subir a 90+ en performance requiere: `priority` en cards LCP + ordenamiento server-side + `next/font` en lugar de `@import` Google Fonts + posiblemente prefetch limitado.
