"use client";

import { ArrowUp, GitBranch as Github, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy, useSitePreferences } from "@/components/preferences-provider";
import { LINKS } from "@/lib/projects";
import type { ReactNode } from "react";

export function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const t = useCopy();
  const { preferences, ready, update } = useSitePreferences();
  return <>
    <a className="skip-link" href="#main">{t("skip")}</a>
    <div className="site-shell" id="top">
      <header className="site-header">
        <a href="/" className="brand" aria-label={t("home")}><BrandMark /><span>zeithrold<span className="brand-period">.</span></span></a>
        <nav className="header-nav" aria-label={t("navigation")}>
          <a className="nav-link" href="/#projects">{t("work")}</a>
          <a className="nav-link" href="/#spaces">{t("spaces")}</a>
          <a className="nav-link" href="/#contact">{t("contact")}</a>
        </nav>
        <div className="preferences">
          <Button variant="ghost" className="language-button" disabled={!ready} aria-label={t("language")} onClick={() => update({ locale: preferences.locale === "en" ? "zh-CN" : "en" })}>
            <span aria-hidden="true">{preferences.locale === "en" ? "EN" : "中"}</span>
          </Button>
          <span className="nav-divider" aria-hidden="true" />
          <Button variant="ghost" size="icon" className="theme-button" disabled={!ready} aria-label={t(preferences.theme === "light" ? "dark" : "light")} onClick={() => update({ theme: preferences.theme === "light" ? "dark" : "light" })}>
            {preferences.theme === "light" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
          </Button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer className="site-footer">
        <p>© 2026 Zeithrold<span className="footer-separator">/</span><span className="footer-caption">{t("footer.description")}</span></p>
        <div><a href={LINKS.github} aria-label="GitHub"><Github size={16} aria-hidden="true" /></a><a href="#top" className="back-top">{t("footer.back")}<ArrowUp size={14} aria-hidden="true" /></a></div>
      </footer>
    </div>
  </>;
}
