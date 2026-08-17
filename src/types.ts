import type { languages } from "./i18n/ui";

export interface Bean {
  name: string;
  image: string;
  description: string;
  price250: number;
  price500: number;
}

export interface AddOn {
  name: string;
  price: number;
  separate?: boolean;
}

export enum Category {
  coffee = "coffee",
  nonCoffee = "non-coffee",
  specialty = "specialty",
  grub = "grub",
}

export type Language = keyof typeof languages;

export type SectionKey = "beans" | "aroma" | "tools" | "products";

export interface SectionConfig {
  key: SectionKey;
  progress: number;
  className: string;
}

export interface CupPlacement {
  /** uniform scale of the local cup art */
  scale: number;
  /** rim-center position in the motion-path SVG's user space */
  cx: number;
  cy: number;
  /** droplet fall distance from path end to the coffee surface, in SVG units */
  fall: number;
}

export interface MotionPathConfig {
  width: string;
  height: string;
  containerClass: string;
  svgClass: string;
  viewBox: string;
  pathData: string;
  dropletPathData: string;
  sections: SectionConfig[];
  scrollStart: string | number;
  cup: CupPlacement;
}
