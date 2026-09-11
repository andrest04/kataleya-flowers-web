import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { floristSeoDescription } from "@/lib/siteSettings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();

  return {
    name: settings.name,
    short_name: "Kataleya",
    description: floristSeoDescription(settings),
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
