# Kataleya Flowers

Landing + panel de administración para **Kataleya Flowers**, florería con 32+ años de experiencia en arreglos florales y orquídeas en Lima, Perú. Negocio en producción — los cambios son reales.

## Stack

- **Framework:** Next.js 16 (App Router, RSC por defecto)
- **UI:** React 19 + TypeScript 5 (strict)
- **Estilos:** Tailwind CSS v4, configurado en `globals.css` (sin `tailwind.config.*`)
- **Animaciones:** Framer Motion 12 vía `LazyMotion + m` (nunca `import { motion }` directo)
- **Drag & Drop:** @dnd-kit/react — reordenamiento de categorías
- **Iconos:** lucide-react (react-icons queda solo en `Footer.tsx`, legado)
- **Componentes:** Radix UI primitives + design system propio en `src/components/ui`
- **Backend:** Appwrite — único backend (Auth + DB + Storage)
- **Email:** Resend — envío transaccional (libro de reclamaciones)
- **Validación:** zod
- **Testing:** Playwright (e2e)
- **Tipografías:** Playfair Display (headings) + Lato (body) vía `next/font/google`

## Paleta de colores

Fija — variables en `globals.css`, nunca valores hardcodeados en código:

| Variable            | Valor     | Uso                       |
| ------------------- | --------- | -------------------------- |
| `--color-primary`   | `#c0392b` | Rojo — títulos             |
| `--color-secondary` | `#e8b84b` | Dorado — acentos           |
| `--color-accent`    | `#2d5a1b` | Verde — highlights         |
| `--color-cream`     | `#fdfcfa` | Fondo general              |
| `--color-dark`      | `#1a1a1a` | Texto                      |
| `--color-whatsapp`  | `#25d366` | Solo elementos WhatsApp    |

## Requisitos

- Node.js 20+
- Un proyecto de [Appwrite](https://appwrite.io) con base de datos, storage, Team `admins` y las colecciones/buckets esperados por `src/lib/appwrite/config.ts`
- Una API key de [Resend](https://resend.com)

## Setup

```bash
npm install
cp env.example .env          # renombrar a .env.example si preferís, y completar con credenciales reales
npm run dev                  # http://localhost:3000
```

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `APPWRITE_ENDPOINT` | URL del endpoint de Appwrite |
| `APPWRITE_PROJECT_ID` | ID del proyecto Appwrite |
| `APPWRITE_API_KEY` | API key server-side de Appwrite |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Remitente de los emails transaccionales |
| `COMPLAINTS_NOTIFY_EMAIL` | Email interno que recibe copia de cada hoja de reclamación |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | Credenciales de un admin real, solo para los specs e2e de admin |

Los IDs de base de datos, colecciones y buckets de Appwrite son constantes de código en `src/lib/appwrite/config.ts` (deterministas en todo ambiente) — no van en el env.

⚠️ El Team `admins` de Appwrite debe estar seedeado con al menos un usuario, o todo `/admin` queda bloqueado.

## Comandos

```bash
npm run dev           # servidor de desarrollo
npm run build         # build de producción
npm run start         # sirve el build de producción
npm run lint           # eslint .
npm run lint:fix        # eslint . --fix
npm run lint:strict      # eslint . --max-warnings 0 (el que corre en pre-commit)
npx tsc --noEmit          # type-check
npm run test:e2e           # suite completa de Playwright
npx playwright test phase1-verify  # regression baseline, siempre debe estar en verde
npm run doctor                      # react-doctor — lint/a11y/bundle/arquitectura, también corre en CI
```

Pre-commit (manual, no hay hooks): `npm run lint:strict` + `npx tsc --noEmit`.

## Estructura

Arquitectura por feature folders (`components/hooks/queries/actions/schemas/utils/types` agrupados por dominio):

```
src/
├── app/                # App Router: (public), (admin), (auth), api/
├── components/
│   ├── shared/          # Navbar, Footer, WhatsAppFloat, BusinessHoursBadge
│   └── ui/               # design system + primitives/ (Radix)
├── features/
│   ├── landing/           # secciones de la home
│   ├── catalog/            # catálogo público + filtros client-side
│   ├── admin/               # CRUD productos/categorías (server actions)
│   └── complaints/           # libro de reclamaciones (form público + panel admin + emails)
└── lib/
    ├── constants.ts          # BUSINESS — única fuente de datos de contacto
    ├── navigation.ts          # NAV_LINKS
    └── appwrite/               # config, auth/session, repositories/*
```

## Funcionalidades

| Feature | Estado |
| --- | --- |
| Landing pública | Hero, catálogo, testimonios, about, contacto |
| Catálogo público | Búsqueda + filtros (texto, categoría, precio, colores, flores), lightbox, URLs shareables |
| Auth admin | Appwrite Auth + verificación de membresía en Team `admins` |
| Admin — Productos/Categorías | CRUD completo, reorder drag-and-drop, upload de imágenes a Appwrite Storage |
| Libro de reclamaciones | Formulario público (`/libro-de-reclamaciones`) + panel admin (`/admin/reclamos`), notificación por email vía Resend |
| E2E | Playwright — `phase1-verify` es el baseline de regresión |

**6 categorías de catálogo:** Amor y Romance, Cumpleaños, Orquídeas Premium, Flores Amarillas, Corporativo y Eventos, Condolencias.

## Documentación para agentes

Las reglas de código vinculantes (la mayoría automatizadas vía ESLint), el patrón obligatorio de server actions y el detalle completo de arquitectura están en [`CLAUDE.md`](./CLAUDE.md).
