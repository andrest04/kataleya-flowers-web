# CLAUDE.md — Kataleya Flawers

Guía para Claude Code al trabajar en este repositorio.

---

## Contexto del proyecto

Landing page para **Kataleya Flawers**, florería real ubicada en Lima, Perú.
Proyecto en desarrollo activo. El objetivo es una página elegante, cálida y profesional
que transmita confianza y refleje la identidad visual de la marca.

**No es un proyecto demo ni de práctica** — los cambios afectan a un negocio real.

---

## Tech Stack

- **Next.js 16.1.6** con App Router
- **React 19.2.3**
- **TypeScript 5** — tipos estrictos, sin `any`
- **Tailwind CSS v4** — configuración basada en CSS, sin `tailwind.config`
- **Playwright** para e2e testing
- **Vercel Analytics** y **Speed Insights** ya integrados

---

## Calidad de código

- **ESLint 9** — flat config en `eslint.config.mjs` sin eslint-config-next.
  Plugins nativos: react, react-hooks, jsx-a11y, @next/eslint-plugin-next
  typescript-eslint en modo strict + stylistic para TS/TSX
- **husky** + **lint-staged** — pre-commit hook que corre sobre archivos staged:
  - \*.{ts,tsx}: eslint --max-warnings 0
  - \*.{js,mjs}: eslint --max-warnings 0
- **Baseline**: QA/eslint-baseline.txt documenta errores pre-existentes

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

Tipografías:

- **Playfair Display** — serif, para títulos y display
- **Lato** — sans-serif, para cuerpo de texto

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          # Root layout — Navbar, Footer, Analytics
│   ├── page.tsx            # Landing page — compone todas las secciones
│   └── globals.css         # Tailwind v4 + CSS custom properties
└── components/
    ├── Navbar.tsx           # Fijo, menú mobile, scroll behavior
    ├── Footer.tsx
    └── sections/
        ├── HeroSection.tsx
        ├── HeroButtons.tsx
        ├── CatalogSection.tsx
        ├── AboutSection.tsx
        ├── ContactSection.tsx
        └── ContactForm.tsx
```

Navegación por anchors: `#hero`, `#catalogo`, `#nosotros`, `#contacto`

---

## Reglas de desarrollo

### Componentes

- Server Components por defecto — solo agregar `'use client'` cuando sea estrictamente necesario
- Componentes con hooks (`useState`, `useEffect`) o eventos del browser **deben** tener `'use client'`
- Nuevas secciones van en `src/components/sections/` siguiendo el patrón existente
- Usar alias `@/*` para imports, nunca rutas relativas largas

### Tailwind v4

- Los estilos van en `globals.css` como CSS custom properties, **no** en `tailwind.config`
- Usar las variables CSS definidas (`--color-primary`, etc.) en vez de colores hardcodeados
- No instalar ni sugerir `tailwind.config.js/ts` — está deprecado en v4

### Next.js 16

- `params` y `searchParams` son **async** — siempre usar `await`
- `cookies()` y `headers()` también son async
- No usar `middleware.ts` — está deprecado, usar `proxy.ts` si se necesita
- Imágenes con `next/image`, nunca `<img>` nativo
- `next/legacy/image` está eliminado en Next.js 16

### TypeScript

- Tipos estrictos en todo
- Sin `any` — si no se sabe el tipo, usar `unknown` y narrowing
- Props siempre tipadas con interfaces

---

## Commits

- **Nunca agregar `Co-Authored-By`** ni metadata de autor
- Usar [Conventional Commits](https://www.conventionalcommits.org/) en inglés
- Mensajes cortos y concisos que expliquen la funcionalidad

Ejemplos: `feat: add contact form validation`, `fix: resolve hydration error in Navbar`, `config: update ESLint rules`

---

## Lo que NO hacer

- ❌ No cambiar la paleta de colores sin aprobación explícita
- ❌ No agregar dependencias sin consultarlo primero
- ❌ No reemplazar Tailwind v4 por v3 ni agregar `tailwind.config`
- ❌ No usar `<img>` nativo — siempre `next/image`
- ❌ No crear rutas API innecesarias para una landing page estática
- ❌ No agregar librerías de animación pesadas (framer-motion, etc.) sin consultar
- ❌ No modificar `layout.tsx` sin entender que afecta toda la app

---

## Comandos

```bash
npm run dev          # Dev server en http://localhost:3000
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint          # eslint .
npm run lint:fix      # eslint . --fix
npm run lint:strict   # eslint . --max-warnings 0
npx playwright test  # Tests e2e
```

---

## Al iniciar una sesión

1. Revisar qué archivos existen actualmente en `src/components/sections/`
2. No asumir que el código es igual a sesiones anteriores — leer los archivos antes de modificar
3. Ante cualquier duda sobre diseño o comportamiento, preguntar antes de implementar

## Memoria (Engram)

Tienes acceso a memoria persistente via Engram MCP.

**Al iniciar cada sesión:**

- Llama `mem_context` con `project: kataleya-flawers-web` para recuperar contexto previo

**Durante la sesión:**

- Llama `mem_save` después de cualquier decisión importante, cambio de arquitectura o bug resuelto

**Al terminar la sesión:**

- Llama `mem_session_summary` con un resumen de: qué se hizo, qué archivos se tocaron, qué decisiones se tomaron
- Esto NO es opcional — sin este resumen la próxima sesión empieza sin contexto
