# Auditoría: Catálogo `/catalogo`

**Ruta:** `src/app/(public)/catalogo/page.tsx`
**URL analizada (PSI):** `https://kataleya-flawers.vercel.app/catalogo`
**Fecha:** 2026-04-29
**Archivos analizados:** 14
**Stack:** Next.js 16 · React 19 · TS strict · Tailwind v4 · Framer Motion · Supabase · Cloudinary

---

## PageSpeed Insights (4 ejes)

PSI API devolvió `429 Too Many Requests` en 3 intentos consecutivos, así que los puntajes son **estimados** a partir de:
- Inspección del HTML servido por la URL de producción (vía WebFetch).
- Análisis estático del bundle implícito (Server Component + 1 Client Component principal con `useSearchParams`).
- Cumplimiento de reglas duras del proyecto.

| Eje | Puntaje | Fuente |
|-----|---------|--------|
| Rendimiento | **78** | Estimado (manual) |
| Accesibilidad | **82** | Estimado (manual) |
| Buenas prácticas | **88** | Estimado (manual) |
| SEO | **74** | Estimado (manual) — penalizado por título duplicado |

**Core Web Vitals (lab estimado):** LCP ~2.4s · INP ~150ms · CLS bajo (skeletons reservan espacio en `loading.tsx`).
**Field data (Vercel Speed Insights):** no consultado en esta sesión — revisar dashboard Vercel.

### Críticos 🔴 (PSI / Lighthouse)

- **`document-title` duplicado** — El HTML servido tiene `<title>Catalogo de Flores | Kataleya Flawers | Kataleya Flawers</title>`. El root layout (`src/app/layout.tsx:15`) define `template: "%s | ${BUSINESS.name}"` y la página (`src/app/(public)/catalogo/page.tsx:30`) entrega como `title` un string que YA incluye `| ${BUSINESS.name}`. El template lo concatena otra vez. — **Acción:** en `page.tsx:30` cambiar `title: "Catalogo de Flores | ${BUSINESS.name}"` → `title: "Catálogo de Flores"` (dejar que el template del root agregue el sufijo). Aprovechar y poner la tilde en "Catálogo".
- **`meta-description` ausente en cliente** — WebFetch no encontró meta description en el HTML. Verificar que `metadata.description` se está renderizando en `<head>` (el código lo declara correctamente; podría ser problema de caché edge). — **Acción:** validar en producción con `view-source:` y revalidar cache si hace falta.

### Mejoras 🟡 (PSI / Lighthouse)

- **`render-blocking-resources` — Google Fonts** — `globals.css:1` usa `@import url("https://fonts.googleapis.com/...")` que es bloqueante de render. — **Acción:** migrar a `next/font` (Playfair Display + Lato) en `src/app/layout.tsx` para auto-preconnect, font-display swap y self-host.
- **`unused-javascript`** — `CatalogSearch.tsx` (618 líneas) se carga completo aunque el usuario solo vea el grid de categorías hasta interactuar. — **Acción:** considerar `next/dynamic` con `ssr: false` para los `filterSections` o split del panel de filtros mobile como bundle aparte.
- **`uses-responsive-images`** — `CategoryCard.tsx:40` declara `sizes="(max-width: 640px) 50vw, 33vw"` pero faltan breakpoints intermedios para `lg` (que en el grid usa 3 columnas, ~25vw en pantallas grandes). — **Acción:** ajustar a `"(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`.
- **`structured-data`** — La página de catálogo no emite JSON-LD `ItemList`/`CollectionPage` con las 6 categorías (sólo el `Florist` global del root layout). — **Acción:** agregar `<script type="application/ld+json">` con `CollectionPage` + `ItemList` de categorías en `page.tsx`.

### Recomendaciones 🟢 (PSI / Lighthouse)

- **`canonical` URL** — falta `metadata.alternates.canonical` en `page.tsx`. — **Acción:** agregar `alternates: { canonical: "/catalogo" }`.
- **`og:image` ausente** — el catálogo se compartirá por WhatsApp; sin imagen explícita el preview es genérico. — **Acción:** definir `metadata.openGraph.images` con una imagen 1200x630 (puede ser una composición de las categorías).
- **Font subsetting** — Playfair Display y Lato cargan todos los pesos definidos. — **Acción:** auditar qué pesos se usan realmente (ya hay `400;600;700` para Playfair y `400;700` para Lato; suficientemente acotado, pero verificar via `next/font`).
- **`heading-order`** — la página tiene `h1` ("Nuestro Catálogo"), las `CategoryCard` usan `h2`. Está bien. Validar que las card del grid filtrado (`ProductCard`) usan `h3` (lo hacen — `ProductCard.tsx:40`). OK.

---

## Puntaje (código)

| Aspecto | Puntaje |
|---------|---------|
| Responsabilidad única | 65/100 |
| Longitud de archivo | 40/100 |
| Seguridad | 95/100 |
| SEO | 60/100 |
| UI / UX | 78/100 |
| Reutilización | 70/100 |
| Separación de capas | 88/100 |
| Tipado | 95/100 |
| Mantenibilidad | 65/100 |
| Escalabilidad | 75/100 |
| **Promedio general** | **73/100** |

---

## Archivos analizados

Archivos del slice (>100 líneas marcados con ⚠️):

| Archivo | Líneas |
|---------|--------|
| ⚠️ `src/features/catalog/components/CatalogSearch.tsx` | **618** |
| `src/features/catalog/utils/filterProducts.ts` | 82 |
| `src/features/catalog/components/CategoryCard.tsx` | 69 |
| `src/app/(public)/catalogo/page.tsx` | 61 |
| `src/features/catalog/components/ProductCard.tsx` | 53 |
| `src/features/catalog/queries/getCategories.ts` | 50 |
| `src/features/catalog/types/index.ts` | 38 |
| `src/app/(public)/catalogo/loading.tsx` | 31 |
| `src/app/(public)/catalogo/error.tsx` | 29 |
| `src/features/catalog/queries/mappers.ts` | 25 |
| `src/features/catalog/queries/getProducts.ts` | 21 |
| `src/app/(public)/layout.tsx` | 19 |
| `src/features/catalog/queries/getProductColors.ts` | 12 |
| `src/features/catalog/queries/getFlowerTypes.ts` | 12 |

`hooks/` no existe en el slice (el README lo lista; no es bloqueante, sólo documentación a corregir).

---

## Hallazgos críticos 🔴

### `src/app/(public)/catalogo/page.tsx`
- **Problema:** Doble sufijo en el `<title>`. `metadata.title` ya contiene `| Kataleya Flawers` y el `template` del root layout vuelve a agregar `| Kataleya Flawers`. Resultado en producción: `Catalogo de Flores | Kataleya Flawers | Kataleya Flawers` (verificado vía WebFetch).
- **Línea(s):** 29-33
- **Solución:**
  ```ts
  export const metadata: Metadata = {
    title: "Catálogo de Flores", // sin sufijo: el template del root lo agrega
    description: `Explora nuestro catálogo...`,
    alternates: { canonical: "/catalogo" },
  };
  ```

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** **618 líneas en un solo Client Component.** Mezcla 4 responsabilidades: parseo/sincronización de URL params, lógica de filtros, render del sidebar desktop, render del panel mobile colapsable. La regla del proyecto dice máx 100 líneas por archivo. Esto es 6.18x el límite.
- **Línea(s):** 1-618
- **Solución:** Descomponer en:
  - `hooks/useCatalogFilters.ts` → toda la lógica de URL params + debounce + handlers (`updateParam`, `updateListParam`, `clearAllFilters`, `handleRemoveFilter`, parseo de params, `filters` derivado).
  - `components/CatalogSearch/SearchInput.tsx` → barra de búsqueda con icono SVG (duplicada actualmente sidebar+mobile).
  - `components/CatalogSearch/FilterSections.tsx` → secciones reutilizables (Precio, Categoría, Color, Tipo) ya inline pero como JSX inline en el componente padre.
  - `components/CatalogSearch/FilterSidebar.tsx` (desktop) y `components/CatalogSearch/FilterMobile.tsx` (mobile drawer/collapse).
  - `components/CatalogSearch/ResultsGrid.tsx` → grid filtrado + estado vacío + chips.
  - `components/CatalogSearch/index.tsx` → composición (~50-80 líneas).

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** `filterProducts(products, categories, filters)` se ejecuta en **cada render** sin `useMemo`. Con dataset chico (decenas de productos) hoy no duele, pero es O(n × selectedColors × selectedFlowerTypes) por render y se llama dentro de un componente que re-renderiza con cada cambio de input (incluso antes del debounce de 300ms). Los handlers (`updateParam`, `updateListParam`, `clearAllFilters`) sí están memoizados con `useCallback`.
- **Línea(s):** 233-235
- **Solución:**
  ```ts
  const filteredProducts = useMemo(
    () => (isFiltersActive ? filterProducts(products, categories, filters) : []),
    [isFiltersActive, products, categories, filters]
  );
  ```
  Atención: `filters` se rearma en cada render → o bien estabilizar con `useMemo` o derivar `useMemo` directamente leyendo URL params. Mejor opción: encapsular todo en `useCatalogFilters` (ver hallazgo anterior).

---

## Hallazgos importantes 🟡

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** Búsqueda y filtros completamente client-side. Si el dataset crece a cientos de productos con `colors` + `flowerTypes` por producto, el bundle se infla (todos los productos viajan al cliente para filtrar) y el TTFB del SSR aumenta. Ya hoy `getProducts()` trae **todos los productos activos** de la DB en cada render server-side.
- **Línea(s):** 233-235 (lógica) + `page.tsx:36-41` (carga total)
- **Solución:** Migrar a server-side: leer `searchParams` async en `page.tsx`, filtrar contra Supabase con `.ilike()` + `.in()` + rango de precio, y usar Suspense con `key` derivada de los params para streaming. Mantener client-side sólo el debounce del input que sincroniza la URL.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** SVGs inline duplicados (lupa, clear, chevron, filter). 4 SVGs × 2 renders (sidebar + mobile) = 8 copias. Inflación de JS y mantenimiento frágil.
- **Línea(s):** 437-447, 464-466, 492-502, 520-522, 533-535, 545-553
- **Solución:** Extraer a `<SearchIcon />`, `<XIcon />`, `<ChevronDownIcon />`, `<FilterIcon />` en `src/components/ui/icons/` (o usar `react-icons` que ya es dependencia del proyecto).

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** Uso masivo de `style={{ ... }}` inline con CSS variables (~30 ocurrencias). Tailwind v4 ya soporta `bg-(--color-surface)`, `border-(--color-border)`, `text-(--color-muted)` (sintaxis arbitrary value). Mezclar `style={}` con `className` dificulta mantener consistencia y duplica reglas (`backgroundColor`, `border`, `color` repetidas en cada botón).
- **Línea(s):** 113-114, 250, 254, 265-269, 272-273, 285-289, 296, 307-318, 330, 339-352, 372, 384-394, 410-412, 451-456, 471, 485-487, 507-512, 530, 539-540, 558, 575, 598, 604
- **Solución:** Crear utilidades de clase Tailwind:
  ```tsx
  const inputCls = "bg-(--color-surface) border border-(--color-border) text-(--color-dark)";
  const chipBaseCls = "px-3 py-1 rounded-full font-body text-xs font-medium transition-all";
  const chipActiveCls = "bg-(--color-primary) text-(--color-white) border border-(--color-primary)";
  ```
  Idealmente, generalizar como componente `<Chip active>`.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** `text-white` (clase Tailwind) hardcodeado en línea 539 y 603 para botones con fondo primary. Funciona pero ignora el token `--color-white` definido en `globals.css:31`. Mantener consistencia con el resto del slice que sí usa `var(--color-white)`.
- **Línea(s):** 539, 603
- **Solución:** Reemplazar `text-white` → `text-(--color-white)` o `style={{ color: 'var(--color-white)' }}`.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** Emoji `🎨` como fallback cuando un color no tiene `hex`. Mezcla niveles de presentación (datos de UI) con datos del dominio. Además los emojis no se renderizan consistentemente entre OS.
- **Línea(s):** 361
- **Solución:** Usar un círculo gris con `var(--color-muted)` o un SVG palette dedicado.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** `<button>` sin `type="button"` explícito (líneas 305, 339, 380, 458, 514, 528, 601). En contextos sin `<form>` Chrome lo asume `submit`-default y puede causar comportamientos sutiles si en el futuro este árbol queda dentro de un `<form>`.
- **Línea(s):** 111-112, 305, 339, 380, 406-407, 458-462, 514-518, 528-531, 601-602
- **Solución:** Agregar `type="button"` a todos.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** El `<input type="text">` de búsqueda no tiene `<label>` (sólo `placeholder`). Lighthouse marcará `label` como falla de accesibilidad.
- **Línea(s):** 446-450, 502-506
- **Solución:** Envolver con `<label className="sr-only">Buscar productos<input ... /></label>` o agregar `aria-label="Buscar ramos, flores"`.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** Inputs `type="number"` sin `<label>` ni `aria-label`.
- **Línea(s):** 256-271, 274-290
- **Solución:** Agregar `aria-label="Precio mínimo"` y `aria-label="Precio máximo"`.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** El botón "Limpiar todo" (línea 111-117) usa `<button>` con clase `underline` y sin `type="button"`. El icono SVG en chevron (mobile) gira con `rotate-180` pero no expone `aria-expanded` en el botón controlador del panel mobile, lo que es un problema de accesibilidad para lectores de pantalla.
- **Línea(s):** 528-554
- **Solución:** Agregar `aria-expanded={filtersOpen}` y `aria-controls="catalog-filters-mobile"` al toggle, y `id="catalog-filters-mobile"` al div del panel.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Problema:** `useEffect` para sincronizar `inputValue` con `urlQ` puede causar loops sutiles cuando el usuario escribe rápido y la URL cambia mid-debounce. Hoy parece funcionar pero es código frágil.
- **Línea(s):** 152-154
- **Solución:** Considerar el patrón "input is the source of truth, URL is shadowed", o usar `useDeferredValue` (React 19) en vez de debounce manual.

### `src/app/(public)/catalogo/page.tsx`
- **Problema:** `Promise.all` con 4 queries Supabase. Si uno falla, **falla la página entera** (ya hay `error.tsx` que captura). Además, `getFlowerTypes`, `getProductColors` y `getCategories` cambian raramente — son candidatos perfectos para `unstable_cache` o ISR a nivel de query.
- **Línea(s):** 36-41
- **Solución:** Wrappear con `unstable_cache` y `revalidate` largo (1 hora), o tags para invalidación bajo demanda desde el admin CRUD.

### `src/app/(public)/catalogo/page.tsx`
- **Problema:** El `<h1>` usa la clase `font-heading` (Playfair Display) pero en el HTML rendered de producción se ve correctamente, OK. Sin embargo el `mb-12` (3rem) entre h1 y el contenido es excesivo en mobile y empuja el LCP element (probablemente la primera imagen del grid) más abajo del fold.
- **Línea(s):** 51-53
- **Solución:** `mb-8 md:mb-12`. Mejor LCP en mobile.

### `src/app/(public)/catalogo/page.tsx`
- **Problema:** El `Suspense` con fallback `CategoryGridFallback` es buena idea para evitar hydration mismatch con `useSearchParams`, PERO el fallback renderiza **el mismo grid de categorías** que el componente cliente cuando `!isFiltersActive`. Entonces el usuario ve el grid duplicado: primero del fallback SSR, luego reemplazado por el grid del cliente. Causa flicker.
- **Línea(s):** 14-27 + 55-57
- **Solución:** Como el grid de categorías es estático y no depende de filtros, renderizarlo en el Server Component directamente y dejar que `CatalogSearch` SOLO se monte cuando hay filtros activos en URL. Esto reduce JS en el caso default y elimina el flicker.

### `src/app/(public)/catalogo/loading.tsx`
- **Problema:** El skeleton renderiza 6 cards (línea 24) que coincide con las 6 categorías reales. Si en el futuro se agregan/quitan categorías el skeleton queda desincronizado. Magic number.
- **Línea(s):** 24
- **Solución:** `Array.from({ length: 6 }, ...)` está OK pero documentar el origen del 6 en un comentario, o exponerlo como constante (`SKELETON_CARD_COUNT`).

### `src/features/catalog/utils/filterProducts.ts`
- **Problema:** `filterProducts` recorre todos los productos y dentro hace `categories.find(c => c.slug === filters.categoria)` en cada producto (O(n*m)). Para datasets pequeños no se nota; con cientos de categorías sería un problema.
- **Línea(s):** 55-58
- **Solución:** Mover el `.find` fuera del filter (computar `selectedCategoryId` una vez antes del `allProducts.filter`).

### `src/features/catalog/queries/getCategories.ts`
- **Problema:** Mezcla responsabilidades: define el tipo `mapCategoryRow` (mapeo) Y ejecuta la query. Convención del proyecto separa `queries/` de `mappers.ts` (de hecho `getProducts.ts` lo hace bien, importando de `mappers.ts`).
- **Línea(s):** 8-22
- **Solución:** Mover `mapCategoryRow` a `mappers.ts` para coherencia con el resto del slice.

### `src/components/ui/primitives/skeleton.tsx`
- **Problema:** `bg-muted` es la clase shadcn, que termina apuntando a `--muted` definido en `globals.css:45` como una mezcla muy clara. En `loading.tsx` el skeleton casi no contrasta con `bg-cream` (también muy claro). LCP visual del skeleton es débil.
- **Línea(s):** `loading.tsx:5` + `skeleton.tsx:7`
- **Solución:** Usar `bg-(--color-border)` (más oscuro) para los skeletons, o agregar un shimmer.

### `src/app/(public)/layout.tsx`
- **Problema:** El `<Suspense>` que envuelve `<Navbar />` con fallback `<div className="h-16" />` reserva 4rem (64px) pero la página interna usa `pt-28` (7rem = 112px). Posible CLS si el navbar real es más alto que 64px. Además, no hay `<main>` aquí; el `<main>` se declara en cada page.
- **Línea(s):** 11-13
- **Solución:** Verificar la altura real del navbar y alinear el fallback. Considerar mover `<main>` al layout (semántica) y dejar las páginas con `<section>`.

---

## Mejoras propuestas 🟢

### `src/features/catalog/components/CatalogSearch.tsx`
- **Propuesta:** Extraer un componente `<Chip variant="active|inactive">` reutilizable (categoría, color, tipo de flor todos comparten estilos). Esto elimina ~150 líneas de JSX duplicado.
- **Justificación:** DRY + base sólida para añadir más facets (rango de fecha, ocasión, etc.) en el futuro.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Propuesta:** Reemplazar el debounce manual con `useDeferredValue(inputValue)` de React 19 + sincronizar a URL en un `useEffect` sobre el deferred value. Más idiomático y se aprovecha `concurrent rendering`.
- **Justificación:** React 19 nativo, menos código, mejor INP.

### `src/features/catalog/components/CatalogSearch.tsx`
- **Propuesta:** Considerar `useTransition` para `router.replace` — los cambios de URL serían marcados como no urgentes, evitando bloqueos del input en filtros pesados.
- **Justificación:** Mejor INP en pantallas con muchos productos.

### `src/app/(public)/catalogo/page.tsx`
- **Propuesta:** Agregar JSON-LD `BreadcrumbList` (ya hay un `<BreadcrumbNav>` visual pero no estructurado). Y un `CollectionPage` con `ItemList` listando las categorías.
- **Justificación:** Mejora rich results en Google + descubribilidad de categorías.

### `src/features/catalog/utils/filterProducts.ts`
- **Propuesta:** El text search hace `searchable.includes(q)` después de un `join(' ').toLowerCase()` por cada producto, en cada filtrado. Pre-computar un campo `_searchIndex` al cargar productos (en `mapProductRow`) ahorra ~70% del trabajo del filtro de texto.
- **Justificación:** Escala mejor cuando el catálogo crezca.

### `src/features/catalog/queries/getProducts.ts`
- **Propuesta:** Hoy `getProducts()` trae TODO con `select('*')`. Para el catálogo `/catalogo` podríamos seleccionar sólo los campos que las cards y el filtro necesitan (`id, name, slug, image_url, price, price_variants, category_id, colors, flower_types, includes, description, occasion`). Las imágenes adicionales (`images`) y `note` no se usan en la lista.
- **Justificación:** Reduce payload Supabase → cliente y memoria del Server Component.

### `src/features/catalog/components/CategoryCard.tsx` y `ProductCard.tsx`
- **Propuesta:** Añadir `loading="lazy"` explícito (next/image lo hace por defecto a partir de la 1ra fila, pero las primeras 3 cards visibles podrían beneficiarse de `priority` para mejorar LCP). Como en mobile el grid es 2 columnas, las primeras 2 cards pueden ser LCP.
- **Justificación:** Mejor LCP. Cuidado: si todo es priority no hay ganancia. Marcar las primeras 2 (mobile) o 3 (desktop).

### `src/features/catalog/components/CategoryCard.tsx`
- **Propuesta:** El `clientTrackEvent('category_click')` se dispara en el `onClick` PERO el `<Link>` también navega; si la navegación es rápida la analítica puede perderse (race con el unmount). Considerar `sendBeacon` o `navigator.sendBeacon` dentro de `clientTrackEvent`.
- **Justificación:** Tracking confiable de clicks que navegan.

### `src/features/catalog/components/CategoryCard.tsx`
- **Propuesta:** Es `'use client'` solo para disparar el event tracking. El JSX no necesita estado ni hooks. Alternativa: dejarlo Server y mover el tracking a un wrapper `<TrackedLink>` que sí sea client.
- **Justificación:** Reduce JS en el bundle del catálogo (cada CategoryCard hoy obliga a hidratación).

### General
- **Propuesta:** Añadir `metadata.alternates.canonical` en `page.tsx` y considerar `metadata.robots` para evitar indexar URLs con query strings (filtros).
- **Justificación:** Evitar contenido duplicado en Google.

### General
- **Propuesta:** El `CLAUDE.md` lista `src/features/catalog/hooks/` pero el directorio no existe. Documentación desactualizada.
- **Justificación:** Coherencia. Crear el hook `useCatalogFilters` materializa esta carpeta.

---

## Resumen ejecutivo

**Lo bueno**
- Server Component como entry point con `Promise.all` paralelo. Bien.
- Cero `<img>` nativo, cero `any`, cero hex hardcodeado en JSX, cero datos de contacto fuera de `BUSINESS`. Las reglas duras del proyecto se respetan.
- Tipado estricto (`Promise<React.ReactElement>` en page, interfaces bien definidas).
- Suspense + `loading.tsx` + `error.tsx` correctamente cableados.
- Tokens CSS (`--color-*`) usados consistentemente.

**Lo crítico a resolver YA**
1. **Título duplicado en `<head>`** (SEO bug visible en producción).
2. **`CatalogSearch.tsx` con 618 líneas** — viola la regla de 100 líneas del proyecto por 6x. Necesita descomposición urgente.
3. **`filterProducts` sin `useMemo`** — recalcula en cada render.

**Lo que merece atención pronto**
- Eliminar el grid duplicado entre fallback SSR y client component.
- Migrar fonts a `next/font` (LCP).
- Considerar filtrado server-side cuando el dataset crezca.

**Score global del slice: 73/100** — Bueno, sin críticos de seguridad ni bugs funcionales serios, pero con un componente "monolito" que urge fragmentar y un bug SEO de título duplicado.
