export const BUSINESS = {
  name: "Kataleya Flawers",
  phone: "51990051041",
  whatsapp: "https://wa.me/51990051041",
  whatsappWithMessage: (msg: string) =>
    `https://wa.me/51990051041?text=${encodeURIComponent(msg)}`,
  instagram: "https://instagram.com/kataleyaflawers12",
  instagramHandle: "@kataleyaflawers12",
  hours: {
    weekdays: "Lunes a Sábado",
    time: "8:00am — 7:00pm",
  },
  location: "Lima, Perú",
  experience: "32",
  monthlyOrders: "500+",
} as const;
