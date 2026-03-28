# Kataleya Flawers

Sitio web oficial de Kataleya Flawers — florería con 32 años de experiencia en arreglos florales y orquídeas, ubicada en Lima, Perú.

## Stack tecnológico

- **Framework:** Next.js 16.1.6 con App Router y React Server Components
- **UI:** React 19.2.3 + TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS v4 configurado vía `globals.css` (sin `tailwind.config`)
- **Animaciones:** Framer Motion 12 con `LazyMotion` + `domAnimation`
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
│   └── catalogo/
│       ├── page.tsx                    # /catalogo — grid + búsqueda/filtros
│       ├── [categoria]/page.tsx        # Productos por categoría
│       └── [categoria]/[slug]/page.tsx # Detalle de producto
├── components/
│   ├── Navbar/             # Módulo Navbar (5 archivos)
│   │   ├── index.tsx       # Componente principal
│   │   ├── DesktopSearch.tsx
│   │   ├── MobileDrawer.tsx
│   │   ├── useNavbar.ts
│   │   └── constants.ts
│   ├── Footer.tsx
│   ├── WhatsAppFloat.tsx   # Botón flotante WhatsApp
│   ├── BusinessHoursBadge.tsx
│   ├── catalog/
│   │   ├── BackButton.tsx
│   │   ├── CatalogSearch.tsx   # Búsqueda y filtros sidebar
│   │   ├── ProductGallery.tsx  # Galería con lightbox
│   │   └── ProductGrid.tsx     # Grilla con ordenamiento
│   └── sections/
│       ├── HeroSection.tsx         # Carousel, CAMPAIGN_MODE toggle
│       ├── HeroButtons.tsx
│       ├── CatalogSection.tsx
│       ├── AboutSection.tsx
│       ├── ContactSection.tsx
│       ├── ContactForm.tsx
│       ├── TestimonialsSection.tsx  # Polaroid grid / carousel mobile
│       └── TrustBar.tsx            # Contadores animados
├── data/
│   └── products.ts         # 6 categorías + productos (datos estáticos)
├── features/
│   └── catalog/
│       ├── types/index.ts          # Product, Category, PriceVariant + enums
│       └── utils/filterProducts.ts # Lógica de filtrado client-side
└── lib/
    └── constants.ts        # BUSINESS — datos de contacto y negocio
```

## Estado actual de secciones

| Sección        | Estado      | Notas                                          |
| -------------- | ----------- | ---------------------------------------------- |
| Hero           | ✅ Completa | CAMPAIGN_MODE toggle (contact / catalog)        |
| Catálogo       | ✅ Completa | Búsqueda + filtros, lightbox, scroll restaurado |
| Testimonios    | ✅ Completa | Grid polaroid desktop / carousel mobile         |
| TrustBar       | ✅ Completa | Contadores animados (dentro del Hero)           |
| Nosotros       | ✅ Completa |                                                 |
| Contacto       | ⚠️ Parcial  | Formulario sin backend                          |

## Datos del catálogo

**6 categorías:** Amor y Romance · Cumpleaños · Orquídeas Premium · Flores Amarillas · Corporativo y Eventos · Condolencias

Todos los datos son **estáticos** (no hay API ni base de datos). Las imágenes viven en Cloudinary.

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
