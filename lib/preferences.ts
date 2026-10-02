import { isRecord } from "./value-guards.ts";

export const PREFERENCES_KEY = "ztd.home.v1";
export type Locale = "en" | "zh-CN";
export type Theme = "light" | "dark";
export type Preferences = { locale: Locale; theme: Theme };

export function detectLocale(languages: readonly string[]): Locale {
  return languages.some((language) => /^zh(?:-|$)/i.test(language)) ? "zh-CN" : "en";
}

export function readPreferences(value: unknown, fallback: Preferences): Preferences {
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    locale: value.locale === "en" || value.locale === "zh-CN" ? value.locale : fallback.locale,
    theme: value.theme === "light" || value.theme === "dark" ? value.theme : fallback.theme,
  };
}
