export const PREFERENCES_KEY = "ztd.home.v1";
export type Locale = "en" | "zh-CN";
export type Theme = "light" | "dark";
export type Preferences = { locale: Locale; theme: Theme };

export function detectLocale(languages: readonly string[]): Locale {
  return languages.some((language) => /^zh(?:-|$)/i.test(language)) ? "zh-CN" : "en";
}

export function readPreferences(value: unknown, fallback: Preferences): Preferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const record = value as Record<string, unknown>;
  return {
    locale: record.locale === "en" || record.locale === "zh-CN" ? record.locale : fallback.locale,
    theme: record.theme === "light" || record.theme === "dark" ? record.theme : fallback.theme,
  };
}
