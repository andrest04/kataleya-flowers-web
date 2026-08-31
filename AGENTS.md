# AGENTS.md

Landing + admin para **Kataleya Flowers**, florería real en Lima, Perú. Negocio en producción — los cambios son reales.

**Estado:** Post-audit (Phases 1–5). Las convenciones de este archivo son **vinculantes** y la mayoría están **automatizadas** vía ESLint custom rules (`eslint.config.mjs`). Antes de pedir una excepción, leé `QA/audit/`.

**Autoridad por tema — este archivo no repite ese contenido:**

| Tema | Fuente |
|---|---|
| Audiencia, marca, principios de producto | [`docs/product.md`](docs/product.md) |
| Sistema visual: color, tipografía, componentes, contraste | [`docs/design.md`](docs/design.md) |
| Todo lo demás (arquitectura, reglas, patrones) | este archivo |

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
npm run doctor       # react-doctor@latest — lint/a11y/bundle/arquitectura
```

Pre-commit (manual, no hay hooks): `npm run lint:strict` + `npx tsc --noEmit`.

---

## Antes de tocar código: skills y MCPs obligatorios

Invocar la skill **antes** de trabajar en el área — no improvisar a mano.

| Skill | Cuándo |
|---|---|
| `react-doctor` | Antes de commitear cualquier cambio en componentes React. Existe como `npm run doctor`, pero la skill corre el triage completo. |
| `better-accessibility` | Forms, modales, drag & drop, navegación por teclado, cualquier `aria-*`. |
| `better-colors` | Cualquier cambio de color. La paleta es fija → casi siempre es verificar contraste, no proponer colores. |
| `better-layout` | Maquetar o reordenar secciones/páginas nuevas. |
| `better-typography` | Tipografía, escalas de texto, line-height. |
| `better-ui` | Polish: animaciones Framer Motion, hover states, sombras, íconos lucide-react. |
| `better-writing` | Copy visible al usuario (botones, errores, empty states) — **tuteo, nunca voseo**. |
| `appwrite-cli` / `appwrite-typescript` | Cualquier tarea de backend: repos, auth, storage, Teams (`admins`), functions. |
| `code-review` | Antes de pedir aprobación de commit en cambios no triviales. |
| `security-review` | Cambios a Server Actions, API routes, o Libro de Reclamaciones (datos de terceros). |

| MCP | Cuándo |
|---|---|
| `appwrite` | Único backend real (DB, Auth, Storage, Teams). Correr `appwrite_get_context` antes de cualquier operación server-side/repos — no adivinar el estado del proyecto. |
| `codegraph` (`codegraph_explore`) | Antes de leer archivos a mano para entender arquitectura, call flow o impacto. **No** usar Read/Glob/Grep como primer paso en preguntas estructurales. |
| `context7` (`resolve-library-id` → `query-docs`) | Cualquier duda de comportamiento de una librería, framework, SDK o CLI (Playwright, Next, `node-appwrite`, @dnd-kit, zod…). Consultar la doc **antes** de formular una hipótesis, no después de que fallen dos — vale incluso cuando creés saber la respuesta. Preferirlo a WebSearch para documentación; WebSearch queda para lo que no es doc de librería (investigación de negocio, UX, referencias visuales). |

> **Mantenimiento:** `npx skills add appwrite/skills` instala las 11 skills de SDK de Appwrite. Solo `appwrite-typescript` y `appwrite-cli` aplican aquí — borrar las otras nueve (dart, dotnet, go, kotlin, php, python, ruby, rust, swift) del directorio real `.agents/skills/` **y** de los symlinks en `.claude/skills/`. Ambos árboles están gitignoreados.

---

## Reglas vinculantes (ESLint-enforced)

No las silencies: corregí la causa raíz o pedí excepción.

| Regla | Detalle |
|---|---|
| **Nunca `eslint-disable` en `src/`** | Ni inline ni de archivo. Todo warning/error se soluciona en la causa raíz. En `tests/` se acepta con razón en la misma línea (ver `correlativo-concurrency.spec.ts`). |
| **`next/image` siempre** | `<img>` nativo prohibido. |
| **Sin `any`** | Usar `unknown` con narrowing. |
| **Promises** | Toda promise `await`/`then`/`catch`. No pasar async a handlers `void`. |
| **Framer Motion** | Siempre `LazyMotion + m`, **nunca** `import { motion }`. Standalone sin `LazyMotion` OK: `useMotionValue`, `animate`, `useInView`. |
| **Colores** | Nada de hex/`rgb`/`rgba` hardcodeado en `style={{}}` ni en clases arbitrarias (`text-[#fff]`). Solo `var(--color-*)` o `color-mix(in srgb, …)`. *Excepción:* valores dinámicos de DB en `style` (ej. `backgroundColor: colorDef.hex`). |
| **Datos de negocio** | Nunca hardcodear teléfono / `wa.me/…` / handle Instagram — importar de `BUSINESS`. `src/lib/constants.ts` es el único archivo exento de `no-restricted-syntax`. |
| **z-index en className** | Solo `z-50` (WhatsAppFloat), `z-[90]` (Navbar), `z-[100]` (LightboxDialog). Excepciones inline documentadas: skip link `zIndex: 200`, Hero `var(--z-hero-overlay)` (=10). |
| **Varias** | `react/jsx-key` en listas · `no-console` (warn — `warn`/`error` OK, `log` no) · `simple-import-sort` (warn, será error). |

## Reglas vinculantes (no auto-enforced)

| Regla | Detalle |
|---|---|
| **Cero comentarios en producción** | Sin `//`, `/* */` ni JSDoc — el código se explica por nombres. *Excepciones:* `tests/` y `*.spec.ts` sí pueden tener comentarios; las directivas funcionales (`eslint-disable`, `@ts-expect-error`) no cuentan como comentario y **no se borran**. |
| **Una responsabilidad por componente UI** | Superar ~100 líneas es *trigger de revisión*, no infracción: parar y evaluar. Si sigue siendo UNA responsabilidad (markup denso, variantes del mismo concepto) se queda; si acumuló responsabilidades, dividir en carpeta con `index.tsx` orquestador (ej. `HeroSection/`). One component per file. |
| **No modales custom** | Usar `LightboxDialog` / `ConfirmDialog`. |
| **No SVG inline** para íconos comunes | Usar `lucide-react`. |
| **No `@import url(...)` Google Fonts** en CSS | Render-blocking — usar `next/font/google`. |
| **No duplicar `NAV_LINKS`** | Re-exportar de `src/lib/navigation.ts`. |
| **Requieren aprobación explícita** | Tocar la paleta · agregar dependencias · modificar `app/layout.tsx` (afecta toda la app). |

## Fuentes únicas de verdad

| Qué | Dónde |
|---|---|
| `BUSINESS` — teléfono, WhatsApp, Instagram, horarios, ubicación, website | `src/lib/constants.ts` |
| `NAV_LINKS` — Navbar/constants.ts y Footer re-exportan | `src/lib/navigation.ts` |
| Tokens de color y fuentes (definición CSS) | `globals.css` |
| **Cuándo usar cada color, contraste, componentes** | [`docs/design.md`](docs/design.md) — autoridad única |

**Paleta: fija, no se toca sin aprobación.** Tokens: `--color-primary` · `--color-secondary` · `--color-accent` · `--color-cream` · `--color-dark` · `--color-whatsapp`, más derivados `color-mix` (`--color-muted/-surface/-border`) y los tokens de contraste (`--color-gold-text`, `--color-gold-text-dark`). Fonts expuestas como `--font-heading` / `--font-body`.

⚠️ **No memorices los hex desde acá — leé `docs/design.md`.** Varios tokens tienen restricciones de accesibilidad (el dorado falla AA como texto sobre fondos claros) que solo están documentadas ahí.

---

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

---

## Server Actions (admin) — patrón obligatorio

Toda action en `features/admin/actions/` **debe**:

1. **Envolverse con `requireAdmin()` / `withAdminAuth()`** (`utils/auth.ts`). Verifican sesión Appwrite (`account.get()`) **y** membresía en el Team `admins` (`isAdminUserAppwrite`, ver `adminMembership.appwrite.ts`); si no, tira `FORBIDDEN`.
   *Operacional:* el Team `admins` debe estar seedeado o todos los admins quedan bloqueados.
2. **Validar input** con schema zod de `schemas/`.
3. **Devolver `Result<T>` discriminado:**
   ```ts
   type Result<T> =
     | { ok: true; data: T }
     | { ok: false; error: { code: string; message: string; issues?: ZodIssue[] } };
   ```
4. **URLs de imagen** pasan por `imageStorage.isOwnedUrl` (`@/lib/imageStorage`) o el schema `storedImageUrl` de `schemas/common.ts`.
5. **`revalidatePath`:**
   - *Productos:* `/`, `/catalogo`, `/catalogo/{cat.slug}`, `/catalogo/{cat.slug}/{slug}`, `/admin/categorias`.
   - *Categorías:* `/`, `/catalogo`, `/catalogo/{slug}` (cada slug afectado), `/admin/categorias`.

**No cambiar el contrato `Result<T>` ni la firma al evolucionar autorización.**

**Slugs en edición:** preservar el original (no regenerar al cambiar `name`); regenerar solo opt-in (botón explícito). Server: mismo slug → no regenera; distinto → acepta. Impl: `useProductForm.autoSlug`, `CategoryForm` `readOnly` + botón.

**API routes** (`/api/images/upload`): `auth.getUser()` o 401 · validar folder con `isAllowedImageFolder` (allowlist `productos`, `categorias`) · validar tipo/tamaño server-side, subir vía `imageStorage.upload` · logs sin secretos.

## Libro de Reclamaciones

- Ruta pública `/libro-de-reclamaciones`; panel autenticado `/admin/reclamos` y `/admin/reclamos/[id]`. El dominio vive en `features/complaints/`.
- Al registrar una hoja se envía por Resend una copia al consumidor y una notificación al negocio.
- Plazo operativo: 15 días hábiles. El cálculo excluye sábados y domingos, pero **no** feriados peruanos — no presentarlo como cómputo legal exacto sin revisar ese límite.
- No alterar los datos de la hoja ni las plantillas de email sin **preservar el escape HTML de toda entrada pública**.

## Convenciones Next 16 + estilos

- `params`/`searchParams` son **async** → tipar `Promise<{…}>` y `await`.
- `viewport` se exporta aparte de `metadata`: `export const viewport: Viewport = {…}`.
- RSC por defecto; `'use client'` solo con hooks/eventos browser. Alias `@/*`. `import type {…}` agrupados.
- className: arbitrary values + CSS vars → `bg-(--color-surface)`, `text-(--color-primary)`, `border-(--color-border)`.
- **HeroSection `CAMPAIGN_MODE: 'contact' | 'catalog'`** (tope de `index.tsx`) cambia el CTA principal — entender antes de tocar el hero.

## SEO / metadata

- Cada página relevante exporta `generateMetadata` (`title`, `description`, `alternates.canonical`, `openGraph.images`, `twitter`).
- ⚠️ **Nunca concatenar `BUSINESS.name` en `title` de páginas hijas** — el root template `'%s | Kataleya Flowers'` ya lo agrega (evita duplicado).
- JSON-LD solo vía `<JsonLd data={…} />` (no `<script>` raw). Tipos: `Florist` (root), `Product`/`AggregateOffer` (detalle), `BreadcrumbList`, `ItemList`.
- File-based metadata API vive en `src/app/` (`sitemap/robots/manifest/opengraph-image`) — **no** mover a metadata estática del layout.

## A11y + shared primitives

- Skip link → `id="main-content"`. Forms: `aria-required/-invalid/-describedby` → `<FieldError role="alert">`. `<nav aria-label>`.
- Drag & drop @dnd-kit: sensores Pointer+Keyboard+Touch + `<DndLiveRegion>` (announcements ES). Modales Radix (focus trap/restore/ESC/scroll-lock automáticos). Autocomplete: `role="combobox"` + `aria-autocomplete="list"` + `role="option"`.
- `ui/` disponibles: `LightboxDialog`, `ConfirmDialog` (`default`/`destructive`), `JsonLd`, `Button`, `Input`, `Breadcrumb`, `FormField`, `EmptyState`, `FilterChip`, `PillToggle`, `ToggleSwitch`, `SectionHeader`.

## Tests / seguridad

- Tests en `tests/` (+ `helpers/`). **`phase1-verify.spec.ts` = regression baseline, siempre verde.**
- Specs admin leen `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` del env — nunca hardcodear. Bug fuera de scope → `test.fixme` con razón.
- `next.config.ts`: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, `poweredByHeader: false`. **CSP en Report-Only** (TODO Fase 6: enforced con nonce).

---

## Commits

Conventional Commits en inglés, cortos, presente (`feat: add contact form validation`). **Nunca** `Co-Authored-By` ni metadata de autor.

**Nunca commitear sin aprobación explícita.** Flujo: implementar → lint limpio → usuario prueba → usuario pide commit.

## Sesión (engram)

- **Iniciar:** `mem_context` (`project: kataleya-flowers-web`) + leer archivos antes de modificar.
- **Cerrar:** `mem_session_summary` (qué se hizo, archivos, decisiones) — no opcional.

> El directorio local sigue llamándose `kataleya-flawers-web` (typo histórico), pero engram resuelve el proyecto desde el git remote como **`kataleya-flowers-web`**. Usar siempre el nombre con `o`.
