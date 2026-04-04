# Kataleya Flawers

Sitio web oficial de **Kataleya Flawers** — florería con 32 años de experiencia en arreglos florales y orquídeas, ubicada en Lima, Perú.

## Stack tecnológico

- **Framework:** Next.js 16.1.6 con App Router y React Server Components
- **UI:** React 19.2.3 + TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS v4 configurado vía `globals.css` (sin `tailwind.config`)
- **Animaciones:** Framer Motion 12 con `LazyMotion` + `domAnimation`
- **Base de datos:** Supabase (PostgreSQL) — cliente SSR con `@supabase/ssr`
- **Auth:** Supabase Auth — guard en middleware
- **Drag & Drop:** @dnd-kit/react — reordenamiento visual de categorías
- **Iconos:** react-icons 5 + lucide-react
- **Charts:** Recharts 3 — gráficos del dashboard admin
- **Tipografías:** Playfair Display (display/headings) + Lato (body) — vía Google Fonts
- **Imágenes:** Cloudinary CDN (`res.cloudinary.com/dbjm18dqg`) — upload + destroy integrados
- **Analytics:** Vercel Analytics + Speed Insights
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
│   │       ├── page.tsx                    # Dashboard — métricas, KPIs, analíticas
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
│   │       ├── TestimonialsSection.tsx     # Grid polaroid (desktop) / carousel (mobile)
│   │       └── TrustBar.tsx               # Barra de confianza con métricas
│   ├── catalog/
│   │   ├── components/                     # CatalogSearch, ProductGallery, ProductGrid, BackButton
│   │   ├── hooks/                          # useProductFilter
│   │   ├── queries/                        # Supabase queries (getProducts, getCategories, etc.)
│   │   ├── actions/                        # searchProducts server action
│   │   ├── types/index.ts                  # Product, Category, PriceVariant, PriceVariantRow + enums
│   │   └── utils/filterProducts.ts         # Filtrado: texto, categoría, precio, colores, flores
│   └── admin/
│       ├── components/
│       │   ├── AdminSidebar.tsx
│       │   ├── ProductTable.tsx            # Tabla con filtro por categoría
│       │   ├── ProductForm.tsx             # Formulario create/edit con arrays dinámicos
│       │   ├── CategoryList.tsx            # Lista con drag-and-drop reorder (@dnd-kit)
│       │   ├── CategoryForm.tsx            # Formulario create/edit de categorías
│       │   ├── ImageUploader.tsx           # Upload a Cloudinary con drag-and-drop
│       │   ├── LogoutButton.tsx
│       │   └── dashboard/                  # 16 componentes del dashboard
│       │       ├── DashboardTabs.tsx        # Tabs: Resumen + Analíticas
│       │       ├── ResumenTab.tsx           # KPIs, inventario, actividad reciente
│       │       ├── AnaliticasTab.tsx        # Gráficos de conversión y tráfico
│       │       ├── ActionableKpiGrid.tsx    # Insights accionables automáticos
│       │       ├── InventoryDonut.tsx       # Donut chart de inventario
│       │       ├── TopProductsChart.tsx     # Ranking de productos más vistos
│       │       ├── TopCategoriesChart.tsx   # Ranking de categorías
│       │       ├── ProductConversionRanking.tsx  # Vista → WhatsApp conversion
│       │       ├── WhatsAppSourceChart.tsx  # Fuentes de clicks WhatsApp
│       │       └── ...                     # AutomaticInsightsPanel, ChartCard, etc.
│       ├── hooks/useImageUpload.ts         # Hook de upload a Cloudinary
│       ├── queries/
│       │   ├── products.ts                 # getAdminProducts, getAdminProductById
│       │   ├── categories.ts               # getAdminCategories, getAdminCategoryById
│       │   ├── dashboard.ts                # Inventario, actividad reciente, KPIs
│       │   ├── analytics.ts                # Métricas de conversión, tráfico
│       │   ├── dashboardInsights.ts        # Insights automáticos (detecta anomalías)
│       │   └── adminFilters.ts             # Filtros dinámicos para el admin
│       ├── actions/
│       │   ├── products.ts                 # create, update, delete
│       │   └── categories.ts               # create, update, delete (RPC), reorder (RPC), toggles
│       ├── utils/slugify.ts                # Slugify compartido entre actions y forms
│       └── types/                          # ProductFormData, CategoryFormData
├── data/
│   └── products.ts                         # Datos estáticos legacy (no se usa en código activo)
├── lib/
│   ├── constants.ts                        # BUSINESS — datos de contacto y negocio
│   ├── cloudinary.ts                       # destroyCloudinaryImage, destroyCloudinaryImages
│   └── supabase/
│       ├── client.ts                       # Browser client
│       ├── server.ts                       # Server client (SSR)
│       ├── static.ts                       # Client para static generation (sin cookies)
│       ├── middleware.ts                    # Client para middleware de auth
│       └── types.ts                        # Tipos auto-generados (npm run db:types)
└── types/
    └── index.ts                            # Tipos globales compartidos
```

## Estado actual

| Feature                 | Estado      | Notas                                                    |
| ----------------------- | ----------- | -------------------------------------------------------- |
| Landing page            | ✅ Completa | Hero, Catálogo, Testimonios, About, Contacto, TrustBar  |
| Catálogo público        | ✅ Completa | Supabase, búsqueda + filtros, lightbox, URL shareables   |
| Auth (login/logout)     | ✅ Completa | Supabase Auth, middleware guard                          |
| Admin — Productos CRUD  | ✅ Completa | Crear, editar, eliminar, tabla con filtros               |
| Admin — Categorías CRUD | ✅ Completa | CRUD + drag-and-drop reorder + featured toggle           |
| Admin — Dashboard       | ✅ Completa | KPIs, inventario, analíticas, insights automáticos       |
| Admin — Image Upload    | ✅ Completa | Cloudinary con drag-and-drop, preview, progress          |
| E2E Tests               | ✅ Activos  | Playwright: smoke, catálogo, dashboard                   |
| Contacto backend        | ❌ No hay   | Solo links directos a WhatsApp e Instagram               |

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

## Dashboard admin

El dashboard tiene dos tabs:

- **Resumen:** inventario (donut chart), actividad reciente, KPIs accionables con insights automáticos
- **Analíticas:** productos más vistos, categorías top, conversión vista→WhatsApp, fuentes de clicks

Las agregaciones corren como funciones RPC de Postgres para performance. Los insights se generan automáticamente detectando anomalías en los datos.

## Capa de datos

**Supabase** es la fuente de datos. Operaciones críticas usan **funciones RPC transaccionales**:

| Función RPC                  | Propósito                                          |
| ---------------------------- | -------------------------------------------------- |
| `delete_category_cascade`    | Borra categoría + productos atómicamente           |
| `delete_category_reassign`   | Reasigna productos + borra categoría atómicamente  |
| `reorder_categories`         | Reordena categorías en una sola transacción        |
| `get_inventory_status`       | Métricas de inventario para dashboard              |
| `get_top_entities`           | Ranking de entidades por evento                    |
| `get_product_conversion_metrics` | Métricas de conversión vista→WhatsApp          |
| `get_event_type_counts`      | Conteo de eventos por tipo                         |
| `get_whatsapp_source_counts` | Fuentes de clicks de WhatsApp                      |

Los tipos generados de la DB están en `src/lib/supabase/types.ts` — regenerar con `npm run db:types`.

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
npm run db:types     # Regenerar tipos de Supabase (requiere SUPABASE_ACCESS_TOKEN en env)
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
