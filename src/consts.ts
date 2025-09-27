import type { Bean, Language } from "./types";

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

export const ADDONS: Record<
  Language,
  { name: string; price: number; separate?: boolean }[]
> = {
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

export const KEYWORDS: Record<Language, string> = {
  en: "ubean, coffee shop, roastery, coffee, beans, premium, espresso, americano",
  mn: "UBean, кофе, кофе шоп, латте, шилдэг кофе, эспрессо, американо, дээд зэрэглэлийн, хуурах, ориг",
};

export const DESCRIPTION: Record<Language, string> = {
  en: "UBean - Premium Coffee Experience",
  mn: "UBean - Шинэ кофе",
};

export const FEEDBACK_KEY = "is_sent_feedback";
