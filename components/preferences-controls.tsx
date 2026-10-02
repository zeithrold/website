"use client";

import type { ReactElement } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy, useSitePreferences } from "@/components/preferences-provider";

export function PreferencesControls(): ReactElement {
  const t = useCopy();
  const { preferences, ready, update } = useSitePreferences();
  return (
    <div className="preferences">
      <Button
        type="button"
        variant="ghost"
        className="language-button"
        disabled={!ready}
        aria-label={t("language")}
        onClick={() => update({ locale: preferences.locale === "en" ? "zh-CN" : "en" })}
      >
        <span aria-hidden="true">{preferences.locale === "en" ? "EN" : "中"}</span>
      </Button>
      <span className="nav-divider" aria-hidden="true" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="theme-button"
        disabled={!ready}
        aria-label={t(preferences.theme === "light" ? "dark" : "light")}
        onClick={() => update({ theme: preferences.theme === "light" ? "dark" : "light" })}
      >
        {preferences.theme === "light"
          ? <Moon size={17} aria-hidden="true" />
          : <Sun size={17} aria-hidden="true" />}
      </Button>
    </div>
  );
}
