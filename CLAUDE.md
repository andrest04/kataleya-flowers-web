# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Landing page para **Kataleya Flawers**, florería real ubicada en Lima, Perú. Proyecto en desarrollo activo — los cambios afectan a un negocio real.

---

## Tech Stack

- **Next.js 16.1.6** con App Router
- **React 19.2.3**
- **TypeScript 5** — tipos estrictos, sin `any`
- **Tailwind CSS v4** — configuración basada en CSS, sin `tailwind.config`
- **Framer Motion** — instalado, usando `LazyMotion` + `domAnimation` para reducir bundle size
- **Playwright** para e2e testing
- **Vercel Analytics** y **Speed Insights** ya integrados

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

```
src/
├── app/
│   ├── layout.tsx                          # Root layout — Navbar, Footer, Analytics
│   ├── page.tsx                            # Landing page — compone todas las secciones
│   ├── globals.css                         # Tailwind v4 + CSS custom properties
│   └── catalogo/
│       ├── page.tsx                        # /catalogo — grid de categorías
│       ├── [categoria]/
│       │   ├── page.tsx                    # /catalogo/[categoria] — productos por categoría
│       │   └── [slug]/
│       │       └── page.tsx                # /catalogo/[categoria]/[slug] — detalle de producto
├── components/
│   ├── Navbar.tsx                          # Fijo, menú mobile, scroll behavior, cross-page nav
│   ├── Footer.tsx
│   └── sections/                           # Secciones de la landing page
│       ├── HeroSection.tsx                 # Carousel con Framer Motion, CAMPAIGN_MODE toggle
│       ├── HeroButtons.tsx
│       ├── CatalogSection.tsx
│       ├── AboutSection.tsx
│       ├── ContactSection.tsx
│       └── ContactForm.tsx
├── data/
│   └── products.ts                         # Datos estáticos de categorías y productos
└── features/
    └── catalog/
        └── types/
            └── index.ts                    # Interfaces Product y Category
```

### Navegación

- Landing page: anchors `#hero`, `#catalogo`, `#nosotros`, `#contacto`
- Catálogo: rutas `/catalogo`, `/catalogo/[categoria]`, `/catalogo/[categoria]/[slug]`
- Las rutas dinámicas usan `generateStaticParams` para static generation

### Capa de datos

Los datos de productos y categorías están en `src/data/products.ts` como arrays estáticos.
Los tipos `Product` y `Category` están en `src/features/catalog/types/index.ts`.
**No hay base de datos ni API** — es contenido hardcodeado por ahora.

---

## Identidad visual — RESPETAR ESTRICTAMENTE

La paleta de colores es fija. **No proponer variaciones ni reemplazos.**

```css
--color-primary: #c0392b; /* Rojo — títulos principales */
--color-secondary: #e8b84b; /* Dorado — acentos y detalles */
--color-accent: #2d5a1b; /* Verde — highlights */
--color-cream: #fdfcfa; /* Crema — fondo general */
--color-dark: #1a1a1a; /* Oscuro — texto */
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
- Usar alias `@/*` para imports

### Tailwind v4

- Estilos en `globals.css` como CSS custom properties — no en `tailwind.config`
- Usar variables CSS definidas (`--color-primary`, etc.), nunca colores hardcodeados

### HeroSection — CAMPAIGN_MODE

Hay un toggle `CAMPAIGN_MODE: 'contact' | 'catalog'` al tope del archivo que cambia el CTA principal. Antes de modificar el hero, entender este mecanismo.

### Framer Motion

Usar siempre `LazyMotion` + `domAnimation` en vez de importar `motion` directamente — reduce el bundle size significativamente.

---

## Commits

- Nunca agregar `Co-Authored-By` ni metadata de autor
- [Conventional Commits](https://www.conventionalcommits.org/) en inglés
- Mensajes cortos: `feat: add contact form validation`, `fix: resolve hydration error in Navbar`

---

## Lo que NO hacer

- ❌ No cambiar la paleta de colores sin aprobación explícita
- ❌ No agregar dependencias sin consultarlo primero
- ❌ No reemplazar Tailwind v4 por v3 ni agregar `tailwind.config`
- ❌ No usar `<img>` nativo — siempre `next/image`
- ❌ No crear rutas API innecesarias para una landing page estática
- ❌ No modificar `layout.tsx` sin entender que afecta toda la app
- ❌ No usar `any` en TypeScript — usar `unknown` con narrowing si el tipo es incierto

---

## Al iniciar una sesión

1. Llamar `mem_context` con `project: kataleya-flawers-web` para recuperar contexto previo
2. Leer los archivos antes de modificar — no asumir que el código es igual a sesiones anteriores
3. Ante cualquier duda sobre diseño o comportamiento, preguntar antes de implementar

## Al terminar una sesión

Llamar `mem_session_summary` con: qué se hizo, qué archivos se tocaron, qué decisiones se tomaron. **Esto NO es opcional.**
