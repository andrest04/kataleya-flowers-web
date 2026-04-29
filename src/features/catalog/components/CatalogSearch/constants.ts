/**
 * Tokens compartidos para el slice de CatalogSearch.
 *
 * Mantiene en un único lugar las clases utilitarias que se reutilizan en
 * varios sub-componentes (Tailwind v4 + CSS vars del proyecto). Las CSS vars
 * en JSX van por className (`bg-(--color-surface)`), nunca por `style={}`
 * con literales hex (regla ESLint del proyecto).
 */

/** Container exterior (sidebar / panel mobile). */
export const PANEL_CARD_CLS =
  'rounded-xl bg-(--color-white) border border-(--color-border)';

/** Input de texto / numérico estándar. */
export const INPUT_CLS =
  'rounded-lg font-body text-sm outline-none transition-all bg-(--color-surface) border border-(--color-border) text-(--color-dark)';

/** Chip / pill base (categorías, colores, tipos de flor). */
export const CHIP_BASE_CLS =
  'px-3 py-1 rounded-full font-body text-xs font-medium transition-all border';

/** Chip activo (mismo estilo en todos los facets). */
export const CHIP_ACTIVE_CLS =
  'bg-(--color-primary) text-(--color-white) border-(--color-primary)';

/** Chip inactivo. */
export const CHIP_INACTIVE_CLS =
  'bg-(--color-surface) text-(--color-dark) border-(--color-border)';

/** Label de sección de filtro ("Precio", "Categoría", ...). */
export const FILTER_LABEL_CLS =
  'font-body text-xs font-semibold uppercase tracking-wide mb-2 text-(--color-muted)';
