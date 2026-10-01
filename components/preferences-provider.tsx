"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { en, zh, type CopyKey } from "@/lib/copy";
import { detectLocale, PREFERENCES_KEY, readPreferences, type Preferences } from "@/lib/preferences";

const PreferencesContext = createContext<{
  preferences: Preferences;
  ready: boolean;
  update: (values: Partial<Preferences>) => void;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.init({
      lng: "en", fallbackLng: "en", supportedLngs: ["en", "zh-CN"],
      resources: { en: { translation: en }, "zh-CN": { translation: zh } },
      keySeparator: false, initAsync: false,
      interpolation: { escapeValue: false }, react: { useSuspense: false },
    });
    return i18n;
  });
  const [preferences, setPreferences] = useState<Preferences>({ locale: "en", theme: "light" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restored: Preferences = {
      locale: detectLocale(navigator.languages),
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    };
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) restored = readPreferences(JSON.parse(saved), restored);
    } catch { /* Preferences remain usable when storage is unavailable. */ }
    setPreferences(restored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", preferences.theme === "dark");
    document.documentElement.lang = preferences.locale;
    void instance.changeLanguage(preferences.locale);
    const description = instance.getFixedT(preferences.locale)("meta.description");
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); } catch { /* Optional storage. */ }
  }, [instance, preferences, ready]);

  const update = (values: Partial<Preferences>) => setPreferences((current) => ({ ...current, ...values }));
  return <I18nextProvider i18n={instance}><PreferencesContext.Provider value={{ preferences, ready, update }}>{children}</PreferencesContext.Provider></I18nextProvider>;
}

export function useSitePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("useSitePreferences requires PreferencesProvider");
  return context;
}

export function useCopy() {
  const { t } = useTranslation();
  return (key: CopyKey) => t(key);
}
