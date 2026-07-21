# Kataleya Flawers

Sitio web oficial de **Kataleya Flawers** — florería con 32 años de experiencia en arreglos florales y orquídeas, ubicada en Lima, Perú.

## Stack tecnológico

- **Framework:** Next.js 16.1.6 con App Router y React Server Components
- **UI:** React 19.2.3 + TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS v4 configurado vía `globals.css` (sin `tailwind.config`)
- **Animaciones:** Framer Motion 12 con `LazyMotion` + `domAnimation`
- **Base de datos:** Appwrite (único backend) — Auth + DB
- **Auth:** Appwrite Auth — sesión en cookies SSR, guard en `proxy.ts` + RSC layout
- **Drag & Drop:** @dnd-kit/react — reordenamiento visual de categorías
- **Iconos:** react-icons 5 + lucide-react
- **Tipografías:** Playfair Display (display/headings) + Lato (body) — vía Google Fonts
- **Imágenes:** Appwrite Storage — upload + destroy integrados, buckets `product_images`/`category_images`
- **Email:** Resend — envío transaccional
- **Testing:** Playwright — e2e tests para landing, catálogo y dashboard
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
│   ├── globals.css                         # Variables CSS, @theme Tailwind v4, fuentes
│   ├── layout.tsx                          # Root layout, metadatos, fuentes next/font
│   ├── page.tsx                            # Composición de secciones (landing)
│   ├── (public)/
│   │   ├── layout.tsx                      # Pass-through layout
│   │   └── catalogo/
│   │       ├── page.tsx                    # /catalogo — grid + búsqueda/filtros
│   │       ├── loading.tsx                 # Loading skeleton
│   │       ├── error.tsx                   # Error boundary
│   │       ├── [categoria]/page.tsx        # Productos por categoría
│   │       └── [categoria]/[slug]/page.tsx # Detalle de producto
│   ├── (admin)/
│   │   ├── layout.tsx                      # Admin layout con sidebar + auth check
│   │   └── admin/
│   │       ├── page.tsx                    # Dashboard — métricas, KPIs
│   │       ├── productos/                  # CRUD productos
│   │       │   ├── page.tsx                # Lista con ProductTable
│   │       │   ├── nuevo/page.tsx          # Crear producto
│   │       │   └── [id]/page.tsx           # Editar producto
│   │       └── categorias/                 # CRUD categorías
│   │           ├── page.tsx                # Lista con drag-and-drop reorder
│   │           ├── nueva/page.tsx          # Crear categoría
│   │           └── [id]/page.tsx           # Editar categoría
│   └── (auth)/
│       └── login/page.tsx                  # Login con Appwrite Auth
├── components/
│   ├── shared/
│   │   ├── Navbar/                         # Módulo Navbar (5 archivos)
│   │   │   ├── index.tsx                   # Componente principal — fijo, scroll behavior
│   │   │   ├── DesktopSearch.tsx           # Búsqueda con autocomplete (desktop)
│   │   │   ├── MobileDrawer.tsx            # Drawer deslizable (mobile)
│   │   │   ├── useNavbar.ts                # Hook con lógica del Navbar
│   │   │   └── constants.ts               # primaryLinks, secondaryLinks, SearchResult
│   │   ├── Footer.tsx
│   │   ├── WhatsAppFloat.tsx               # Botón flotante WhatsApp (z-50)
│   │   └── BusinessHoursBadge.tsx          # Badge de horario de atención
│   └── ui/                                 # Design system
│       ├── Breadcrumb.tsx, Button.tsx, ConfirmDialog.tsx, EmptyState.tsx
│       ├── FilterChip.tsx, FormField.tsx, Input.tsx, PillToggle.tsx
│       ├── SectionHeader.tsx, ToggleSwitch.tsx
│       └── primitives/                     # Radix UI primitives (alert-dialog, sheet, etc.)
├── features/
│   ├── landing/
│   │   └── components/                     # Secciones de la landing page
│   │       ├── HeroSection.tsx             # Carousel con Framer Motion, CAMPAIGN_MODE toggle
│   │       ├── HeroButtons.tsx
│   │       ├── CatalogSection.tsx          # Vista previa del catálogo en landing
│   │       ├── AboutSection.tsx
│   │       ├── ContactSection.tsx          # WhatsApp, Instagram, mapa — sin form backend
│   │       └── TestimonialsSection.tsx     # Grid polaroid (desktop) / carousel (mobile)
│   ├── catalog/
│   │   ├── components/                     # CatalogSearch, ProductGallery, ProductGrid, BackButton
│   │   ├── hooks/                          # useProductFilter
│   │   ├── queries/                        # Appwrite queries (getProducts, getCategories, etc.)
│   │   ├── actions/                        # searchProducts server action
│   │   ├── types/index.ts                  # Product, Category, PriceVariant + enums
│   │   └── utils/filterProducts.ts         # Filtrado: texto, categoría, precio, colores, flores
│   └── admin/
│       ├── components/
│       │   ├── AdminSidebar.tsx
│       │   ├── ProductTable/               # Tabla con filtro por categoría
│       │   ├── ProductForm/                # Formulario create/edit con arrays dinámicos
│       │   ├── CategoryList/               # Lista con drag-and-drop reorder (@dnd-kit)
│       │   ├── CategoryForm.tsx            # Formulario create/edit de categorías
│       │   ├── ImageUploader.tsx           # Upload a Appwrite Storage con drag-and-drop
│       │   └── LogoutButton.tsx
│       ├── hooks/useImageUpload.ts         # Hook de upload a Appwrite Storage
│       ├── queries/
│       │   ├── products.ts                 # getAdminProducts, getAdminProductById
│       │   ├── categories.ts               # getAdminCategories, getAdminCategoryById
│       │   └── adminFilters.ts             # Filtros dinámicos para el admin
│       ├── actions/
│       │   ├── products.ts                 # create, update, delete
│       │   ├── categories.ts               # create, update, delete, reorder, toggles
│       │   └── flowerTypes.ts / productColors.ts
│       ├── utils/
│       │   ├── auth.ts                     # requireAdmin / withAdminAuth
│       │   ├── adminMembership.appwrite.ts # isAdminUserAppwrite — verifica Team admins
│       │   └── slugify.ts                  # Slugify compartido entre actions y forms
│       └── types/                          # ProductFormData, CategoryFormData
├── data/
│   └── products.ts                         # Datos estáticos legacy (no se usa en código activo)
├── lib/
│   ├── constants.ts                        # BUSINESS — datos de contacto y negocio
│   ├── imageStorage/                       # Abstracción de storage (types, appwriteProvider, urlValidation)
│   ├── resend.ts                           # Cliente Resend para email transaccional
│   ├── db/rows.ts                          # Tipos de fila DB: CategoryRow, ProductRow, etc.
│   └── appwrite/
│       ├── config.ts                       # IDs de proyecto, base de datos y colecciones
│       ├── account.ts                      # Cliente de cuenta Appwrite (SSR)
│       ├── session.ts                      # Gestión de sesión en cookies
│       ├── admin.ts                        # Cliente admin (server-side)
│       ├── cookies.ts                      # Helpers de cookies para SSR
│       ├── types.ts                        # Tipos internos de Appwrite
│       └── repositories/
│           ├── products.ts                 # CRUD + queries de productos
│           ├── categories.ts               # CRUD + reorder + cascade/reassign de categorías
│           ├── taxonomy.ts                 # Colores y tipos de flor (sync de taxonomía)
│           ├── complaints.ts               # Gestión de reclamos
│           └── shared.ts                   # Helpers compartidos entre repositorios
└── types/
    └── index.ts                            # Tipos globales compartidos
proxy.ts                                    # Next.js middleware (renombrado) — cookie-presence guard
```

## Estado actual

| Feature                 | Estado      | Notas                                                    |
| ----------------------- | ----------- | -------------------------------------------------------- |
| Landing page            | ✅ Completa | Hero, Catálogo, Testimonios, About, Contacto, TrustBar  |
| Catálogo público        | ✅ Completa | Appwrite, búsqueda + filtros, lightbox, URL shareables   |
| Auth (login/logout)     | ✅ Completa | Appwrite Auth, cookie-presence guard en proxy.ts         |
| Admin — Productos CRUD  | ✅ Completa | Crear, editar, eliminar, tabla con filtros               |
| Admin — Categorías CRUD | ✅ Completa | CRUD + drag-and-drop reorder + featured toggle           |
| Admin — Image Upload    | ✅ Completa | Appwrite Storage con drag-and-drop, preview, progress    |
| E2E Tests               | ✅ Activos  | Playwright: smoke, catálogo, dashboard                   |
| Contacto backend        | ❌ No hay   | Solo links directos a WhatsApp e Instagram               |

## Datos del catálogo

**6 categorías:** Amor y Romance · Cumpleaños · Orquídeas Premium · Flores Amarillas · Corporativo y Eventos · Condolencias

**Fuente de datos:** Appwrite. Las 3 páginas del catálogo y todo el admin CRUD leen/escriben vía `src/lib/appwrite/repositories/*`.

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

## Capa de datos

**Appwrite** es la fuente de datos. Operaciones que en el stack anterior usaban RPCs transaccionales de Postgres ahora están implementadas en Node dentro de los repositorios:

| Repositorio                          | Operaciones equivalentes                                   |
| ------------------------------------ | ---------------------------------------------------------- |
| `repositories/categories.ts`         | Borrado en cascada, reasignación de productos, reorder     |
| `repositories/products.ts`           | CRUD completo, contador de correlativo                     |
| `repositories/taxonomy.ts`           | Sync de colores y tipos de flor                            |
| `repositories/complaints.ts`         | Gestión de reclamos                                        |
| `repositories/shared.ts`             | Helpers compartidos (paginación, mappers, etc.)            |

Los tipos de fila de la base de datos están en `src/lib/db/rows.ts` (hand-written: `CategoryRow`, `ProductRow`, etc.) — no hay script de generación automática.

## Autorización admin

La autorización requiere dos condiciones simultáneas:

1. **Sesión Appwrite válida** — `account.get()` sin lanzar excepción
2. **Membresía en el Team `admins`** — verificada por `isAdminUserAppwrite` en `src/features/admin/utils/adminMembership.appwrite.ts`

Ambas condiciones son verificadas por `requireAdmin()` / `withAdminAuth()` en `src/features/admin/utils/auth.ts`. Si alguna falla, la action devuelve `FORBIDDEN`. El Team `admins` debe estar seedeado en Appwrite o todos los admins quedarán bloqueados.

## Identidad de marca

- **Nombre:** Kataleya Flawers
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
npm run dev          # Dev server en http://localhost:3000
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run lint:strict  # eslint . --max-warnings 0
npm run test:e2e     # Playwright e2e tests
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
