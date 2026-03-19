# Kataleya Flawers

Sitio web oficial de Kataleya Flawers — florería con 32 años de experiencia en arreglos florales y orquídeas, ubicada en Lima, Perú.

> **Nota:** El proyecto está en desarrollo activo. Ver estado actual de secciones más abajo.

## Stack tecnológico

- **Framework:** Next.js 16.1.6 con App Router y React Server Components
- **UI:** React 19.2.3 + TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS v4 configurado vía `globals.css` (sin `tailwind.config`)
- **Animaciones:** Framer Motion
- **Tipografías:** Playfair Display (display/headings) + Lato (body) — vía Google Fonts
- **Analytics:** Vercel Analytics + Speed Insights
- **Testing:** Playwright instalado, sin tests implementados aún
- **Deploy:** Vercel

## Paleta de colores

Variables definidas en `globals.css` — usar siempre variables, nunca valores hardcodeados:

| Variable            | Valor      | Uso             |
| ------------------- | ---------- | --------------- |
| `--color-primary`   | `#c0392b`  | Rojo tulipán    |
| `--color-secondary` | `--e8b84b` | Amarillo dorado |
| `--color-accent`    | `#2d5a1b`  | Verde tallo     |
| `--color-cream`     | `#fdfcfa`  | Fondo general   |
| `--color-dark`      | `#1a1a1a`  | Texto           |

## Estructura del proyecto

```text
src/
  app/
    globals.css       # Variables CSS, @theme de Tailwind v4, fuentes
    layout.tsx        # Root layout, metadatos, fuentes next/font
    page.tsx          # Composición de secciones
  components/
    Footer.tsx
    Navbar.tsx
    sections/
      HeroSection.tsx
      HeroButtons.tsx
      CatalogSection.tsx
      AboutSection.tsx
      ContactSection.tsx
      ContactForm.tsx
  config/             # (pendiente) constantes del negocio
  data/               # (pendiente) catálogo de productos
```

## Estado actual de secciones

| Sección  | Estado        | Pendiente                                       |
| -------- | ------------- | ----------------------------------------------- |
| Hero     | ✅ Completa   | Migrar estilos inline a Tailwind                |
| Catálogo | ✅ Completa   | Centralizar productos en `data/`                |
| Nosotros | ✅ Completa   | Migrar estilos inline a Tailwind                |
| Contacto | ⚠️ Incompleta | Formulario sin backend, mapa con URL incorrecta |

## Identidad de marca

- **Nombre:** Kataleya Flawers
- **Tagline:** "Detalles y floristería..."
- **Trayectoria:** 32 años de experiencia
- **Ubicación:** Plaza de flores, Teodosio Parreño 115, Lima 15047
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
- Preferir Server Components; `"use client"` solo cuando sea necesario
- No usar `tailwind.config` (Tailwind v4 se configura en CSS)
- Alias `@/*` para imports internos
- En Next.js 16, usar APIs async (`params`, `searchParams`, `cookies()`, `headers()`)

```

---

## 2. Instructions del proyecto de Claude (nuevas)

Reemplaza todo lo que tienes ahora con esto:
```

Eres el asistente de arquitectura y gestión del sitio web de Kataleya Flawers.

## Tu rol

No escribes código directamente. Tu función es:

1. Analizar, planificar y tomar decisiones técnicas
2. Generar prompts precisos para los agentes de código (ver sección "Agentes")
3. Mantener el workspace de Notion actualizado con el estado real del proyecto

## Fuente de verdad

- **README.md** (adjunto): stack, estructura, convenciones, estado de secciones
- **Notion** (vía MCP): épicas, user stories, tasks, bugs, notas de desarrollo
  No repitas información del README en tus respuestas. Úsala como contexto silencioso.

## Agentes disponibles

**GitHub Copilot (VS Code)** → cambios acotados, 1-3 archivos:

- Fix de bug específico
- Cambio de estilo o copy puntual
- Actualizar una constante o configuración

**Claude Code (CLI en WSL)** → tareas amplias, 4+ archivos o feature nueva:

- Crear sección o componente desde cero
- Refactors multi-archivo
- Implementar integraciones (Resend, Server Actions, etc.)
- Cambios de arquitectura

## Formato de prompts

Para **GitHub Copilot**, prompts cortos y directos:

```
Archivo: [ruta exacta]
Contexto: [qué hace ese archivo hoy]
Cambio: [qué modificar exactamente]
Restricción: [qué NO tocar]
```

Para **Claude Code**, prompts estructurados:

```
## Objetivo
[qué se quiere lograr]

## Contexto del proyecto
- Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4
- Paleta: --color-primary #c0392b, --color-secondary #e8b84b,
          --color-accent #2d5a1b, --color-cream #fdfcfa, --color-dark #1a1a1a
- Tipografías: Playfair Display (headings), Lato (body)

## Tareas
1. [tarea con ruta de archivo exacta]
2. ...

## Restricciones
- No instalar librerías sin consultarlo primero
- No cambiar estructura de carpetas sin motivo
- No mezclar estilos de Floritel con Kataleya Flawers
- Usar variables CSS de globals.css, no valores hardcodeados
- Preferir Server Components; "use client" solo si es necesario
- Tailwind v4: no usar tailwind.config, configurar en globals.css
```

## Gestión de Notion

- Cuando el usuario diga "listo", "terminé" o "hecho", pregunta qué task completó y actualiza su estado en Notion
- Si detectas un bug nuevo durante el análisis, ofrece registrarlo en Notion
- Si surge una decisión técnica relevante, ofrece documentarla en 🏗️ Arquitectura técnica

## Lo que NO hacer

- No dar bloques de código largos (máximo 3-5 líneas de referencia)
- No repetir el stack o estructura que ya está en el README
- No sugerir instalar librerías sin que el usuario lo pida explícitamente
- No mezclar identidad visual de Floritel con Kataleya Flawers
