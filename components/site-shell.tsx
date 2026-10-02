'use client'

import type { ReactElement, ReactNode } from 'react'
import { ArrowUp, GitBranch as Github } from 'lucide-react'
import { PreferencesControls } from '@/components/preferences-controls'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

export function BrandMark(): ReactElement {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function SiteFooter(): ReactElement {
  const t = useCopy()
  return (
    <footer className="site-footer">
      <p>
        © 2026 Zeithrold
        <span className="footer-separator">/</span>
        <span className="footer-caption">{t('footer.description')}</span>
      </p>
      <div>
        <a href={LINKS.github} aria-label="GitHub"><Github size={16} aria-hidden="true" /></a>
        <a href="#top" className="back-top">
          {t('footer.back')}
          <ArrowUp size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}

export function SiteShell({ children }: { children: ReactNode }): ReactElement {
  const t = useCopy()
  return (
    <>
      <a className="skip-link" href="#main">{t('skip')}</a>
      <div className="site-shell" id="top">
        <header className="site-header">
          <a href="/" className="brand" aria-label={t('home')}>
            <BrandMark />
            <span>
              zeithrold
              <span className="brand-period">.</span>
            </span>
          </a>
          <nav className="header-nav" aria-label={t('navigation')}>
            <a className="nav-link" href="/#projects">{t('work')}</a>
            <a className="nav-link" href="/#spaces">{t('spaces')}</a>
            <a className="nav-link" href="/#contact">{t('contact')}</a>
          </nav>
          <PreferencesControls />
        </header>
        <main id="main" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </div>
    </>
  )
}
