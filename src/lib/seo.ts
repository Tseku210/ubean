import { DESCRIPTION, KEYWORDS } from "@/consts";
import type { Language } from "@/types";

export const getKeywords = (lang: Language): string => KEYWORDS[lang];

export const getDescription = (lang: Language): string => DESCRIPTION[lang];
