export const BUSINESS = {
  name: "Kataleya Flawers",
  website: "https://kataleyaflawers.com",
  phone: "51990051041",
  whatsapp: "https://wa.me/51990051041",
  whatsappWithMessage: (msg: string) =>
    `https://wa.me/51990051041?text=${encodeURIComponent(msg)}`,
  instagram: "https://instagram.com/kataleyaflawers12",
  instagramHandle: "@kataleyaflawers12",
  hours: {
    weekdays: "Lunes a Sábado",
    time: "8:00am — 7:00pm",
    opens: "08:00",
    closes: "19:00",
    openDays: [1, 2, 3, 4, 5, 6] as readonly number[],
  },
  location: "Lima, Perú",
  // Datos legales del proveedor — requeridos por el Libro de Reclamaciones (INDECOPI).
  razonSocial: "Ortiz Ruiz Bienvenido Henry",
  ruc: "10104853370",
  address: "Teodosio Parreño 115 (ex cortijo), Lima, Perú",
  email: "floritel_hor@hotmail.com",
  experience: "32",
  monthlyOrders: "500+",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.667835343661!2d-77.0213840240266!3d-12.134864543549192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b7fe8f580c29%3A0xf37f77a4ef274530!2sFlorer%C3%ADa%20Floritel!5e0!3m2!1sen!2spe!4v1773457299751!5m2!1sen!2spe",
  messages: {
    whatsappDefault: "Hola Kataleya Flawers, quiero hacer un pedido.",
    whatsappFloat: "Hola, me gustaría hacer un pedido",
    whatsappProduct: (productName: string) =>
      `Hola, me interesa el producto: ${productName}`,
  },
} as const;
