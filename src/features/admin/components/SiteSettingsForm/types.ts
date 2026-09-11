export interface SiteSettingsDraft {
  address: string;
  announcementCtaHref: string;
  announcementCtaLabel: string;
  announcementEndsAt: string;
  announcementIsActive: boolean;
  announcementStartsAt: string;
  announcementText: string;
  bestsellersTitle: string;
  catalogTitle: string;
  contactTitle: string;
  discoverTitle: string;
  email: string;
  hoursCloses: string;
  hoursOpens: string;
  hoursTime: string;
  hoursWeekdays: string;
  instagramHandle: string;
  location: string;
  mapsEmbedUrl: string;
  mapsLink: string;
  name: string;
  openDays: number[];
  phone: string;
  razonSocial: string;
  ruc: string;
  website: string;
  whatsappDefault: string;
  whatsappFloat: string;
  whatsappProduct: string;
}

export const WEEKDAYS: readonly { label: string; value: number }[] = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
];
