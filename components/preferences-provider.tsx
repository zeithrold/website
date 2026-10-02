"use client";

import type { ReactNode, ReactElement } from "react";
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import type { CopyKey } from "@/lib/copy";
import { persistBrowserPreferences, restoreBrowserPreferences } from "@/lib/browser-preferences";
import type { Preferences } from "@/lib/preferences";
import { createPreferencesStore } from "@/lib/preferences-store";
import { applySitePreferences, createSiteI18n } from "@/lib/site-i18n";

type SitePreferences = {
  preferences: Preferences;
  ready: boolean;
  update: (values: Partial<Preferences>) => void;
};
const PreferencesContext = createContext<SitePreferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }): ReactElement {
  const instance = useMemo(createSiteI18n, []);
  const store = useMemo(() => createPreferencesStore(restoreBrowserPreferences), []);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const value = useMemo(() => ({ ...snapshot, update: store.update }), [snapshot, store]);

  useEffect(() => {
    if (!snapshot.ready) {
      return;
    }
    applySitePreferences(instance, snapshot.preferences);
    persistBrowserPreferences(snapshot.preferences);
  }, [instance, snapshot]);

  return (
    <I18nextProvider i18n={instance}>
      <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
    </I18nextProvider>
  );
}

export function useSitePreferences(): SitePreferences {
  const context = useContext(PreferencesContext);
  if (context === null) {
    throw new Error("useSitePreferences requires PreferencesProvider");
  }
  return context;
}

export function useCopy(): (key: CopyKey) => string {
  const { t } = useTranslation();
  return (key) => t(key);
}
