import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kataleya Flawers",
    short_name: "Kataleya",
    description:
      "Floristería en Lima, Perú. Arreglos florales y orquídeas para celebraciones, homenajes y regalos.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfcfa", // --color-cream
    theme_color: "#c0392b", // --color-primary
    lang: "es-PE",
    icons: [
      // TODO: cuando el usuario provea los iconos PWA, agregar:
      //   { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }
      //   { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
      //   { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
