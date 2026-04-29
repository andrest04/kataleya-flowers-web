# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Landing page para **Kataleya Flawers**, florería real ubicada en Lima, Perú. Proyecto en desarrollo activo — los cambios afectan a un negocio real.

> **Estado:** Post-audit (Phases 1–5). Las convenciones de este archivo son **vinculantes** y la mayoría están **automatizadas** vía ESLint custom rules. Antes de proponer una excepción, leé `QA/audit/` para entender el porqué.

---

## Tech Stack

- **Next.js 16** con App Router (Server Components por defecto)
- **React 19**
- **TypeScript 5** strict — sin `any` (regla ESLint)
- **Tailwind CSS v4** — configuración 100% en CSS via `globals.css`. Sin `tailwind.config.*` (un script `prebuild` lo bloquea)
- **Framer Motion 12** — siempre `LazyMotion + m`, nunca `motion` raw (regla ESLint)
- **@dnd-kit/react** + **@dnd-kit/helpers** — drag & drop
- **lucide-react** — íconos (no SVG inline para íconos comunes)
- **Radix UI primitives** (Dialog, AlertDialog, Sheet, Switch, Label) — base de los componentes shared
- **zod** — validación de Server Actions
- **Supabase** — Auth + DB (SSR)
- **Cloudinary** — CDN de imágenes (`res.cloudinary.com/dbjm18dqg`)
- **Playwright** — E2E
- **Vercel Analytics** + **Speed Insights**
- **next/font/google** (Playfair Display + Lato)

---

## Comandos

```bash
npm run dev          # Dev server en http://localhost:3000
npm run build        # Build de producción
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run lint:strict  # eslint . --max-warnings 0
npx tsc --noEmit     # Type-check (no emite archivos)
npx playwright test  # Tests e2e
npx playwright test phase1-verify  # Regression baseline (DEBE estar verde siempre)
npm run db:types     # Regenerar tipos de Supabase (requiere SUPABASE_ACCESS_TOKEN)
```

---

## Calidad de código

### ESLint 9 (flat config en `eslint.config.mjs`)

14 reglas custom blindan las CRITICAL del proyecto. **Si tu cambio rompe alguna, no la silencies — corregila o pedí excepción explícita.**

| # | Regla | Nivel | Propósito |
|---|-------|-------|-----------|
| 1 | `@next/next/no-img-element` | error | Prohíbe `<img>` nativo — siempre `next/image` |
| 2 | `@typescript-eslint/no-explicit-any` | error | Prohíbe `any` — usar `unknown` con narrowing |
| 3 | `@typescript-eslint/no-floating-promises` | error | Toda promise debe await/then/catch |
| 4 | `@typescript-eslint/no-misused-promises` | error | No pasar async a handlers que esperan void |
| 5 | `no-restricted-imports` (`framer-motion#motion`) | error | Forzar `m` con `LazyMotion` |
| 6 | `no-restricted-syntax` (hex en `style={{}}`) | error | Solo `var(--color-*)` |
| 7 | `no-restricted-syntax` (hex en clases Tailwind arbitrarias) | error | Sin `text-[#fff]` ni equivalentes |
| 8 | `no-restricted-syntax` (`rgb`/`rgba` en JSX style) | error | Solo CSS vars o `color-mix` |
| 9 | `no-restricted-syntax` (literales `51990051041`) | error | Forzar `BUSINESS.phone` |
| 10 | `no-restricted-syntax` (`wa.me/<digit>`) | error | Forzar `BUSINESS.whatsapp(WithMessage)` |
| 11 | `no-restricted-syntax` (`kataleyaflawers12`) | error | Forzar `BUSINESS.instagram` |
| 12 | `no-restricted-syntax` (z-index libre en className) | error | Solo `z-50`, `z-[90]`, `z-[100]` |
| 13 | `react/jsx-key` | error | Cada item de lista con key |
| 14 | `no-console` | warn | `console.warn`/`console.error` permitidos, `log` no |

Plus `simple-import-sort` (warn — TODO: subir a error después de un pass global).

**Override:** `src/lib/constants.ts` ignora `no-restricted-syntax` (es la fuente de verdad — ahí SÍ pueden vivir los literales).

### Pre-commit (husky + lint-staged)

- `lint-staged` corre `eslint --max-warnings 0` sobre archivos staged
- **NO** usar `--no-verify` salvo emergencia documentada con el dueño
- **NUNCA** agregar `Co-Authored-By` ni metadata de autor a commits

### Guardas de build

- `scripts/check-no-tailwind-config.mjs` corre vía `prebuild` y rechaza la presencia de `tailwind.config.*` (Tailwind v4 es CSS-only)

### Baseline

`QA/eslint-baseline.txt` documenta errores pre-existentes (debería estar vacío o casi).

---

## Arquitectura del proyecto

**Feature Folders Architecture** — cada dominio agrupa componentes, hooks, queries, actions, schemas y types.

```
src/
├── app/
│   ├── layout.tsx                          # Root: metadata, fonts, JSON-LD Florist, skip link
│   ├── globals.css                         # Tailwind v4 + CSS custom properties + tokens
│   ├── sitemap.ts                          # File-based metadata API (rutas + categorías + productos)
│   ├── robots.ts                           # Disallow /admin, /api, /login
│   ├── manifest.ts                         # PWA manifest con paleta de marca
│   ├── opengraph-image.tsx                 # OG image 1200×630 dinámica
│   ├── (public)/                           # Route group público
│   │   ├── page.tsx                        # Landing
│   │   └── catalogo/
│   │       ├── page.tsx
│   │       ├── [categoria]/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   ├── (admin)/                            # Route group admin (auth required)
│   │   └── admin/{page,productos,categorias}
│   ├── (auth)/login/page.tsx
│   └── api/
│       ├── cloudinary/sign/route.ts        # Firma uploads — auth + folder allowlist
│       └── admin/{flower-type-usage,product-color-usage}/route.ts
├── components/
│   ├── shared/                             # Globales (Navbar, Footer, WhatsAppFloat, BusinessHoursBadge)
│   └── ui/                                 # Design system + primitives Radix
│       ├── Button.tsx, Input.tsx, Breadcrumb.tsx, FormField.tsx, ...
│       ├── LightboxDialog.tsx              # Galerías de imágenes (Radix Dialog)
│       ├── ConfirmDialog.tsx               # variants: default | destructive
│       ├── JsonLd.tsx                      # Inyecta schema.org tipado
│       └── primitives/                     # shadcn-generated (alert-dialog, sheet, ...)
├── features/
│   ├── landing/components/                 # HeroSection/, AboutSection, ContactSection, ...
│   ├── catalog/{components,hooks,queries,actions,utils,types}
│   ├── admin/
│   │   ├── components/                     # ProductForm/, CategoryList/, ProductTable/, DndLiveRegion
│   │   ├── hooks/, queries/
│   │   ├── actions/                        # CRUD — TODOS via requireAdmin + zod + Result<T>
│   │   ├── schemas/                        # zod schemas (product, category, color, flowerType, reorder, common)
│   │   ├── utils/                          # auth.ts, slugify.ts, cloudinaryUrl.ts
│   │   └── types/
│   └── analytics/                          # Tracking client-side
├── data/products.ts                        # LEGACY — no se usa en código activo
├── lib/
│   ├── constants.ts                        # BUSINESS — SINGLE SOURCE OF TRUTH
│   ├── navigation.ts                       # NAV_LINKS — fuente única (Navbar + Footer re-exportan)
│   └── supabase/{client,server,middleware,static,types}.ts
└── types/index.ts                          # Tipos globales compartidos
```

### File size discipline

- **Componentes UI: < 100 líneas.** Si supera, dividir en sub-componentes en una carpeta con `index.tsx` orquestador.
  Ejemplo del proyecto: `HeroSection/{index, HeroCarousel, HeroContent, HeroDots, HeroArrowButton, useHeroCarousel, ...}`.
- **Hooks:** pueden ser un poco más largos si son cohesivos. Documentar en JSDoc por qué.
- **One component per file** dentro de feature folders.

### Navegación

- Landing: anchors `#hero`, `#catalogo`, `#nosotros`, `#contacto`
- Catálogo: `/catalogo`, `/catalogo/[categoria]`, `/catalogo/[categoria]/[slug]`
- Admin: `/admin`, `/admin/productos`, `/admin/categorias` (auth requerida)
- Rutas dinámicas exportan `generateStaticParams`
- **Fuente única de links:** `src/lib/navigation.ts` (`NAV_LINKS`). `Footer.tsx` y `Navbar/constants.ts` re-exportan de ahí. **NO duplicar arrays.**

---

## Capa de datos

### Supabase

- Fuente principal — landing pública y admin CRUD leen/escriben de Supabase
- Tipos de dominio: `Product`, `Category` en `src/features/catalog/types/index.ts`
- Tipos de DB generados: `src/lib/supabase/types.ts` (regenerar con `npm run db:types`)
- `src/data/products.ts` es **legacy** — no se usa

**Categorías base (6):** Amor y Romance, Cumpleaños, Orquídeas Premium, Flores Amarillas, Corporativo y Eventos, Condolencias.

### Sistema de filtros

`/catalogo` tiene búsqueda y filtros client-side. Lógica en `src/features/catalog/utils/filterProducts.ts` (texto, categoría, precio S/30–S/800, colores, flores). Sin filtros activos → grid de categorías. Con filtros → productos filtrados.

### Constantes de negocio

`src/lib/constants.ts` exporta `BUSINESS` con: nombre, teléfono, WhatsApp URLs, Instagram, horarios, ubicación, años de experiencia, pedidos mensuales, website.
**Siempre importar desde ahí** — la regla ESLint bloquea hardcoding del teléfono, URL `wa.me/...` y handle de Instagram.

---

## Server Actions (admin) — patrón obligatorio

Toda action en `src/features/admin/actions/` **debe**:

1. Estar envuelta con `requireAdmin()` o `withAdminAuth()` de `src/features/admin/utils/auth.ts`
2. Validar input con un schema zod de `src/features/admin/schemas/`
3. Devolver `Result<T>` discriminado:
   ```ts
   type Result<T> =
     | { ok: true; data: T }
     | { ok: false; error: { code: string; message: string; issues?: ZodIssue[] } };
   ```
4. URLs de imagen DEBEN pasar por `isAllowedCloudinaryUrl` (`src/features/admin/utils/cloudinaryUrl.ts`) o por el schema zod `cloudinaryUrl` de `schemas/common.ts`
5. Llamar `revalidatePath` consistente:
   - **Productos:** `/`, `/catalogo`, `/catalogo/{categoria.slug}`, `/catalogo/{categoria.slug}/{slug}`, `/admin/productos`
   - **Categorías:** `/`, `/catalogo`, `/catalogo/{slug}` (por cada slug afectado), `/admin/categorias`

> ⚠️ **TODO:** el rol admin específico aún no está en DB. Hoy `requireAdmin` solo verifica sesión válida. Cuando se agregue, NO cambiar el contrato de `Result<T>` ni la firma de las actions.

### Slugs en CRUD admin

Al editar entidades con slug (categorías, productos):
- **Preservá el slug original** — no regenerar al cambiar el `name`
- Botón "Regenerar slug" explícito (opt-in)
- Server-side: si payload trae el mismo slug → no regenerar; si trae uno distinto → aceptarlo

Implementación: `useProductForm.autoSlug` flag, `CategoryForm` con `readOnly` + botón.

---

## API routes

Endpoints como `/api/cloudinary/sign` deben:

- `auth.getUser()` al inicio (sesión válida → continuar; sino 401)
- Validar folder con `isAllowedFolder` (allowlist: `productos`, `categorias`)
- Firmar `allowed_formats` y `max_file_size` **server-side** (no confiar en el cliente)
- Logging sin secretos

---

## Identidad visual — RESPETAR ESTRICTAMENTE

La paleta de colores es fija. **No proponer variaciones ni reemplazos sin aprobación explícita.**

```css
/* Core palette */
--color-primary: #c0392b;   /* Rojo — títulos principales */
--color-secondary: #e8b84b; /* Dorado — acentos */
--color-accent: #2d5a1b;    /* Verde — highlights */
--color-cream: #fdfcfa;     /* Crema — fondo general */
--color-dark: #1a1a1a;      /* Oscuro — texto */

/* Extended palette (definidas en globals.css) */
--color-white: #ffffff;
--color-whatsapp: #25d366;  /* SOLO para elementos WhatsApp */
--color-muted, --color-surface, --color-border  /* color-mix derivados */
--bg-about                  /* fondo AboutSection */
--z-hero-overlay: 10        /* token para stacking interno del Hero */
```

### Fonts

`next/font/google` (Playfair Display + Lato) cargadas en `app/layout.tsx`, expuestas como `--font-heading` y `--font-body`. **NUNCA** `@import url(...)` Google Fonts en CSS — render-blocking, regla del proyecto.

---

## Estilos

- **className:** Tailwind v4 con arbitrary values y CSS vars: `bg-(--color-surface)`, `text-(--color-primary)`, `border-(--color-border)`. **NO** `bg-[#fff]`, **NO** `style={{ backgroundColor: '#fff' }}`.
- **`style={{}}` con valores dinámicos** (de DB): permitido (ej. `backgroundColor: colorDef.hex` para chips de color).
- **Hex hardcodeado:** la regla ESLint `no-restricted-syntax` los bloquea (en `style` y en clases Tailwind arbitrarias).
- **`rgb`/`rgba`:** prohibidos en JSX `style`. Usar `var(--color-*)` o `color-mix(in srgb, ...)`.

### Tailwind v4

- Estilos en `globals.css` como CSS custom properties — sin `tailwind.config`
- El script `scripts/check-no-tailwind-config.mjs` (prebuild) bloquea la presencia de cualquier `tailwind.config.*`

---

## Reglas de desarrollo

### Next.js 16

- `params` y `searchParams` en Server Components son **async** — siempre tipar como `Promise<{...}>` y `await`
- Imágenes con `next/image`, **nunca** `<img>` (regla ESLint)
- Rutas dinámicas exportan `generateStaticParams` para static generation
- `viewport` se exporta separado de `metadata` (Next 16): `export const viewport: Viewport = { themeColor, ... }`

### Componentes

- Server Components por defecto — `'use client'` solo cuando hay hooks o eventos del browser
- Alias `@/*` para imports
- Imports tipo agrupados: `import type { ... }` (consistente con `simple-import-sort`)

### HeroSection — CAMPAIGN_MODE

Toggle `CAMPAIGN_MODE: 'contact' | 'catalog'` al tope del `index.tsx` cambia el CTA principal. Entender el mecanismo antes de modificar el hero.

### Framer Motion

**Siempre** `LazyMotion + m`:
```tsx
import { LazyMotion, domAnimation, m } from 'framer-motion';

<LazyMotion features={domAnimation}>
  <m.div animate={...} />
</LazyMotion>
```
**Nunca** `import { motion } from 'framer-motion'` — la regla ESLint lo bloquea.

Excepciones standalone (NO requieren `LazyMotion`): `useMotionValue`, `animate`, `useInView`.

---

## Z-index whitelist (regla ESLint)

Solo permitidos en `className`:

| Token | Componente |
|-------|------------|
| `z-50` | `WhatsAppFloat` |
| `z-[90]` | `Navbar` |
| `z-[100]` | `LightboxDialog` |

**Excepciones documentadas:**
- **Skip link** en `app/layout.tsx` usa `style={{ zIndex: 200 }}` (inline para evitar el matcher de la regla)
- **HeroSection** internal stacking usa `style={{ zIndex: 'var(--z-hero-overlay)' }}` con el token `--z-hero-overlay: 10` definido en `globals.css`

Cualquier otro z-index requiere justificación + approval explícito.

---

## Iconos

`lucide-react` para íconos comunes (X, ChevronLeft, ChevronRight, Search, Menu, Trash2, Edit, Plus, AlertTriangle, etc.). **No SVG inline** para íconos repetidos — extraer a un componente o usar `lucide-react`.

---

## A11y patterns

- **Skip link** en root layout apunta a `id="main-content"` en `<main>`
- **Forms:** `aria-required`, `aria-invalid`, `aria-describedby` apuntando a `<FieldError />` con `role="alert"` (ver `ProductForm`, `CategoryForm`)
- **Drag & drop:** sensores explícitos de `@dnd-kit` (Pointer + Keyboard + Touch) + announcements en español via `<DndLiveRegion>` (`src/features/admin/components/DndLiveRegion.tsx`)
- **Modales:** Radix Dialog/AlertDialog (`LightboxDialog`, `ConfirmDialog`) — focus trap + restore focus + ESC + scroll lock automáticos
- **Búsquedas con autocomplete:** `role="combobox"` + `aria-autocomplete="list"` + items con `role="option"`
- **`<nav>` con `aria-label`** descriptivo

---

## Shared UI primitives — `src/components/ui/`

| Componente | Cuándo usar |
|------------|-------------|
| `LightboxDialog` | Galerías de imágenes con keyboard nav |
| `ConfirmDialog` | Confirmaciones — variants `default` / `destructive` |
| `JsonLd` | Inyectar schema.org tipado |
| `Button`, `Input`, `Breadcrumb`, `FormField`, `EmptyState`, `FilterChip`, `PillToggle`, `ToggleSwitch`, `SectionHeader` | Design system base |

**NO crear modales custom desde cero. NO crear `ConfirmDialog` ad-hoc** cuando el shared ya existe.

---

## Metadata por página + SEO

### `generateMetadata`

Cada página relevante exporta `generateMetadata` con: `title`, `description`, `alternates.canonical`, `openGraph` (incluyendo `images`), `twitter`.

⚠️ **NUNCA** concatenar `BUSINESS.name` en el `title` de páginas hijas. El root template `'%s | Kataleya Flawers'` ya lo agrega — concatenar produce `"X | Kataleya Flawers | Kataleya Flawers"`.

### JSON-LD

Inyectar via `<JsonLd data={...} />` (`src/components/ui/JsonLd.tsx`), **no** como `<script>` raw.

Tipos usados:
- `Florist` (root layout)
- `Product` o `AggregateOffer` (detalle de producto)
- `BreadcrumbList` (catálogo, categoría, detalle)
- `ItemList` (catálogo, categoría)

### File-Based Metadata API

Vive en `src/app/`:
- `sitemap.ts` — rutas estáticas + categorías + productos (lee de Supabase via `getSitemapProducts`)
- `robots.ts` — disallow `/admin`, `/api`, `/login`
- `manifest.ts` — paleta de marca
- `opengraph-image.tsx` — 1200×630 con branding

**NO mover esto a metadata estática del layout.** El runtime de Next descubre estos archivos por convención.

---

## Tests Playwright

- Tests en `tests/`, helpers en `tests/helpers/`
- **`tests/phase1-verify.spec.ts` es la regression baseline** — debe seguir verde para CUALQUIER cambio
- Specs admin leen credenciales de `process.env.E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — **NUNCA** hardcodear
- Si descubrís un bug real que no podés arreglar en el scope actual: marcá el spec como `test.fixme` con razón explícita en el título o comentario
- Coverage actual: smoke, catalog-flow, category-page, product-detail, auth-flow, seo-metadata, admin-auth, admin-products-crud, admin-categories-crud, dashboard-authenticated, catalog-filters, phase1-verify

---

## Security headers + CSP

`next.config.ts` define HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, `poweredByHeader: false`.

**CSP está en Report-Only.** TODO Fase 6: migrar a enforced con nonce, eliminar `unsafe-inline` / `unsafe-eval`.

---

## Imports

- `simple-import-sort` ordena automáticamente (warn por ahora, será error)
- Alias `@/*`
- Imports tipo agrupados: `import type { ... }`

---

## Commits

- **Conventional Commits** en inglés: `feat:`, `fix:`, `refactor:`, `perf:`, `chore:`, `docs:`, `test:`
- Mensajes cortos, en presente: `feat: add contact form validation`
- **NUNCA** agregar `Co-Authored-By` ni metadata de autor
- **Nunca commitear sin aprobación explícita del usuario.** Flujo: implementar → lint limpio → usuario prueba manualmente → usuario pide commitear → recién entonces se hace el commit
- **No** `--no-verify` salvo emergencia documentada con el dueño

---

## Lo que NO hacer

- ❌ Cambiar la paleta de colores sin aprobación explícita
- ❌ Agregar dependencias sin consultar primero
- ❌ Reemplazar Tailwind v4 por v3 ni agregar `tailwind.config.*` (el prebuild lo bloquea)
- ❌ Usar `<img>` nativo — siempre `next/image`
- ❌ Usar `any` — usar `unknown` con narrowing
- ❌ Hardcodear datos de contacto — siempre `BUSINESS` de `src/lib/constants.ts`
- ❌ Hardcodear colores hex/rgb en JSX/TSX o en clases Tailwind arbitrarias
- ❌ `import { motion } from 'framer-motion'` — usar `LazyMotion + m`
- ❌ Concatenar `BUSINESS.name` en `title` de páginas hijas (el template ya lo agrega)
- ❌ `<script>` raw para JSON-LD — usar `<JsonLd>`
- ❌ Crear modales custom — usar `LightboxDialog` o `ConfirmDialog`
- ❌ SVG inline para íconos comunes — usar `lucide-react`
- ❌ `@import url(...)` Google Fonts en CSS — usar `next/font/google`
- ❌ Duplicar `NAV_LINKS` — re-exportar de `src/lib/navigation.ts`
- ❌ Server Action sin `requireAdmin` + zod + `Result<T>` + `revalidatePath`
- ❌ Componentes UI > 100 líneas sin descomponer
- ❌ `console.log` (la regla ESLint warnea — usar `console.warn`/`error` si es necesario)
- ❌ z-index libre en `className` — solo `z-50`, `z-[90]`, `z-[100]`
- ❌ `--no-verify` o `Co-Authored-By` en commits
- ❌ Modificar `layout.tsx` sin entender que afecta toda la app

---

## Al iniciar una sesión

1. Llamar `mem_context` con `project: kataleya-flawers-web` para recuperar contexto previo
2. Leer los archivos antes de modificar — no asumir que el código es igual a sesiones anteriores
3. Ante cualquier duda sobre diseño o comportamiento, preguntar antes de implementar

## Al terminar una sesión

Llamar `mem_session_summary` con: qué se hizo, qué archivos se tocaron, qué decisiones se tomaron. **Esto NO es opcional.**
