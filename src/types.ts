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

export interface MotionPathConfig {
  containerClass: string;
  svgClass: string;
  viewBox: string;
  pathData: string;
  dropletPathData: string;
  sections: SectionConfig[];
  cupWrapperClass: string;
  scrollStart: string | number;
}
