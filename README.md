# Kataleya Flawers

Landing page para **Kataleya Flawers**, floristería ubicada en Lima, Perú, con enfoque en arreglos florales y orquídeas. El sitio es una sola página con navegación por anclas.

## Stack tecnológico

- **Next.js 16.1.6** (App Router)
- **React 19.2.3**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Playwright** + **@playwright/test** (pruebas)
- **Vercel Analytics** y **Speed Insights** (telemetría y rendimiento)
- **Fuentes**: Playfair Display y Lato (importadas en `globals.css` y usadas como variables CSS). Geist / Geist Mono (cargadas vía `next/font` en `layout.tsx`).

## Estructura del proyecto

```
src/
├── app/
│   ├── globals.css        # Variables CSS, paleta y tipografías
│   ├── layout.tsx         # Layout raíz + metadatos + Navbar + Footer + Analytics/SpeedInsights
│   └── page.tsx           # Página principal (secciones en orden)
└── components/
    ├── Navbar.tsx          # Navegación fija con scroll suave y menú móvil
    ├── Footer.tsx          # Pie de página
    └── sections/
        ├── HeroSection.tsx     # Sección de bienvenida con CTAs
        ├── HeroButtons.tsx     # Botones de llamada a la acción del hero
        ├── CatalogSection.tsx  # Catálogo con 6 productos
        ├── AboutSection.tsx    # Historia y métricas
        ├── ContactSection.tsx  # Datos de contacto + formulario
        └── ContactForm.tsx     # Formulario con validación en cliente
```

## Secciones de la página

| ID anchor    | Sección   | Descripción |
| ------------ | --------- | ----------- |
| `#hero`      | Hero      | Presentación de la marca con CTAs hacia catálogo y contacto |
| `#catalogo`  | Catálogo  | Grilla de 6 productos con imágenes placeholder |
| `#nosotros`  | Nosotros  | Historia del negocio + 3 métricas destacadas |
| `#contacto`  | Contacto  | Datos de ubicación/horario + formulario de contacto |

## Paleta y tipografías

| Variable              | Valor       | Uso |
| --------------------- | ----------- | --- |
| `--color-primary`     | `#c0392b`   | Títulos principales |
| `--color-secondary`   | `#e8b84b`   | Acentos dorados |
| `--color-accent`      | `#2d5a1b`   | Verde destacado |
| `--color-cream`       | `#fdfcfa`   | Fondo base |
| `--color-dark`        | `#1a1a1a`   | Texto general |

Tipografías definidas en CSS:
- `--font-display` / `--font-heading`: Playfair Display
- `--font-body`: Lato

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts disponibles

| Comando         | Descripción |
| --------------- | ----------- |
| `npm run dev`   | Servidor de desarrollo |
| `npm run build` | Compilación para producción |
| `npm run start` | Servidor de producción |
