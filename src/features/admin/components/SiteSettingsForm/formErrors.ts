import type { ZodIssue } from 'zod';

const FIELD_LABELS: Record<string, string> = {
  address: 'Dirección',
  announcementCtaHref: 'Enlace del anuncio',
  announcementCtaLabel: 'Texto del botón',
  announcementEndsAt: 'Ocultar desde',
  announcementStartsAt: 'Mostrar desde',
  announcementText: 'Texto del anuncio',
  bestsellersTitle: 'Título de Más vendidos',
  catalogTitle: 'Título de Catálogo',
  contactTitle: 'Título de Contacto',
  discoverTitle: 'Título de Nosotros',
  email: 'Email',
  hoursCloses: 'Cierra',
  hoursOpens: 'Abre',
  hoursTime: 'Horario',
  hoursWeekdays: 'Días',
  instagramHandle: 'Instagram',
  location: 'Ciudad',
  mapsEmbedUrl: 'Link de Google Maps',
  mapsLink: 'Link de Google Maps',
  openDays: 'Días abierto',
  phone: 'Teléfono',
  razonSocial: 'Razón social',
  ruc: 'RUC',
  whatsappDefault: 'Mensaje de Pedir por WhatsApp',
  whatsappFloat: 'Mensaje del botón verde',
  whatsappProduct: 'Mensaje de la ficha de producto',
};

export type FieldErrors = Record<string, string>;

export const FIELD_FOCUS_ORDER = [
  'phone',
  'email',
  'instagramHandle',
  'address',
  'location',
  'mapsLink',
  'mapsEmbedUrl',
  'hoursWeekdays',
  'hoursTime',
  'hoursOpens',
  'hoursCloses',
  'openDays',
  'razonSocial',
  'ruc',
  'whatsappDefault',
  'whatsappFloat',
  'whatsappProduct',
  'announcementText',
  'announcementCtaLabel',
  'announcementCtaHref',
  'announcementStartsAt',
  'announcementEndsAt',
  'catalogTitle',
  'discoverTitle',
  'contactTitle',
] as const;

export function fieldErrorsFromIssues(issues: ZodIssue[] | undefined): FieldErrors {
  if (!issues) return {};
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.join('.');
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export function messageFromFailure(failure: {
  error: string;
  issues?: ZodIssue[];
}): string {
  if (!failure.issues?.length) return failure.error;
  const parts = [...new Set(failure.issues.map((issue) => {
    const [first] = issue.path;
    if (typeof first === 'string') {
      const field = FIELD_LABELS[first];
      return field ? `${field}: ${issue.message}` : issue.message;
    }
    return issue.message;
  }))];
  return parts.join(' · ');
}

export function fieldId(key: string): string {
  return `settings-${key}`;
}
