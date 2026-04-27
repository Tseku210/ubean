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
    price500: 70000,
  },
  {
    name: "GUATEMALA",
    image: "guatemala-bean.webp",
    description: "Antigua SHB Margarita",
    price250: 35000,
    price500: 53000,
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
    description: "Espresso",
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

export const DESKTOP_SVG_PATH =
  "M535 1C535 50.9818 494.482 91.5 444.5 91.5H154.5C79.9416 91.5 19.5 151.942 19.5 226.5V526C19.5 600.558 79.9416 661 154.5 661H400C474.558 661 535 721.442 535 796V1346C535 1420.56 595.442 1481 670 1481H884.5C959.058 1481 1019.5 1541.44 1019.5 1616V2223.5C1019.5 2298.06 959.058 2358.5 884.5 2358.5H136C61.4416 2358.5 1 2418.94 1 2493.5V2793C1 2867.56 61.4416 2928 136 2928H447C496.153 2928 536 2967.85 536 3017";

export const MOBILE_SVG_PATH =
  "M181 0V20.5C181 59.1599 149.66 90.5 111 90.5H71C32.3401 90.5 1 121.84 1 160.5V590C1 628.66 32.3401 660 71 660H113.5C152.16 660 183.5 691.34 183.5 730V1030C183.5 1068.66 214.84 1100 253.5 1100H290C328.66 1100 360 1131.34 360 1170V1647.5C360 1686.16 328.66 1717.5 290 1717.5H71.5C32.8401 1717.5 1.5 1748.84 1.5 1787.5V2117C1.5 2155.66 32.8401 2187 71.5 2187H110.5C149.16 2187 180.5 2218.34 180.5 2257V2276";
