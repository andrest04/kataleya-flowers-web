import type { Variants } from "framer-motion";

export type CampaignMode = "contact" | "catalog";

export interface HeroSlide {
  readonly id: number;
  readonly image: string;
  /** Color de fallback si la imagen no carga. */
  readonly bgColor: string;
  readonly label: string;
  readonly sublabel: string;
  /**
   * `object-position` para el recorte en MOBILE (portrait). Las fotos tienen el
   * ramo corrido a la derecha; centrar el cover lo parte, así que se encuadra
   * a la derecha. En desktop el recorte horizontal es mínimo → se usa `center`.
   */
  readonly focus?: string;
}

export type SlideVariants = Variants;
