# Auditoría: Componentes globales y configuración cross-cutting

**Slice:** Globales (Navbar, Footer, layout root, WhatsAppFloat, BUSINESS, Tailwind v4, ESLint, Next config, TS config, Husky, Playwright, design system UI)
**Fecha:** 2026-04-29
**Stack:** Next.js 16.2.4 · React 19.2.3 · TS 5 strict · Tailwind v4 · Framer Motion 12 (LazyMotion) · Supabase · Cloudinary · Playwright · Vercel Analytics + Speed Insights
**PSI:** N/A — slice cross-cutting sin URL única.

## Archivos analizados (24)

| # | Archivo | Líneas |
|---|---------|--------|
| 1 | `src/app/layout.tsx` | 85 |
| 2 | `src/app/globals.css` | 134 |
| 3 | `src/app/not-found.tsx` | 42 |
| 4 | `src/components/shared/Navbar/index.tsx` | 162 ⚠️ |
| 5 | `src/components/shared/Navbar/DesktopSearch.tsx` | 128 ⚠️ |
| 6 | `src/components/shared/Navbar/MobileDrawer.tsx` | 174 ⚠️ |
| 7 | `src/components/shared/Navbar/useNavbar.ts` | 167 ⚠️ |
| 8 | `src/components/shared/Navbar/constants.ts` | 20 |
| 9 | `src/components/shared/Footer.tsx` | 117 ⚠️ |
| 10 | `src/components/shared/WhatsAppFloat.tsx` | 66 |
| 11 | `src/components/shared/BusinessHoursBadge.tsx` | 53 |
| 12 | `src/components/shared/SearchResultItem.tsx` | 64 |
| 13 | `src/components/ui/Button.tsx` | 119 ⚠️ |
| 14 | `src/components/ui/Input.tsx` | 49 |
| 15 | `src/components/ui/Breadcrumb.tsx` | 42 |
| 16 | `src/components/ui/ConfirmDialog.tsx` | 62 |
| 17 | `src/components/ui/EmptyState.tsx` | 18 |
| 18 | `src/components/ui/FilterChip.tsx` | 26 |
| 19 | `src/components/ui/FormField.tsx` | 34 |
| 20 | `src/components/ui/PillToggle.tsx` | 52 |
| 21 | `src/components/ui/SectionHeader.tsx` | 33 |
| 22 | `src/components/ui/ToggleSwitch.tsx` | 26 |
| 23 | `src/components/ui/index.ts` | 11 |
| 24 | `src/components/ui/primitives/{alert-dialog, breadcrumb, button, chart, input, label, sheet, skeleton, sonner, switch, textarea}.tsx` | 1038 (gen) |
| 25 | `src/lib/constants.ts` | 28 |
| 26 | `src/lib/utils.ts` | 6 |
| 27 | `eslint.config.mjs` | 86 |
| 28 | `next.config.ts` | 23 |
| 29 | `tsconfig.json` | 34 |
| 30 | `package.json` | 68 |
| 31 | `.husky/pre-commit` | 7 |
| 32 | `playwright.config.ts` | 25 |
| 33 | `postcss.config.mjs` | 7 |
| 34 | `proxy.ts` | 26 |
| 35 | `components.json` | 25 |

> ⚠️ marca archivos > 100 líneas. No existe `src/types/index.ts` — reglas cite que ese archivo debería existir como tipos globales.

## Puntaje por aspecto (código)

| Aspecto | Puntaje |
|---------|---------|
| Responsabilidad única | 78/100 |
| Longitud de archivo | 70/100 |
| Seguridad | 80/100 |
| SEO | 62/100 |
| UI / UX (a11y) | 68/100 |
| Reutilización | 78/100 |
| Separación de capas (Server/Client) | 72/100 |
| Tipado | 92/100 |
| Mantenibilidad | 76/100 |
| Escalabilidad / Performance React | 60/100 |
| **Configuración / Tooling** | 58/100 |
| **Promedio general** | **72/100** |

---

## A. Paleta y CSS vars — `globals.css`

### Hallazgos

- 🔴 **Fuentes cargadas vía `@import url()` de Google Fonts** — línea 1. NO se usa `next/font`. Esto es **render-blocking**, sin self-hosting, sin `font-display: swap` nativo y rompe la regla del proyecto que exige `next/font` para Playfair Display + Lato.
  - **Solución:** mover Playfair y Lato a `next/font/google` en `app/layout.tsx`, exponerlas como variables (`--font-heading`, `--font-body`) y eliminar el `@import url()` del CSS. Ganancia inmediata en LCP/CLS.
- 🟡 **Variables `--color-flower-*` y `--color-status-*` en `:root`** (líneas 22–30) — hex hardcodeados (`#e74c3c`, `#f8a5c2`, `#f1c40f`, `#ecf0f1`, `#8e44ad`, `#e67e22`, `#27ae60`, `#95a5a6`, `#2980b9`). No están definidas en CLAUDE.md como parte de la paleta y mezclan colores de marca con tokens semánticos sin documentación.
  - **Solución:** documentar en CLAUDE.md o moverlas a un `@layer` separado con prefijo claro (`--swatch-flower-*`). Validar que `flower-blanco: #ecf0f1` tenga contraste AA cuando se use sobre crema.
- 🟡 **Duplicación de tokens shadcn vs paleta del proyecto** — `--primary`, `--secondary`, `--accent`, `--background`, `--foreground` usan los mismos hex que `--color-primary` etc., pero **están hardcodeados en hex** (líneas 35–66), no derivan de las CSS vars maestras. Si se cambia `--color-primary` los tokens shadcn no se actualizan.
  - **Solución:** que los tokens shadcn referencien las vars maestras: `--primary: var(--color-primary);`. Una sola fuente de verdad.
- 🟡 **`@import url()` antes de `@import "tailwindcss"`** — el navegador no aprovecha preload + preconnect.
  - **Solución:** eliminar el `@import` y usar `next/font` (resuelve también el 🔴 anterior).
- 🔵 **Falta `font-display` en el @import** — aunque Google Fonts añade `&display=swap` al final del query, podría documentarse explícito.
- 🔵 **`@theme inline` repite `--font-heading: "Playfair Display", serif` en línea 75** — duplica la def de la línea 12. Tras migrar a `next/font` esto desaparece automáticamente.

---

## B. Layout root — `src/app/layout.tsx`

### Hallazgos

- 🔴 **Falta `metadataBase`** — sin él, `openGraph.url`, `images`, canonical y enlaces sociales se rompen en preview/share. WhatsApp/Twitter no podrá resolver imágenes.
  - **Solución:** `metadataBase: new URL(BUSINESS.website)` (ya disponible en `BUSINESS.website`).
- 🔴 **No hay `openGraph.images` ni `twitter.images`** — los previews en redes sociales (especialmente WhatsApp, principal canal de venta del negocio) saldrán sin imagen.
  - **Solución:** agregar OG image (`/opengraph-image.{png|jpg}` en `app/` o vía `images: [{ url, width: 1200, height: 630, alt }]`). Considerar `app/opengraph-image.tsx` para generación dinámica.
- 🔴 **`metadata.icons.icon: "/favicon.png"` apunta a un asset inexistente** — el archivo real es `src/app/favicon.ico`. Convención de App Router: el icono debe estar en `app/icon.{ico|png|svg}` o `public/favicon.png`. La metadata actual genera 404 en `<link rel="icon" href="/favicon.png">`.
  - **Solución:** o quitar el `icons` del metadata y dejar que App Router descubra `app/favicon.ico`, o crear `public/favicon.png` y un `app/icon.svg`.
- 🟡 **Falta `viewport`** — Next 16 separa `viewport` de `metadata` (export `viewport: Viewport`).
  - **Solución:** `export const viewport: Viewport = { themeColor: "#c0392b", width: "device-width", initialScale: 1 }`.
- 🟡 **Falta `robots`** — sin `metadata.robots` se hereda el default. Para el admin deberíamos forzar `noindex` (se valida en otro slice, pero el root debería declarar `index, follow` explícito).
- 🟡 **No hay `alternates.canonical`** — para SEO el root debería declarar canonical default.
  - **Solución:** `alternates: { canonical: "/" }` (relative al `metadataBase`).
- 🟡 **JSON-LD inline con `dangerouslySetInnerHTML`** — funciona pero pierde tipado. Se puede usar el componente recomendado por Next:
  - **Solución:** mover el JSON-LD a un componente `<Script id="ld-json" type="application/ld+json" strategy="beforeInteractive">` o mantener el patrón pero extraer el objeto a una constante tipada con `WithContext<Florist>` de `schema-dts`.
- 🟡 **JSON-LD incompleto para Florist/LocalBusiness** — falta `priceRange`, `image`, `geo`, `address.streetAddress` y `aggregateRating` si aplica. Lima como `addressLocality` solo ya es muy genérico.
- 🟡 **Toaster, Analytics, SpeedInsights montados sin condición de prod** — `clientTrack.ts` sí filtra por `NODE_ENV === 'production'`, pero los componentes Vercel se cargan en dev también (no bloquea pero suma JS innecesario).
- 🟡 **No hay `Suspense` boundary alrededor de `{children}`** — cualquier server fetch lento en el root cuelga la navegación.
- 🔵 **`<html lang="es">` correcto** pero podría usar `lang="es-PE"` para precision regional.
- 🔵 **`suppressHydrationWarning` no aplicado** — no es estrictamente necesario porque no hay theming (next-themes está instalado pero no usado), pero si se introduce dark mode habría que recordarlo.
- 🔵 **No hay `<meta name="theme-color">`** — agregar vía `viewport.themeColor`.

---

## C. Navbar — `z-[90]`

### Hallazgos

- 🔴 **Z-index conflicto con Sheet primitive** — `Navbar` está en `z-[90]`, pero `SheetContent` (usado por `MobileDrawer`) está en `z-50` (clase Tailwind base de Radix), aunque `MobileDrawer` lo overridea con `z-[95]`. El **overlay** del Sheet (`SheetOverlay`) también está en `z-50` (línea 40 de `sheet.tsx`) → **el overlay queda por debajo de la Navbar**. La Navbar (`z-[90]`) seguirá visible y clickeable mientras el drawer está abierto, lo que rompe el modal.
  - **Solución:** override del overlay a `z-[94]` o subir el Navbar a `z-50` y el drawer a `z-[60]/z-[55]`. Centralizar z-index en CSS vars (`--z-nav: 90; --z-drawer: 95;`).
- 🟡 **A11y: falta `<header>` con landmark explícito y skip-link** — el `<header>` está, pero NO hay `<a href="#main">Saltar al contenido</a>` ni `aria-label` en el `<nav>`. Para usuarios de teclado/screen reader esto obliga a tabular por todo el menú antes de llegar al contenido.
  - **Solución:** agregar skip-link en `layout.tsx` y `aria-label="Navegación principal"` al `<nav>`.
- 🟡 **A11y autocomplete incompleto** — `DesktopSearch.tsx` declara `aria-autocomplete="list"` y `aria-controls="search-dropdown"` (bien), pero **el listbox (`role="listbox"`) tiene items que NO son `role="option"`**. `SearchResultItem` renderiza `<button>` sin `role`, y no hay manejo de teclado (flechas arriba/abajo, Enter para seleccionar, Home/End).
  - **Solución:** el dropdown debe seguir el patrón ARIA combobox con teclado: cambiar `<button>` de `SearchResultItem` por `role="option"`, agregar `aria-selected`, `aria-activedescendant` en el input, y handler `onKeyDown` para flechas.
- 🟡 **A11y MobileDrawer: focus no se restaura** — al cerrar el drawer, el foco no regresa al botón hamburguesa. Radix lo maneja por defecto **solo si el `Sheet` se abre con su `Trigger`**, pero acá está controlado externamente (`open={isDrawerOpen}` + `setIsDrawerOpen`). El `onOpenChange` solo cierra, no rastrea el trigger.
  - **Solución:** usar `<SheetTrigger asChild>` envolviendo el botón hamburguesa, o guardar el activeElement antes de abrir y restaurarlo en cleanup.
- 🟡 **Focus trap del drawer depende 100% de Radix** — está bien, pero conviene auditar con axe/Playwright que tabular dentro del drawer no escape al body.
- 🟡 **Body scroll lock manual y duplicado con Radix** — `useNavbar.ts` (l. 32) hace `document.body.style.overflow = "hidden"` y Radix Sheet también bloquea scroll por su cuenta. Doble lógica → al cerrar el drawer abruptamente puede dejar `overflow: ""` cuando otro modal estaba abierto.
  - **Solución:** dejar que Radix Sheet maneje el scroll lock. Borrar el `useEffect` de body overflow.
- 🟡 **`useNavbar.ts` setea `setIsDrawerOpen(false)` con `Escape` en TODA la app** — el effect global de keydown cierra el drawer con Escape **incluso cuando el lightbox del producto está abierto** (que también escucha Escape). Race condition.
  - **Solución:** condicionar `isDrawerOpen` antes de cerrar, y pasar `useNavbar` un flag de "modal abierto" o usar `e.stopPropagation` en el lightbox.
- 🟡 **Re-renders en scroll** — `useNavbar.ts` setea `setIsScrolled(window.scrollY > 60)` en cada evento scroll. **Ya está pasivo** (✅), pero no usa `requestAnimationFrame` ni compara antes de setear. En cada pixel de scroll re-renderea todo `<Navbar>` y `<DesktopSearch>` (estilos inline cambian).
  - **Solución:** usar `requestAnimationFrame` o comparar `if (next !== prev) setIsScrolled(next)` (React ya hace bail-out sólo si la ref es la misma, pero acá `next` es `boolean`, así que React sí lo bailea — es OK; el problema es el listener llamando `setState` 60 veces/seg). Mover a `IntersectionObserver` sobre un sentinel sería ideal.
- 🟡 **Estilos inline + `onMouseEnter/Leave` para hover** — `Navbar/index.tsx` (l. 80-85, 110-117), `Footer.tsx`, `SearchResultItem.tsx`. Esto **no funciona en móviles** y rompe `prefers-reduced-motion`. Tailwind tiene `hover:` que respeta capabilities.
  - **Solución:** mover hovers a clases Tailwind (`hover:text-accent`, `hover:bg-primary`, etc.) y dejar `style` solo para tokens dinámicos.
- 🟡 **`searchProducts` se llama sin AbortController** — `useNavbar.ts` (l. 84). Si el usuario tipea rápido, varias requests viajan en paralelo y la última puede llegar antes; el flag `stale` solo evita el setState pero no aborta el fetch del lado del server action.
  - **Solución:** server actions no soportan AbortSignal nativamente, pero se puede usar un counter/version para descartar respuestas obsoletas. Ya hay flag `stale` — está OK pero documentar.
- 🟡 **`MobileDrawer` no tiene `SheetDescription`** — Radix logea warning de a11y cuando falta description en el dialog. Solo hay `SheetTitle`.
  - **Solución:** agregar `<SheetDescription className="sr-only">` con texto descriptivo.
- 🟡 **Hamburguesa no usa SVG accesible** — los 3 `<span>` que dibujan las líneas no tienen rol semántico.
  - **Solución:** OK porque el botón tiene `aria-label`, pero podría ser un `<svg role="presentation">` único.
- 🔵 **Tres copias de la lupa SVG inline** (Navbar, DesktopSearch, MobileDrawer) — extraer a `<SearchIcon />`.
- 🔵 **`primaryLinks` y `secondaryLinks` con `as const`** — bien tipado.

---

## D. WhatsAppFloat — `z-50`

### Hallazgos

- 🟡 **Usa `m.a` en lugar de `motion.a`** (✅ correcto con `LazyMotion`) y carga `domAnimation`, pero **se monta en CADA página con animaciones aunque el usuario no las dispare**. Para botón estático con micro-interacciones (hover/tap), es desproporcionado cargar `domAnimation`.
  - **Solución:** considerar reemplazar `m.a` + `whileHover` por una transición CSS pura (`hover:scale-110 active:scale-95 transition-transform`). Quita ~10kb gzip de Framer Motion en este bundle.
- 🟡 **`animate-pulse` siempre activo** — el ring pulsa indefinidamente. Tiene `motion-reduce:animate-none` (✅), pero igual consume CPU y es visualmente intrusivo (se solapa al hacer hover sobre otros elementos).
  - **Solución:** evaluar si limitar a primer minuto post-load o pulsar solo cuando el negocio está abierto.
- 🟡 **Z-index conflicto con Lightbox** — `WhatsAppFloat` está en `z-50` y el lightbox en `z-[100]` (según CLAUDE.md). En `/catalogo/[categoria]/[slug]` cuando se abre el lightbox, el botón debería quedar tapado. Verificar que efectivamente lo esté (es responsabilidad del lightbox elevarse, OK).
- 🔵 **`focus-visible:ring-2 focus-visible:ring-offset-2`** sin definir el color del ring. El `--ring` está definido (`#c0392b`), pero el botón es verde WhatsApp — el ring rojo sobre fondo verde funciona pero choca con la marca.
  - **Solución:** `style={{ ['--tw-ring-color' as string]: 'var(--color-cream)' }}` o clase custom.
- 🔵 **No hay tracking de servidor** — solo trackea client-side. Si el usuario hace click y JS falla, el evento se pierde. (Out of scope para este slice).

---

## E. Footer

### Hallazgos

- 🟡 **`COPYRIGHT_YEAR = 2026` hardcodeado** (l. 15) — quedará desactualizado. Para landing real conviene `new Date().getFullYear()` o un build-time constant.
  - **Solución:** `const COPYRIGHT_YEAR = new Date().getFullYear()` (ejecuta server-side por ser server component, no causa hydration issues).
- 🟡 **`NAV_LINKS` duplicado con `Navbar/constants.ts`** — Navbar tiene `primaryLinks/secondaryLinks` (`#hero`, `#nosotros`, `#testimonios`, `#contacto`, `/catalogo`) y Footer tiene `NAV_LINKS` con cuatro de ellos pero NO `#testimonios`. Drift garantizado.
  - **Solución:** centralizar en `src/lib/navigation.ts` (single source of truth) o exportar desde `Navbar/constants.ts`.
- 🟡 **Texto sin acentos** — "Atencion", "Navegacion", "Catalogo", "ubicacion" (l. 76, 86, 98, 106). Es un negocio peruano en español; la falta de tildes es no-profesional y degrada SEO local.
  - **Solución:** corregir tildes ("Atención", "Navegación", "Catálogo", "ubicación").
- 🟡 **`text-sm` y `opacity-80/90` mezclan** — hay texto sobre fondo `bg-accent` (verde oscuro) con `text-cream` y luego `opacity-90`. Verificar contraste WCAG AA: `#fdfcfa` con 90% sobre `#2d5a1b` ≈ ratio bueno, pero `opacity-80` puede caer cerca del límite con texto pequeño.
- 🔵 **Anchors `/#hero`, `/#contacto` con slash** — está bien para forzar landing, pero si el usuario está en `/catalogo` y clickea "Inicio" el browser navega a `/` y luego scrollea. Funciona, OK.

---

## F. BUSINESS constant — `src/lib/constants.ts`

### Hallazgos

- 🟡 **`whatsappWithMessage` y `whatsapp` duplican el número `51990051041`** — si cambia el número, hay que tocar 3 strings.
  - **Solución:** definir `phone` una vez y derivar: `whatsapp: \`https://wa.me/${BUSINESS.phone}\`` no es posible porque está dentro del literal, pero sí extraer una const local antes del `export`.
- 🟡 **`mapsEmbedUrl` apunta a "Florería Floritel"** — el iframe tiene la URL hardcodeada apuntando a OTRO negocio (`Floritel`, no `Kataleya`). Esto es **un bug de negocio crítico**. (Marcar como 🔴 si se confirma con el usuario que es error.)
  - **Solución:** verificar y reemplazar el `pb=...` con coordenadas reales de Kataleya en Lima.
- 🟡 **No hay `email`** — para SEO local (LocalBusiness JSON-LD) y forms de contacto.
- 🟡 **`experience` y `monthlyOrders` como string** — `"32"`, `"500+"`. Si en JSON-LD los queremos como número, hay que parsear.
- 🟡 **`hours.openDays: [1,2,3,4,5,6]`** — bien, pero el JSON-LD del layout hardcodea `["Monday"..."Saturday"]`. Si `openDays` cambia (e.g. domingo abierto), el JSON-LD queda inconsistente.
  - **Solución:** derivar el array de schema.org desde `openDays`.
- 🔵 **Falta `address.streetAddress` y `geo.latitude/longitude`** — JSON-LD `Florist` los reclama.

---

## G. ESLint config — `eslint.config.mjs`

### Hallazgos

- 🔴 **Falta `eslint-plugin-jsx-a11y` con reglas estrictas en flat config** — solo se usa `.recommended`, NO `.strict`. Con `recommended` se permite `<button>` sin `type` (ya hay caso en algunos archivos), `aria-*` mal escritos a veces pasan.
  - **Solución:** considerar `jsxA11yPlugin.flatConfigs.strict` o reglas extra: `jsx-a11y/no-autofocus`, `jsx-a11y/no-noninteractive-element-interactions`, `jsx-a11y/click-events-have-key-events` ya vienen en recommended pero verificar.
- 🔴 **No hay regla que prohiba `<img>` nativo** — la regla `@next/next/no-img-element` está en `nextPlugin.configs.recommended.rules` (✅ se incluye porque hace spread), pero no se valida explícitamente el level. CLAUDE.md la marca como CRITICAL del proyecto → debería ser `'error'` explícito y no warn.
  - **Solución:** override explícito: `'@next/next/no-img-element': 'error'`.
- 🔴 **No hay regla custom contra colores hex en JSX** — el proyecto prohibe `#xxx` en JSX/TSX y solo permite `var(--color-*)`. Esto NO está automatizado por lint.
  - **Solución:** agregar `no-restricted-syntax` con un selector que matchee `Literal[value=/^#[0-9a-fA-F]{3,8}$/]` dentro de JSX, o regla custom con `eslint-plugin-no-inline-styles` / mensaje custom.
- 🔴 **No hay regla contra `import { motion } from 'framer-motion'` directo** — el proyecto exige `LazyMotion` + `m`. Sin lint, es fácil violarlo.
  - **Solución:** `no-restricted-imports`:
    ```js
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'framer-motion',
        importNames: ['motion'],
        message: 'Usar `m` con LazyMotion + domAnimation (regla del proyecto).'
      }]
    }]
    ```
- 🟡 **`@typescript-eslint/no-explicit-any`** ya viene en `strict`, pero conviene confirmar level `error` no `warn`. La baseline confirma 0 errores de any → bien.
- 🟡 **`react-hooks/exhaustive-deps`** ya viene en `recommended`, pero `useNavbar.ts` tiene effects sin deps que podrían disparar warnings (l. 49 — `handleClickOutside` referencia `desktopSearchRef.current` que es estable, OK).
- 🟡 **No hay `eslint-plugin-import` o `eslint-plugin-simple-import-sort`** — el orden de imports queda al criterio del dev, sin auto-fix.
  - **Solución:** agregar `simple-import-sort` (cero config).
- 🟡 **`react/jsx-key`** ya viene en recommended, OK.
- 🟡 **No hay `jsx-a11y/anchor-is-valid` validando `next/link`** — para que no marque false positives en `<Link>`, hay que configurar `linkComponents`.
- 🟡 **No hay regla `@typescript-eslint/consistent-type-imports`** — mezclan `import type` con `import { type X }`. Aparece warning ya en baseline.
- 🟡 **`tseslint.configs.stylistic`** está activo — bien, pero genera la "interface vs type" friction visible en baseline. Documentar.
- 🟡 **Falta regla `@typescript-eslint/no-floating-promises`** — el proyecto usa server actions y `searchProducts(q).then(...)` sin catch (l. 84 useNavbar). Una promesa no manejada se silencia.
- 🟡 **`@next/next/no-html-link-for-pages`** OK por core-web-vitals config.
- 🔵 **No hay regla contra `console.log` en prod** — `no-console: ['warn', { allow: ['warn', 'error'] }]` recomendado.

---

## H. Next config — `next.config.ts`

### Hallazgos

- 🔴 **No hay `async headers()` con headers de seguridad** — para una landing en producción se esperan al menos:
  - `Content-Security-Policy` (o `Content-Security-Policy-Report-Only` para arrancar)
  - `X-Frame-Options: DENY` (mitiga clickjacking)
  - `Strict-Transport-Security` (HSTS)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (camera, microphone, geolocation = ())
  - `X-Content-Type-Options: nosniff`
  - **Solución:** agregar `async headers()` retornando estos headers para todos los paths. CSP debe permitir `res.cloudinary.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, `wa.me`, `va.vercel-scripts.com`.
- 🟡 **`images.remotePatterns` incluye `via.placeholder.com`** — placeholders públicos no deberían ir a producción. Si solo se usan en dev, condicionar.
  - **Solución:** quitar `via.placeholder.com` o restringir a un `pathname` específico.
- 🟡 **Falta `images.formats`** — no hay declaración explícita; Next 16 default ya incluye AVIF + WebP, pero conviene declararlo: `formats: ['image/avif', 'image/webp']`.
- 🟡 **Falta `images.minimumCacheTTL`** — Next default es 60s. Para Cloudinary que ya tiene su propio cache, subir a 31536000.
- 🟡 **Falta `images.deviceSizes` / `imageSizes`** — el default cubre, pero ajustarlos a los breakpoints reales del proyecto reduce el árbol de variantes.
- 🟡 **`experimental.turbopackFileSystemCacheForDev: true`** — ¿está documentado por qué? OK para dev. No afecta prod.
- 🟡 **No hay `poweredByHeader: false`** — expone `X-Powered-By: Next.js`. Apagar.
- 🟡 **No hay `productionBrowserSourceMaps`** — por defecto false, OK.
- 🔵 **No hay `redirects()` ni `rewrites()`** — OK para landing simple.

---

## I. TypeScript — `tsconfig.json`

### Hallazgos

- 🟡 **`strict: true`** ✅ pero falta:
  - `noUncheckedIndexedAccess` — sin esto, `array[0]` se tipa como `T` en lugar de `T | undefined`. Útil en `BUSINESS.hours.openDays.includes(day)` y `searchResults[i]`.
  - `exactOptionalPropertyTypes` — distingue `prop?: T` (puede ser ausente) de `prop: T | undefined` (debe estar como undefined). Mejora la API de componentes.
  - `noImplicitOverride` — fuerza `override` en métodos overrideados.
  - `noFallthroughCasesInSwitch`.
  - `forceConsistentCasingInFileNames` (default true en strict, OK).
- 🟡 **`target: ES2017`** — Next 16 + React 19 corren en runtimes modernos. Subir a `ES2022` para reducir downlevel polyfills.
- 🟡 **`paths: { "@/*": ["./src/*"] }`** ✅ bien.
- 🔵 **No hay `verbatimModuleSyntax`** — recomendado para forzar `import type` cuando corresponde y eliminar imports muertos en el output.

---

## J. Husky / lint-staged

### Hallazgos

- 🔴 **`.husky/pre-commit` ejecuta `gga run`** — referencia un binario externo (`Gentleman Guardian Angel - Code Review`) que no es parte del repo. Si el dev no lo tiene instalado, el commit falla siempre. Esto bloquea onboarding.
  - **Solución:** o documentar `gga` en README como pre-requisito, o gate-by-presence: `command -v gga >/dev/null 2>&1 && gga run || true`. CLAUDE.md NO menciona `gga`.
- 🟡 **No corre `tsc --noEmit`** — lint-staged solo ejecuta ESLint. Errores de tipos pueden colarse al main.
  - **Solución:** agregar `bash -c 'tsc --noEmit'` (no por archivo, una vez por commit) o usar `tsc-files`.
- 🟡 **No corre Playwright ni siquiera smoke test** — OK por velocidad, pero CI debería garantizarlo.
- 🟡 **`*.{js,mjs}` también pasa por `eslint --max-warnings 0`** — bien.
- 🔵 **Husky `prepare` script presente** ✅.

---

## K. Playwright — `playwright.config.ts`

### Hallazgos

- 🟡 **Solo Chromium** — no se prueba Firefox ni WebKit. Para una landing comercial en Perú, Safari iOS es relevante (el público mobile usa iPhone significativamente).
  - **Solución:** agregar proyecto `webkit` y `firefox` (al menos en CI).
- 🟡 **`fullyParallel: false` y `workers: 1`** — tests serializados, lento. Si los tests son independientes (lo son) → habilitar paralelo.
- 🟡 **`retries` no configurado** — default 0. En CI ayuda tener `retries: 2` para flakes.
- 🟡 **Solo 4 tests smoke + 2 de filtros** — coverage muy bajo. Páginas críticas sin coverage:
  - `/catalogo/[categoria]/[slug]` (detalle de producto, lightbox, CTA WhatsApp)
  - `/admin/*` (CRUD productos, drag-and-drop categorías)
  - Formulario de contacto, BusinessHoursBadge (abierto/cerrado), Navbar mobile drawer abrir/cerrar
- 🟡 **`baseURL: "http://localhost:3000"` hardcoded** — no permite correr contra preview deploys.
  - **Solución:** `baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"`.
- 🟡 **No hay `webServer` config** — los tests requieren `npm run dev` corriendo manualmente. CI debería levantar el server.
  - **Solución:** `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }`.
- 🔵 **`actionTimeout: 10s`** y `navigationTimeout: 10s` — razonable.
- 🔵 **No hay tests de accesibilidad** — agregar `@axe-core/playwright` para automatizar auditorías a11y críticas.

---

## Hallazgos críticos 🔴 (resumen)

### `src/app/globals.css`
- **Problema:** Fonts cargadas con `@import url()` de Google Fonts en lugar de `next/font` — render-blocking, sin self-hosting, viola la regla del proyecto.
- **Línea(s):** 1
- **Solución:** Migrar Playfair Display y Lato a `next/font/google` en `app/layout.tsx`, exponer como CSS vars (`variable: '--font-heading'` / `'--font-body'`) y aplicar en `<body className={\`${playfair.variable} ${lato.variable}\`}>`. Eliminar el `@import` del CSS.

### `src/app/layout.tsx`
- **Problema:** Falta `metadataBase` → OG/Twitter/canonical resuelven mal en preview/share.
- **Línea(s):** 13–34
- **Solución:** `metadataBase: new URL(BUSINESS.website)`.

### `src/app/layout.tsx`
- **Problema:** No hay `openGraph.images` ni `twitter.images` — preview en WhatsApp/redes sale sin imagen (impacto de negocio: WhatsApp es el canal principal).
- **Línea(s):** 22–33
- **Solución:** Crear `app/opengraph-image.{png|tsx}` (1200×630) o agregar `openGraph.images: [{ url, width: 1200, height: 630, alt }]`.

### `src/app/layout.tsx`
- **Problema:** `metadata.icons.icon: "/favicon.png"` apunta a un archivo que no existe (existe `app/favicon.ico`). Genera 404.
- **Línea(s):** 19–21
- **Solución:** Eliminar el bloque `icons` (App Router descubre `app/favicon.ico` automáticamente) o crear `public/favicon.png`.

### `src/components/shared/Navbar/index.tsx` + `src/components/ui/primitives/sheet.tsx`
- **Problema:** Z-index conflicto: Navbar `z-[90]`, SheetOverlay `z-50` por defecto. El overlay del drawer queda **debajo** de la Navbar — el drawer abierto deja la Navbar clickeable.
- **Línea(s):** Navbar/index.tsx:29, sheet.tsx:40
- **Solución:** override de SheetOverlay a `z-[94]` o subir Navbar a `z-50` y MobileDrawer a `z-[60]`. Centralizar z-index en CSS vars.

### `next.config.ts`
- **Problema:** No hay `async headers()` con headers de seguridad (CSP, HSTS, X-Frame-Options, Permissions-Policy, X-Content-Type-Options, Referrer-Policy).
- **Línea(s):** todo el archivo
- **Solución:** agregar `async headers()` que retorne el set de headers para `source: '/(.*)'`. Permitir `res.cloudinary.com`, `fonts.gstatic.com`, `va.vercel-scripts.com` en CSP.

### `eslint.config.mjs`
- **Problema:** No hay regla custom para automatizar las CRITICAL del proyecto: `<img>` (sólo viene heredado de next), color hex hardcodeado, `import { motion }` directo de framer-motion.
- **Línea(s):** todo el archivo
- **Solución:** ver sección "Recomendaciones de tooling/lint" al final.

### `.husky/pre-commit`
- **Problema:** ejecuta `gga run` (binario externo no documentado en CLAUDE.md/README). Si no está instalado, todos los commits fallan.
- **Línea(s):** 5–6
- **Solución:** documentar `gga` o gate-by-presence: `command -v gga >/dev/null 2>&1 && gga run || true`.

---

## Hallazgos importantes 🟡 (resumen)

### `src/components/shared/Navbar/MobileDrawer.tsx`
- **Problema:** Archivo > 100 líneas (174). Mezcla nav links + search dropdown + CTA en un componente.
- **Solución:** extraer `MobileNavLinks` y `MobileSearchPanel` a sub-componentes.

### `src/components/shared/Navbar/useNavbar.ts`
- **Problema:** Archivo > 100 líneas (167). Maneja 6 efectos + 4 handlers + autocomplete debounce. Difícil de testear.
- **Solución:** extraer hooks especializados: `useScrollState`, `useBodyScrollLock`, `useSearchAutocomplete`, `useDrawerKeyboard`.

### `src/components/shared/Navbar/index.tsx`
- **Problema:** Archivo 162 líneas con SVG inline duplicado (lupa) + estilos inline + onMouseEnter/Leave para hover (no funciona en mobile).
- **Solución:** extraer `<SearchIcon>`, mover hovers a Tailwind, separar Desktop block.

### `src/components/shared/Navbar/index.tsx`
- **Problema:** A11y: `<nav>` sin `aria-label`, falta skip-link en layout.
- **Línea(s):** 38
- **Solución:** `<nav aria-label="Navegación principal">` y agregar skip-link en `app/layout.tsx`.

### `src/components/shared/Navbar/MobileDrawer.tsx`
- **Problema:** A11y: falta `<SheetDescription>`, Radix logea warning en consola.
- **Línea(s):** 38–46
- **Solución:** agregar `<SheetDescription className="sr-only">Navegación, búsqueda y enlace para hacer pedido por WhatsApp.</SheetDescription>`.

### `src/components/shared/Navbar/DesktopSearch.tsx`
- **Problema:** A11y autocomplete incompleto: items son `<button>` sin `role="option"`, no hay manejo de teclado (flechas, Enter, Home/End, `aria-activedescendant`).
- **Solución:** implementar patrón ARIA combobox completo.

### `src/components/shared/Navbar/useNavbar.ts`
- **Problema:** Body scroll lock duplicado con Radix Sheet, Escape global puede colisionar con otros modales.
- **Línea(s):** 32–36, 63–72
- **Solución:** dejar el scroll lock a Radix; escope el Escape al `isDrawerOpen`.

### `src/components/shared/Footer.tsx`
- **Problema:** `COPYRIGHT_YEAR = 2026` hardcodeado; texto sin acentos ("Atencion", "Navegacion", "ubicacion"); duplica `NAV_LINKS` con `Navbar/constants.ts` (drift).
- **Línea(s):** 15, 75–106
- **Solución:** `new Date().getFullYear()`, corregir tildes, centralizar nav links.

### `src/lib/constants.ts`
- **Problema:** `mapsEmbedUrl` apunta a "Florería Floritel" — ¡otro negocio!
- **Línea(s):** 21
- **Solución:** verificar urgentemente con el dueño y reemplazar con coordenadas reales de Kataleya.

### `src/lib/constants.ts`
- **Problema:** Número `51990051041` repetido 3 veces (en `phone`, `whatsapp`, `whatsappWithMessage`). Si cambia, hay que tocar 3 strings.
- **Solución:** const local antes del export, derivar URLs.

### `src/components/ui/Button.tsx`
- **Problema:** Archivo 119 líneas. Discriminated union button-vs-link con casts (`as ButtonAsLink`) — funciona pero bordea `any`.
- **Solución:** posible refactor a dos componentes (`Button` y `ButtonLink`) o mantener pero documentar.

### `src/app/globals.css`
- **Problema:** Tokens shadcn (`--primary`, `--secondary`, `--accent`, ...) hardcodeados como hex, no derivan de las CSS vars maestras. Cambiar `--color-primary` no actualiza shadcn.
- **Línea(s):** 35–66
- **Solución:** `--primary: var(--color-primary);` etc. Single source of truth.

### `src/app/globals.css`
- **Problema:** Variables `--color-flower-*` y `--color-status-*` con hex hardcodeados sin documentar en CLAUDE.md.
- **Línea(s):** 22–30
- **Solución:** documentar o renombrar (`--swatch-flower-*` para indicar que NO son tokens de marca).

### `src/app/layout.tsx`
- **Problema:** No hay `viewport` export (Next 16), falta `themeColor`, falta `alternates.canonical`, falta `robots`.
- **Solución:** agregar `export const viewport: Viewport = { themeColor: "#c0392b", width: "device-width", initialScale: 1 }`; en metadata `alternates: { canonical: "/" }, robots: { index: true, follow: true }`.

### `src/app/layout.tsx`
- **Problema:** JSON-LD hardcodea días de la semana; si `BUSINESS.hours.openDays` cambia, se desincroniza. JSON-LD incompleto: falta `priceRange`, `image`, `geo`, `streetAddress`.
- **Línea(s):** 47–76
- **Solución:** derivar `dayOfWeek` desde `BUSINESS.hours.openDays`, completar campos.

### `next.config.ts`
- **Problema:** `via.placeholder.com` en remotePatterns — si solo se usa en dev, no debería ir a prod. Falta `images.formats`, `images.minimumCacheTTL`, `poweredByHeader: false`.
- **Solución:** limpiar y agregar configs.

### `tsconfig.json`
- **Problema:** Falta `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`. Target `ES2017` desactualizado.
- **Solución:** activar las flags y subir target a `ES2022`.

### `playwright.config.ts`
- **Problema:** Solo Chromium, sin retries, sin webServer, baseURL hardcoded, workers: 1, fullyParallel: false. Coverage bajo (~6 tests).
- **Solución:** agregar webkit/firefox proyectos, `webServer`, `retries: 2 en CI`, paralelo, baseURL desde env, expandir coverage a producto detalle y admin.

### `.husky/pre-commit`
- **Problema:** No corre `tsc --noEmit` ni typecheck.
- **Solución:** agregar verificación de tipos al pre-commit.

### `src/app/(public)/layout.tsx`
- **Problema:** `<Suspense fallback={<div className="h-16" />}>` envuelve solo Navbar. Si Navbar suspende (no debería en su versión actual), el fallback no replica visualmente la altura/estilo final → CLS pequeño.
- **Solución:** asegurar fallback con altura fija que matchee la Navbar real (h-16 ≈ 64px vs Navbar real ~ py-5 + contenido). Verificar.

---

## Mejoras propuestas 🟢 (resumen)

### `src/components/shared/Navbar`
- **Propuesta:** Extraer un `SearchIcon` y `HamburgerIcon` reutilizables — 3 copias inline hoy.
- **Justificación:** DRY, easier a11y centralization.

### `src/components/ui/primitives`
- **Propuesta:** Marcar `chart.tsx` (373 líneas) y `alert-dialog.tsx` (199 líneas) como código generado por shadcn — agregar comentario header.
- **Justificación:** Distinguir código generado de código del proyecto en revisiones.

### `src/lib`
- **Propuesta:** Crear `src/lib/navigation.ts` con la única lista de links (Navbar + Footer).
- **Justificación:** evita drift entre Navbar y Footer, single source of truth.

### `src/types/index.ts`
- **Propuesta:** Crear el archivo (CLAUDE.md lo documenta como existente, pero NO existe).
- **Justificación:** consistencia con la documentación del proyecto, lugar para tipos compartidos (e.g. `Locale`, `BusinessHours`, etc.).

### `src/app`
- **Propuesta:** Agregar `app/sitemap.ts` y `app/robots.ts` siguiendo File-Based Metadata API de Next 16.
- **Justificación:** SEO indexing automático para `/`, `/catalogo`, `/catalogo/[categoria]`, `/catalogo/[categoria]/[slug]`.

### `src/app`
- **Propuesta:** Agregar `app/manifest.ts` (PWA manifest) — el negocio puede beneficiarse de "Add to homescreen".
- **Justificación:** mejora UX mobile y SEO local.

### `src/components/shared/WhatsAppFloat.tsx`
- **Propuesta:** Reemplazar `LazyMotion + m.a + whileHover/whileTap` por transición CSS pura.
- **Justificación:** elimina dependencia de Framer Motion en el bundle global cuando solo es hover/tap.

---

## Recomendaciones de tooling / lint — automatizar las CRITICAL

Las reglas duras del proyecto deben validarse automáticamente. Hoy NINGUNA está blindada por lint excepto `<img>` (heredado).

### 1. Prohibir `<img>` nativo (CRITICAL)
```js
// eslint.config.mjs (sección Next plugin)
rules: {
  ...nextPlugin.configs.recommended.rules,
  ...nextPlugin.configs['core-web-vitals'].rules,
  '@next/next/no-img-element': 'error', // explícito
}
```

### 2. Prohibir `import { motion } from 'framer-motion'` directo (CRITICAL)
```js
'no-restricted-imports': ['error', {
  paths: [{
    name: 'framer-motion',
    importNames: ['motion'],
    message: 'Usar `m` con LazyMotion + domAnimation (regla del proyecto, ver CLAUDE.md).'
  }]
}]
```

### 3. Prohibir `any` (CRITICAL)
Ya viene de `tseslint.configs.strict` pero confirmar level:
```js
'@typescript-eslint/no-explicit-any': 'error',
```

### 4. Prohibir colores hex/rgb hardcodeados en JSX (CRITICAL)
```js
'no-restricted-syntax': ['error',
  {
    selector: "JSXAttribute[name.name='style'] Literal[value=/#[0-9a-fA-F]{3,8}/]",
    message: 'Usar var(--color-*) en lugar de hex hardcodeado (regla del proyecto).'
  },
  {
    selector: "JSXAttribute[name.name='style'] TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}/]",
    message: 'Usar var(--color-*) en lugar de hex hardcodeado.'
  },
  {
    selector: "Literal[value=/^rgb\\(|^rgba\\(/]",
    message: 'Usar var(--color-*) o color-mix(in srgb, ...).'
  }
]
```

### 5. Forzar uso de `BUSINESS` para datos de contacto (CRITICAL)
```js
'no-restricted-syntax': [
  // ...arriba
  {
    selector: "Literal[value=/wa\\.me\\/\\d/]",
    message: 'Usar BUSINESS.whatsapp o BUSINESS.whatsappWithMessage de @/lib/constants.'
  },
  {
    selector: "Literal[value=/instagram\\.com\\/kataleya/]",
    message: 'Usar BUSINESS.instagram de @/lib/constants.'
  },
  {
    selector: "Literal[value=/^\\+?51990051041|^990051041/]",
    message: 'Usar BUSINESS.phone de @/lib/constants.'
  }
]
```

### 6. Z-index dentro de un set predeterminado (CRITICAL)
```js
{
  selector: "JSXAttribute[name.name='className'] Literal[value=/\\bz-\\[?\\d+\\]?\\b/]",
  message: 'Z-index debe usar tokens del proyecto: z-[90] navbar, z-50 whatsapp-float, z-[100] lightbox. Ver CLAUDE.md.'
}
```
(Alternativa: definir CSS vars `--z-nav: 90; --z-drawer: 95; --z-whatsapp: 50; --z-lightbox: 100;` y usar `z-[var(--z-nav)]`.)

### 7. Prohibir crear `tailwind.config.*` (Tailwind v4)
```js
// no es regla ESLint, sino convención del repo:
// agregar en .gitignore o pre-commit script:
//   if [ -f tailwind.config.* ]; then echo "Tailwind v4 — no se permite tailwind.config"; exit 1; fi
```

### 8. Forzar `next/image` en lugar de `<img>` y usar `priority` con criterio
Adicional a (1):
```js
// regla custom o usar @next/next/no-html-link-for-pages
```

### 9. Prohibir `console.log` en producción
```js
'no-console': ['warn', { allow: ['warn', 'error'] }]
```

### 10. Forzar manejo de promesas (server actions)
Agregar `parserOptions.projectService: true` (ya está) y:
```js
'@typescript-eslint/no-floating-promises': 'error',
'@typescript-eslint/no-misused-promises': 'error',
```

### 11. Ordenar imports automáticamente
```bash
npm i -D eslint-plugin-simple-import-sort
```
```js
import simpleImportSort from 'eslint-plugin-simple-import-sort';
// ...
plugins: { 'simple-import-sort': simpleImportSort },
rules: {
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
}
```

### 12. Pre-commit hook robustecido
`.husky/pre-commit`:
```sh
#!/usr/bin/env sh
npx lint-staged
npx tsc --noEmit
# gga opcional, no bloqueante si no está instalado
command -v gga >/dev/null 2>&1 && gga run || true
```

### 13. Configurar `linkComponents` en jsx-a11y
```js
settings: {
  'jsx-a11y': {
    components: {
      Link: 'a',
    },
  },
}
```

### 14. Tipos globales centralizados
Crear `src/types/index.ts` (CLAUDE.md lo declara) con tipos compartidos, y exportar desde ahí. No es regla lint, es convención.

---

## Notas finales

- El slice global está **funcionalmente sólido** (cero `any` declarados, cero `<img>`, cero colores hex en JSX shared/, BUSINESS centralizado), pero **subutiliza el tooling**: las reglas críticas del proyecto se confían a la disciplina del dev en lugar de bloqueos automáticos.
- El gap más urgente para el negocio es **OG images + favicon + metadataBase**: los previews en WhatsApp salen mal, y WhatsApp es el canal principal de venta.
- El gap más urgente para performance es **migrar fonts a `next/font`**: hoy hay un `@import url()` render-blocking en cada navegación.
- El gap más urgente para confiabilidad es el **z-index del SheetOverlay vs Navbar** y el **`mapsEmbedUrl` apuntando a "Florería Floritel"** (¿bug de copy-paste con consecuencias reales?).
- El proyecto NO tiene `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image` ni `app/icon.tsx` — todo el File-Based Metadata API de Next 16 está sin usar.
