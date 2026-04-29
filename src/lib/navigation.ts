/**
 * Fuente única de verdad para la navegación primaria/secundaria del sitio.
 *
 * Convención de hrefs:
 * - Las rutas reales empiezan con `/` (ej: `/catalogo`).
 * - Los anchors de la landing son IDs puros (ej: `#hero`, `#contacto`).
 *   Cuando se renderizan desde una página que NO es la landing, el consumidor
 *   debe prefijar con `/` (ver `withRoot`) para forzar la navegación a `/`
 *   antes de scrollear al anchor.
 *
 * No agregar datos de contacto acá — esos viven en `@/lib/constants` (BUSINESS).
 */

export interface NavLink {
  /** Texto visible. */
  readonly label: string;
  /** Anchor (`#xxx`) o ruta absoluta (`/xxx`). */
  readonly href: string;
  /** True cuando es una ruta real (renderiza con `<Link>` directo, sin scroll handler). */
  readonly isRoute: boolean;
}

export const primaryLinks: readonly NavLink[] = [
  { label: 'Inicio', href: '#hero', isRoute: false },
  { label: 'Catálogo', href: '/catalogo', isRoute: true },
] as const;

export const secondaryLinks: readonly NavLink[] = [
  { label: 'Nosotros', href: '#nosotros', isRoute: false },
  { label: 'Testimonios', href: '#testimonios', isRoute: false },
  { label: 'Contacto', href: '#contacto', isRoute: false },
] as const;

/**
 * Vista combinada para consumidores que no distinguen primary/secondary
 * (ej: Footer). Mantiene el orden conceptual del menú.
 */
export const allNavLinks: readonly NavLink[] = [...primaryLinks, ...secondaryLinks] as const;

/**
 * Convierte un href para que funcione desde cualquier ruta:
 * - Anchors (`#hero`) → `/#hero` (fuerza navegación a `/` antes del scroll).
 * - Rutas absolutas (`/catalogo`) → se devuelven tal cual.
 *
 * Usado por componentes globales (Footer) que se renderizan en todas las páginas.
 */
export function withRoot(href: string): string {
  return href.startsWith('#') ? `/${href}` : href;
}
