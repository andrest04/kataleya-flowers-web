import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kataleya Flawers",
    short_name: "Kataleya",
    description:
      "Floristería en Lima, Perú. Arreglos florales y orquídeas para celebraciones, homenajes y regalos.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfcfa",
    theme_color: "#c0392b",
    lang: "es-PE",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
