# CLAUDE.md

Landing + admin para **Kataleya Flawers**, florería real en Lima, Perú. Negocio en producción — los cambios son reales.

**Estado:** Post-audit (Phases 1–5). Las convenciones de este archivo son **vinculantes** y la mayoría están **automatizadas** vía ESLint custom rules (`eslint.config.mjs`). Antes de pedir una excepción, leé `QA/audit/`.

**Docs relacionados:** ante dudas de audiencia, marca o principios de producto, leé [`docs/product.md`](docs/product.md); ante dudas de sistema visual (color, tipografía, componentes, contraste), leé [`docs/design.md`](docs/design.md). Este archivo no repite ese contenido.

## Stack

Next.js 16 (App Router, RSC por defecto) · React 19 · TS 5 strict · Tailwind v4 (CSS-only, sin `tailwind.config.*`) · Framer Motion 12 · @dnd-kit · lucide-react · Radix primitives · zod · Appwrite (Auth + DB + Storage, único backend) · Resend (emails transaccionales) · Playwright · next/font/google (Crimson Text + Mulish).

## Comandos

```bash
npm run dev          # localhost:3000
npm run build        # prod build
npm run lint:strict  # eslint . --max-warnings 0
npx tsc --noEmit     # type-check
npm run test:e2e     # e2e
npx playwright test phase1-verify  # regression baseline (DEBE estar verde siempre)
npm run doctor        # react-doctor@latest — lint/a11y/bundle/arquitectura
```

Pre-commit (manual, no hay hooks): `npm run lint:strict` + `npx tsc --noEmit`.

## Reglas vinculantes (ESLint-enforced — no las silencies, corregilas o pedí excepción)

- **Nunca `eslint-disable`** (ni inline ni de archivo) — todo warning/error de ESLint se soluciona en la causa raíz, nunca se apaga.

- **`next/image` siempre** — `<img>` nativo prohibido.
- **Sin `any`** — usar `unknown` con narrowing.
- **Promises:** toda promise await/then/catch; no pasar async a handlers `void`.
- **Framer Motion:** siempre `LazyMotion + m`, **nunca** `import { motion }`. Standalone OK sin `LazyMotion`: `useMotionValue`, `animate`, `useInView`.
- **Colores:** nada de hex/`rgb`/`rgba` hardcodeado en `style={{}}` ni en clases Tailwind arbitrarias (`text-[#fff]`). Solo `var(--color-*)` o `color-mix(in srgb, …)`. Excepción: valores dinámicos de DB en `style` (ej. `backgroundColor: colorDef.hex`).
- **Datos de negocio:** nunca hardcodear teléfono / `wa.me/…` / handle Instagram — importar de `BUSINESS` (`src/lib/constants.ts`, único archivo exento de `no-restricted-syntax`).
- **z-index en className:** solo `z-50` (WhatsAppFloat), `z-[90]` (Navbar), `z-[100]` (LightboxDialog). Excepciones inline documentadas: skip link `zIndex: 200`, Hero `var(--z-hero-overlay)` (=10).
- `react/jsx-key` en listas. `no-console` (warn — `warn`/`error` OK, `log` no). `simple-import-sort` (warn, será error).

**Otras reglas no auto-enforced pero obligatorias:**
- **Cero comentarios en código de producción** (`//`, `/* */`, JSDoc) — el código tiene que ser autoexplicativo por nombres. Excepción: tests (`tests/`, `*.spec.ts`) sí pueden tenerlos, y directivas funcionales (`eslint-disable`, `@ts-expect-error`) nunca se cuentan como comentario y no se borran.
- **Componentes UI: una responsabilidad por componente.** Superar ~100 líneas es *trigger de revisión*, no infracción: detente y evalúa si sigue siendo UNA responsabilidad. Si lo es (markup denso, variantes del mismo concepto), se queda; si acumuló responsabilidades, dividir en carpeta con `index.tsx` orquestador (ej. `HeroSection/`). One component per file.
- **No crear modales custom** — usar `LightboxDialog` / `ConfirmDialog`. **No SVG inline** para íconos comunes — usar `lucide-react`.
- **No `@import url(...)` Google Fonts** en CSS (render-blocking) — usar `next/font/google`.
- **No duplicar `NAV_LINKS`** — re-exportar de `src/lib/navigation.ts`.
- **No tocar la paleta** ni **agregar dependencias** sin aprobación explícita.
- **No modificar `app/layout.tsx`** sin entender que afecta toda la app.

## Fuentes únicas de verdad

- `src/lib/constants.ts` → `BUSINESS` (teléfono, WhatsApp, Instagram, horarios, ubicación, website…).
- `src/lib/navigation.ts` → `NAV_LINKS` (Navbar/constants.ts + Footer re-exportan).
- **Paleta (fija):** `--color-primary #c0392b` (rojo, títulos) · `--color-secondary #e8b84b` (dorado, acentos) · `--color-accent #2d5a1b` (verde, highlights) · `--color-cream #fdfcfa` (fondo) · `--color-dark #1a1a1a` (texto) · `--color-whatsapp #25d366` (solo WhatsApp). Derivados `color-mix`: `--color-muted/-surface/-border`. Definidas en `globals.css`; fonts expuestas como `--font-heading` / `--font-body`.

## Arquitectura — Feature Folders

Cada dominio agrupa `components/hooks/queries/actions/schemas/utils/types`.

```text
src/
├── app/                      # App Router
│   ├── layout.tsx            # metadata, fonts, JSON-LD Florist, skip link → #main-content
│   ├── globals.css           # Tailwind v4 + CSS custom properties
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx   # file-based metadata API
│   ├── (public)/             # landing (page.tsx), catálogo y libro-de-reclamaciones
│   ├── (admin)/admin/        # page · productos · categorias · reclamos (auth)
│   ├── (auth)/login/
│   └── api/images/upload · api/admin/*
├── components/
│   ├── shared/               # Navbar, Footer, WhatsAppFloat, BusinessHoursBadge
│   └── ui/                   # design system + primitives/ (shadcn/Radix)
├── features/
│   ├── landing/components/   # HeroSection/, AboutSection, ContactSection…
│   ├── catalog/              # incl. utils/filterProducts.ts
│   ├── admin/                # actions (requireAdmin+zod+Result), schemas, utils/{auth,slugify}
│   └── complaints/           # libro de reclamaciones: formulario, panel admin y emails
└── lib/{constants,navigation}.ts · lib/appwrite/* (config · repositories · auth/session) · lib/db/rows.ts (tipos de fila)
```

**Rutas:** landing usa anchors `#hero #catalogo #nosotros #contacto`. Catálogo `/catalogo/[categoria]/[slug]`. Rutas dinámicas exportan `generateStaticParams`.

**Datos:** Appwrite es la fuente (landing pública + admin CRUD), vía `lib/appwrite/repositories/*`. Tipos dominio `Product`/`Category` en `features/catalog/types`; los repos Appwrite reusan las formas de fila de `lib/db/rows.ts` (tipos nativos). Categorías base (6): Amor y Romance, Cumpleaños, Orquídeas Premium, Flores Amarillas, Corporativo y Eventos, Condolencias. Filtros client-side (texto, categoría, precio S/30–800, colores, flores) en `filterProducts.ts`.

## Server Actions (admin) — patrón obligatorio

Toda action en `features/admin/actions/` **debe**:

1. Envolverse con `requireAdmin()` / `withAdminAuth()` (`utils/auth.ts`) — verifican sesión Appwrite (`account.get()`) **y** membresía en el Team `admins` de Appwrite (`isAdminUserAppwrite`, ver `adminMembership.appwrite.ts`); si no, tira `FORBIDDEN`. *(Operacional: el Team `admins` debe estar seedeado o todos los admins quedan bloqueados.)*
2. Validar input con schema zod de `schemas/`.
3. Devolver `Result<T>` discriminado:
   ```ts
   type Result<T> =
     | { ok: true; data: T }
     | { ok: false; error: { code: string; message: string; issues?: ZodIssue[] } };
   ```
4. URLs de imagen pasan por `imageStorage.isOwnedUrl` (`@/lib/imageStorage`) o el schema `storedImageUrl` de `schemas/common.ts`.
5. `revalidatePath` — **Productos:** `/`, `/catalogo`, `/catalogo/{cat.slug}`, `/catalogo/{cat.slug}/{slug}`, `/admin/categorias`. **Categorías:** `/`, `/catalogo`, `/catalogo/{slug}` (cada slug afectado), `/admin/categorias`.

No cambiar el contrato `Result<T>` ni la firma al evolucionar autorización.

**Slugs en edición:** preservar el original (no regenerar al cambiar `name`); regenerar solo opt-in (botón explícito). Server: mismo slug → no regenera; distinto → acepta. Impl: `useProductForm.autoSlug`, `CategoryForm` `readOnly`+botón.

**API routes** (`/api/images/upload`): `auth.getUser()` o 401 · validar folder con `isAllowedImageFolder` (allowlist `productos`, `categorias`) · valida tipo/tamaño server-side, sube vía `imageStorage.upload` · logs sin secretos.

## Libro de Reclamaciones

- Ruta pública: `/libro-de-reclamaciones`; panel autenticado: `/admin/reclamos` y `/admin/reclamos/[id]`.
- El dominio vive en `features/complaints/`. Al registrar una hoja, se envía por Resend una copia al consumidor y una notificación al negocio.
- El plazo operativo es de 15 días hábiles. El cálculo excluye sábados y domingos, pero **no** feriados peruanos; no lo presentes como cómputo legal exacto sin revisar ese límite.
- No alterar los datos de la hoja ni las plantillas de email sin preservar el escape HTML de toda entrada pública.

## Convenciones Next 16 + estilos

- `params`/`searchParams` son **async** → tipar `Promise<{…}>` y `await`.
- `viewport` se exporta aparte de `metadata`: `export const viewport: Viewport = {…}`.
- RSC por defecto; `'use client'` solo con hooks/eventos browser. Alias `@/*`. `import type {…}` agrupados.
- className: arbitrary values + CSS vars: `bg-(--color-surface)`, `text-(--color-primary)`, `border-(--color-border)`.
- **HeroSection `CAMPAIGN_MODE: 'contact' | 'catalog'`** (tope de `index.tsx`) cambia el CTA principal — entender antes de tocar el hero.

## SEO / metadata

- Cada página relevante exporta `generateMetadata` (`title`, `description`, `alternates.canonical`, `openGraph.images`, `twitter`).
- ⚠️ **Nunca concatenar `BUSINESS.name` en `title` de páginas hijas** — el root template `'%s | Kataleya Flawers'` ya lo agrega (evita duplicado).
- JSON-LD solo via `<JsonLd data={…} />` (no `<script>` raw). Tipos: `Florist` (root), `Product`/`AggregateOffer` (detalle), `BreadcrumbList`, `ItemList`.
- File-based metadata API vive en `src/app/` (`sitemap/robots/manifest/opengraph-image`) — **no** mover a metadata estática del layout.

## A11y + shared primitives

- Skip link → `id="main-content"`. Forms: `aria-required/-invalid/-describedby` → `<FieldError role="alert">`. `<nav aria-label>`.
- Drag & drop @dnd-kit: sensores Pointer+Keyboard+Touch + `<DndLiveRegion>` (announcements ES). Modales Radix (focus trap/restore/ESC/scroll-lock auto). Autocomplete: `role="combobox"` + `aria-autocomplete="list"` + `role="option"`.
- `ui/`: `LightboxDialog`, `ConfirmDialog` (`default`/`destructive`), `JsonLd`, `Button`, `Input`, `Breadcrumb`, `FormField`, `EmptyState`, `FilterChip`, `PillToggle`, `ToggleSwitch`, `SectionHeader`.

## Tests / seguridad

- Tests en `tests/` (+ `helpers/`). **`phase1-verify.spec.ts` = regression baseline, siempre verde.** Specs admin leen `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` del env — nunca hardcodear. Bug fuera de scope → `test.fixme` con razón.
- `next.config.ts`: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, `poweredByHeader: false`. **CSP en Report-Only** (TODO Fase 6: enforced con nonce).

## Commits

Conventional Commits en inglés, cortos, presente (`feat: add contact form validation`). **Nunca** `Co-Authored-By` ni metadata de autor. **Nunca commitear sin aprobación explícita:** implementar → lint limpio → usuario prueba → usuario pide commit.

## Sesión (engram)

Iniciar: `mem_context` (`project: kataleya-flawers-web`) + leer archivos antes de modificar. Cerrar: `mem_session_summary` (qué se hizo, archivos, decisiones) — no opcional.
