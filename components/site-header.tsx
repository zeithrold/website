'use client'

import type { ReactElement } from 'react'
import { PreferencesControls } from '@/components/preferences-controls'
import { useCopy } from '@/components/preferences-hooks'

export function BrandMark(): ReactElement {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

export function SiteHeader(): ReactElement {
  const t = useCopy()
  return (
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
  )
}
