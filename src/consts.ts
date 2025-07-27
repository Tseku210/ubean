import type { Bean, AddOn } from "./types";

export const BEANS: Bean[] = [
  {
    name: "BRAZIL",
    image: "brazil-bean.webp",
    description: "Mogiana NY2 FC",
    price250: 27000,
    price500: 48000,
  },
  {
    name: "ETHIOPIA",
    image: "ethiopia-bean.webp",
    description: "Yirgacheffe G2 Tierra",
    price250: 35000,
    price500: 55000,
  },
  {
    name: "GUATEMALA",
    image: "guatemala-bean.webp",
    description: "Yirgacheffe G2 Tierra",
    price250: 35000,
    price500: 55000,
  },
  {
    name: "DARK HORSE",
    image: "dark-horse-bean.webp",
    description: "Yirgacheffe G2 Tierra",
    price250: 35000,
    price500: 55000,
  },
  {
    name: "IRON HORSE",
    image: "iron-horse-bean.webp",
    description: "Yirgacheffe G2 Tierra",
    price250: 35000,
    price500: 55000,
  },
];

export const ADDONS = {
  en: [
    { name: "Decaf", price: 500 },
    { name: "Vanilla, Caramel", price: 500 },
    { name: "Butter", price: 1500, separate: true },
    { name: "Take Away /Per cup/", price: 500 },
  ],
  mn: [
    { name: "Кофеингүй", price: 500 },
    { name: "Ваниль, Карамель", price: 500 },
    { name: "Шар тос", price: 1500, separate: true },
    { name: "Авч явах /аяга тус бүр/", price: 500 },
  ],
} as const;
