import en from "@/messages/en.json";
import es from "@/messages/es.json";

export type Locale = "en" | "es";
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: readonly Locale[] = ["en", "es"] as const;

export const DICTIONARIES = { en, es } as const;
export type Dictionary = typeof en;

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
