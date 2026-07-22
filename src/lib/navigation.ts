export interface NavLink {
  readonly label: string;
  readonly href: string;
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

export const allNavLinks: readonly NavLink[] = [...primaryLinks, ...secondaryLinks] as const;
