# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Landing page para **Kataleya Flawers**, florería real ubicada en Lima, Perú. Proyecto en desarrollo activo — los cambios afectan a un negocio real.

---

## Tech Stack

- **Next.js 16.1.6** con App Router
- **React 19.2.3**
- **TypeScript 5** — tipos estrictos, sin `any`
- **Tailwind CSS v4** — configuración basada en CSS, sin `tailwind.config`
- **Framer Motion 12** — instalado, usando `LazyMotion` + `domAnimation` para reducir bundle size
- **@dnd-kit/react** + **@dnd-kit/helpers** — drag and drop para reordenamiento
- **react-icons 5** — librería de iconos
- **Playwright** para e2e testing
- **Vercel Analytics** y **Speed Insights** ya integrados
- **Cloudinary** — CDN para imágenes de productos (`res.cloudinary.com/dbjm18dqg`)

---

## Comandos

```bash
npm run dev          # Dev server en http://localhost:3000
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run lint:strict  # eslint . --max-warnings 0
npx playwright test  # Tests e2e
```

---

## Calidad de código

- **ESLint 9** — flat config en `eslint.config.mjs` sin eslint-config-next.
  Plugins: react, react-hooks, jsx-a11y, @next/eslint-plugin-next, typescript-eslint (strict + stylistic)
- **husky** + **lint-staged** — pre-commit hook corre ESLint con `--max-warnings 0` sobre archivos staged
- **Baseline**: `QA/eslint-baseline.txt` documenta errores pre-existentes

---

## Arquitectura del proyecto

Feature Folders Architecture — cada dominio agrupa sus componentes, hooks, queries y acciones.

```
src/
├── app/
│   ├── layout.tsx                          # Root layout — Navbar, Footer, Analytics
│   ├── page.tsx                            # Landing page — compone todas las secciones
│   ├── globals.css                         # Tailwind v4 + CSS custom properties
│   ├── (public)/                           # Route group público (sin layout propio)
│   │   ├── layout.tsx                      # Pass-through layout
│   │   └── catalogo/
│   │       ├── page.tsx                    # /catalogo — grid de categorías con búsqueda/filtros
│   │       ├── loading.tsx                 # Loading UI para /catalogo
│   │       ├── error.tsx                   # Error boundary para /catalogo
│   │       ├── [categoria]/
│   │       │   ├── page.tsx                # /catalogo/[categoria] — productos por categoría
│   │       │   └── [slug]/
│   │       │       └── page.tsx            # /catalogo/[categoria]/[slug] — detalle de producto
│   ├── (admin)/                            # Route group admin (requiere auth)
│   │   ├── layout.tsx                      # Admin layout con sidebar
│   │   └── admin/
│   │       ├── page.tsx                    # Dashboard admin
│   │       ├── productos/                  # CRUD productos
│   │       └── categorias/                 # CRUD categorías
│   └── (auth)/
│       └── login/
│           └── page.tsx                    # Login con Supabase Auth
├── components/
│   ├── shared/                             # Componentes globales reutilizables
│   │   ├── Navbar/                         # Módulo Navbar (5 archivos)
│   │   │   ├── index.tsx                   # Componente principal — fijo, scroll behavior
│   │   │   ├── DesktopSearch.tsx           # Búsqueda con autocomplete (desktop)
│   │   │   ├── MobileDrawer.tsx            # Drawer deslizable (mobile)
│   │   │   ├── useNavbar.ts                # Hook con lógica del Navbar
│   │   │   └── constants.ts               # primaryLinks, secondaryLinks, SearchResult
│   │   ├── Footer.tsx
│   │   ├── WhatsAppFloat.tsx               # Botón flotante WhatsApp (z-50)
│   │   └── BusinessHoursBadge.tsx          # Badge de horario de atención
│   └── ui/                                 # Design system — primitivos reutilizables
├── features/
│   ├── landing/
│   │   └── components/                     # Secciones de la landing page
│   │       ├── HeroSection.tsx             # Carousel con Framer Motion, CAMPAIGN_MODE toggle
│   │       ├── HeroButtons.tsx
│   │       ├── CatalogSection.tsx          # Vista previa del catálogo en landing
│   │       ├── AboutSection.tsx
│   │       ├── ContactSection.tsx
│   │       └── TestimonialsSection.tsx     # Grid polaroid (desktop) / carousel (mobile)
│   ├── catalog/
│   │   ├── components/                     # Componentes del catálogo
│   │   │   ├── BackButton.tsx
│   │   │   ├── CatalogSearch.tsx           # Búsqueda y filtros client-side (sidebar)
│   │   │   ├── ProductGallery.tsx          # Galería con lightbox modal (z-[100])
│   │   │   └── ProductGrid.tsx             # Grilla con ordenamiento
│   │   ├── hooks/                          # Hooks de catálogo (ej: useProductFilter)
│   │   ├── queries/                        # Server-side data fetching (Supabase)
│   │   ├── actions/                        # Server Actions
│   │   ├── types/
│   │   │   └── index.ts                    # Product, Category, PriceVariant + enums
│   │   └── utils/
│   │       └── filterProducts.ts           # Filtrado: texto, categoría, precio, colores, flores
│   └── admin/
│       ├── components/                     # Componentes del panel admin
│       │   ├── AdminSidebar.tsx
│       │   ├── ProductTable.tsx            # Tabla de productos con filtro por categoría
│       │   ├── ProductForm.tsx             # Formulario create/edit con arrays dinámicos
│       │   ├── CategoryList.tsx            # Lista con drag-and-drop reorder (@dnd-kit)
│       │   ├── CategoryForm.tsx            # Formulario create/edit de categorías
│       │   └── ImageUploader.tsx           # TODO: upload a Cloudinary
│       ├── hooks/                          # ej: useImageUpload (TODO)
│       ├── queries/                        # Queries Supabase para admin
│       │   ├── products.ts                 # getAdminProducts, getAdminProductById
│       │   └── categories.ts              # getAdminCategories, getAdminCategoryById
│       ├── actions/                        # Server Actions de admin (CRUD)
│       │   ├── products.ts                 # create, update, delete
│       │   └── categories.ts              # create, update, delete, reorderCategories
│       ├── utils/
│       │   └── slugify.ts                  # Slugify compartido entre actions y forms
│       └── types/
├── data/
│   └── products.ts                         # 6 categorías + productos (datos estáticos legacy)
├── lib/
│   ├── constants.ts                        # BUSINESS — datos de negocio
│   └── supabase/
│       ├── client.ts                       # Supabase browser client
│       ├── server.ts                       # Supabase server client (SSR)
│       └── types.ts                        # Tipos generados de la DB
└── types/
    └── index.ts                            # Tipos globales compartidos
```

### Navegación

- Landing page: anchors `#hero`, `#catalogo`, `#nosotros`, `#contacto`
- Catálogo: rutas `/catalogo`, `/catalogo/[categoria]`, `/catalogo/[categoria]/[slug]`
- Admin: rutas `/admin`, `/admin/productos`, `/admin/categorias` (requiere auth)
- Las rutas dinámicas usan `generateStaticParams` para static generation

### Capa de datos

**Supabase** es la fuente de datos principal. Las 3 páginas del catálogo público y todo el admin CRUD leen/escriben desde Supabase.
Los tipos `Product` y `Category` están en `src/features/catalog/types/index.ts`.
`src/data/products.ts` es legacy (datos estáticos) — no se usa en código activo.
Los tipos generados de la DB están en `src/lib/supabase/types.ts` (manual, ver comentario para regenerar).

**Categorías actuales (6):** Amor y Romance, Cumpleaños, Orquídeas Premium, Flores Amarillas, Corporativo y Eventos, Condolencias.

### Sistema de filtros

El catálogo `/catalogo` tiene búsqueda y filtros client-side implementados en `CatalogSearch.tsx`.
La lógica vive en `filterProducts.ts` — soporta: texto libre, categoría, rango de precio (S/30–S/800), colores y tipos de flor.
Sin filtros activos → se muestra el grid de categorías. Con filtros → se muestran los productos filtrados.

### Constantes de negocio

`src/lib/constants.ts` exporta `BUSINESS` con: nombre, teléfono, WhatsApp URL, Instagram, horarios, ubicación, años de experiencia, pedidos mensuales.
**Siempre importar de ahí** — nunca hardcodear datos de contacto en componentes.

---

## Identidad visual — RESPETAR ESTRICTAMENTE

La paleta de colores es fija. **No proponer variaciones ni reemplazos.**

```css
/* Core palette */
--color-primary: #c0392b;   /* Rojo — títulos principales */
--color-secondary: #e8b84b; /* Dorado — acentos y detalles */
--color-accent: #2d5a1b;    /* Verde — highlights */
--color-cream: #fdfcfa;     /* Crema — fondo general */
--color-dark: #1a1a1a;      /* Oscuro — texto */

/* Extended palette — definidas en globals.css, válidas para usar */
--color-white: #ffffff;     /* Blanco puro — fondos de tarjetas */
--color-whatsapp: #25d366;  /* Verde WhatsApp — SOLO para elementos WhatsApp */
--color-muted: color-mix(in srgb, var(--color-dark) 50%, transparent); /* Texto atenuado */
--color-surface: color-mix(in srgb, var(--color-dark) 6%, var(--color-cream));  /* Superficies sutiles */
--color-border: color-mix(in srgb, var(--color-dark) 12%, var(--color-cream));  /* Bordes */
--bg-about: color-mix(in srgb, var(--color-secondary) 10%, var(--color-cream)); /* Fondo AboutSection */
```

Tipografías: **Playfair Display** (serif, títulos) · **Lato** (sans-serif, cuerpo)

---

## Reglas de desarrollo

### Next.js 16

- `params` y `searchParams` en Server Components son **async** — siempre tipar como `Promise<{...}>` y usar `await`
- Imágenes con `next/image`, nunca `<img>` nativo
- Rutas dinámicas deben exportar `generateStaticParams` para static generation

### Componentes

- Server Components por defecto — `'use client'` solo cuando hay hooks o eventos del browser
- Nuevas secciones van en `src/components/sections/`
- Nuevos componentes de catálogo van en `src/components/catalog/`
- Usar alias `@/*` para imports

### Tailwind v4

- Estilos en `globals.css` como CSS custom properties — no en `tailwind.config`
- Usar variables CSS definidas (`--color-primary`, etc.), nunca colores hardcodeados

### HeroSection — CAMPAIGN_MODE

Hay un toggle `CAMPAIGN_MODE: 'contact' | 'catalog'` al tope del archivo que cambia el CTA principal. Antes de modificar el hero, entender este mecanismo.

### Framer Motion

Usar siempre `LazyMotion` + `domAnimation` en vez de importar `motion` directamente — reduce el bundle size significativamente.
Excepción: `useMotionValue`, `animate`, `useInView` son standalone y no necesitan `LazyMotion`.

### Z-index establecidos

- Navbar: `z-[90]`
- WhatsAppFloat: `z-50`
- Lightbox (ProductGallery): `z-[100]` — debe tapar tanto Navbar como WhatsAppFloat

---

## Commits

- Nunca agregar `Co-Authored-By` ni metadata de autor
- [Conventional Commits](https://www.conventionalcommits.org/) en inglés
- Mensajes cortos: `feat: add contact form validation`, `fix: resolve hydration error in Navbar`
- **Nunca commitear sin aprobación explícita del usuario.** El flujo es: implementar → lint limpio → el usuario prueba manualmente → el usuario pide commitear → recién entonces se hace el commit.

---

## Lo que NO hacer

- ❌ No cambiar la paleta de colores sin aprobación explícita
- ❌ No agregar dependencias sin consultarlo primero
- ❌ No reemplazar Tailwind v4 por v3 ni agregar `tailwind.config`
- ❌ No usar `<img>` nativo — siempre `next/image`
- ❌ No crear rutas API innecesarias para una landing page estática
- ❌ No modificar `layout.tsx` sin entender que afecta toda la app
- ❌ No usar `any` en TypeScript — usar `unknown` con narrowing si el tipo es incierto
- ❌ No hardcodear datos de contacto — siempre usar `BUSINESS` de `src/lib/constants.ts`
- ❌ No usar colores hardcodeados en JSX/TSX — siempre variables CSS

---

## Al iniciar una sesión

1. Llamar `mem_context` con `project: kataleya-flawers-web` para recuperar contexto previo
2. Leer los archivos antes de modificar — no asumir que el código es igual a sesiones anteriores
3. Ante cualquier duda sobre diseño o comportamiento, preguntar antes de implementar

## Al terminar una sesión

Llamar `mem_session_summary` con: qué se hizo, qué archivos se tocaron, qué decisiones se tomaron. **Esto NO es opcional.**
