import type { Variants } from "framer-motion";

export type CampaignMode = "contact" | "catalog";

export interface HeroSlide {
  readonly id: number;
  readonly image: string;
  /** Color de fallback si la imagen no carga. */
  readonly bgColor: string;
  readonly label: string;
  readonly sublabel: string;
}

export type SlideVariants = Variants;
