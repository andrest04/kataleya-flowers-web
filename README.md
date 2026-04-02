# Kataleya Flawers

Sitio web oficial de Kataleya Flawers — florería con 32 años de experiencia en arreglos florales y orquídeas, ubicada en Lima, Perú.

## Stack tecnológico

- **Framework:** Next.js 16.1.6 con App Router y React Server Components
- **UI:** React 19.2.3 + TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS v4 configurado vía `globals.css` (sin `tailwind.config`)
- **Animaciones:** Framer Motion 12 con `LazyMotion` + `domAnimation`
- **Base de datos:** Supabase (PostgreSQL) — cliente SSR con `@supabase/ssr`
- **Auth:** Supabase Auth — guard en `proxy.ts` (Next.js 16)
- **Drag & Drop:** @dnd-kit/react — reordenamiento visual de categorías
- **Iconos:** react-icons 5
- **Tipografías:** Playfair Display (display/headings) + Lato (body) — vía Google Fonts
- **Imágenes:** Cloudinary CDN (`res.cloudinary.com/dbjm18dqg`)
- **Analytics:** Vercel Analytics + Speed Insights
- **Testing:** Playwright (instalado, sin tests implementados aún)
- **Deploy:** Vercel

## Paleta de colores

Variables definidas en `globals.css` — usar siempre variables, nunca valores hardcodeados:

| Variable            | Valor     | Uso                        |
| ------------------- | --------- | -------------------------- |
| `--color-primary`   | `#c0392b` | Rojo tulipán — títulos     |
| `--color-secondary` | `#e8b84b` | Amarillo dorado — acentos  |
| `--color-accent`    | `#2d5a1b` | Verde tallo — highlights   |
| `--color-cream`     | `#fdfcfa` | Fondo general              |
| `--color-dark`      | `#1a1a1a` | Texto                      |
| `--color-whatsapp`  | `#25d366` | Solo elementos WhatsApp    |

## Estructura del proyecto

```
src/
├── app/
│   ├── globals.css         # Variables CSS, @theme Tailwind v4, fuentes
│   ├── layout.tsx          # Root layout, metadatos, fuentes next/font
│   ├── page.tsx            # Composición de secciones (landing)
│   ├── (public)/
│   │   └── catalogo/
│   │       ├── page.tsx                    # /catalogo — grid + búsqueda/filtros
│   │       ├── [categoria]/page.tsx        # Productos por categoría
│   │       └── [categoria]/[slug]/page.tsx # Detalle de producto
│   ├── (admin)/
│   │   ├── layout.tsx                      # Admin layout con sidebar + auth check
│   │   └── admin/
│   │       ├── page.tsx                    # Dashboard (TODO)
│   │       ├── productos/                  # CRUD productos
│   │       │   ├── page.tsx                # Lista con ProductTable
│   │       │   ├── nuevo/page.tsx          # Crear producto
│   │       │   └── [id]/page.tsx           # Editar producto
│   │       └── categorias/                 # CRUD categorías
│   │           ├── page.tsx                # Lista con drag-and-drop reorder
│   │           ├── nueva/page.tsx          # Crear categoría
│   │           └── [id]/page.tsx           # Editar categoría
│   └── (auth)/
│       └── login/page.tsx                  # Login con Supabase Auth
├── components/
│   ├── shared/
│   │   ├── Navbar/             # Módulo Navbar (5 archivos)
│   │   ├── Footer.tsx
│   │   ├── WhatsAppFloat.tsx
│   │   └── BusinessHoursBadge.tsx
│   └── ui/                     # Design system — primitivos reutilizables
├── features/
│   ├── landing/
│   │   └── components/         # HeroSection, CatalogSection, AboutSection, etc.
│   ├── catalog/
│   │   ├── components/         # CatalogSearch, ProductGallery, ProductGrid, BackButton
│   │   ├── hooks/              # useProductFilter
│   │   ├── queries/            # Supabase queries (getProducts, getCategories, etc.)
│   │   ├── types/index.ts      # Product, Category, PriceVariant + enums
│   │   └── utils/              # filterProducts.ts
│   └── admin/
│       ├── components/         # ProductTable, ProductForm, CategoryList, CategoryForm
│       ├── queries/            # products.ts, categories.ts
│       ├── actions/            # CRUD server actions + reorderCategories
│       ├── utils/slugify.ts    # Shared slugify utility
│       └── types/              # ProductFormData, CategoryFormData
├── data/
│   └── products.ts             # Datos estáticos legacy (no se usa en código activo)
├── lib/
│   ├── constants.ts            # BUSINESS — datos de contacto y negocio
│   └── supabase/
│       ├── client.ts           # Browser client
│       ├── server.ts           # Server client (SSR)
│       ├── middleware.ts       # Client para proxy/middleware
│       └── types.ts            # Tipos generados de la DB
└── types/
    └── index.ts                # Tipos globales compartidos
```

## Estado actual

| Feature                | Estado      | Notas                                          |
| ---------------------- | ----------- | ---------------------------------------------- |
| Landing page           | ✅ Completa | Hero, Catálogo, Testimonios, About, Contacto   |
| Catálogo público       | ✅ Completa | Supabase, búsqueda + filtros, lightbox         |
| Auth (login/logout)    | ✅ Completa | Supabase Auth, proxy.ts guard                  |
| Admin — Productos CRUD | ✅ Completa | Crear, editar, eliminar, tabla con filtros      |
| Admin — Categorías CRUD| ✅ Completa | CRUD + drag-and-drop reorder con confirmación  |
| Admin — Dashboard      | ⚠️ TODO     | Stub — métricas y accesos rápidos              |
| Admin — Image Upload   | ⚠️ TODO     | Stub — integración con Cloudinary              |
| Contacto backend       | ⚠️ TODO     | Formulario sin backend                         |

## Datos del catálogo

**6 categorías:** Amor y Romance · Cumpleaños · Orquídeas Premium · Flores Amarillas · Corporativo y Eventos · Condolencias

**Fuente de datos:** Supabase (PostgreSQL). Las 3 páginas del catálogo y todo el admin CRUD leen/escriben desde Supabase.

Los tipos de producto soportan:
- Precios fijos o tabla de variantes (`priceTable`)
- Galería de imágenes múltiples
- Colores (`colors[]`) y tipos de flor (`flowerTypes[]`) para los filtros

## Sistema de filtros

`/catalogo` tiene filtros client-side (sin API routes):
- Búsqueda de texto libre
- Filtro por categoría
- Rango de precio (S/30 – S/800)
- Filtro por colores y tipos de flor
- Sin filtros activos → grid de categorías; con filtros → lista de productos

Los filtros son shareables por URL (query params).

## Identidad de marca

- **Nombre:** Kataleya Flawers
- **Tagline:** "Detalles y floristería..."
- **Trayectoria:** 32 años de experiencia
- **Pedidos mensuales:** 500+
- **Ubicación:** Lima, Perú
- **Horarios:** Lunes a Sábado, 8:00am — 7:00pm
- **WhatsApp:** +51 990 051 041
- **Instagram:** @kataleyaflawers12
- **Tono:** clásico, confiable, con historia

## Desarrollo local

```bash
npm install
npm run dev
# http://localhost:3000
```

## Convenciones

- Componentes en PascalCase
- Usar variables CSS de `globals.css`, nunca valores hardcodeados
- Datos de contacto siempre desde `BUSINESS` en `src/lib/constants.ts`
- Preferir Server Components; `"use client"` solo cuando sea necesario
- No usar `tailwind.config` (Tailwind v4 se configura en CSS)
- Alias `@/*` para imports internos
- En Next.js 16, usar APIs async (`params`, `searchParams`)
- Framer Motion: siempre `LazyMotion` + `domAnimation`, nunca `motion` directo
- Conventional Commits en inglés, sin Co-Authored-By
