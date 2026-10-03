'use client'

import type { ReactElement } from 'react'
import { useCopy } from '@/components/preferences-hooks'

export function SiteSectionLinks(): ReactElement {
  const t = useCopy()
  return (
    <nav className="site-section-links" aria-label={t('navigation')}>
      <a className="nav-link" href="/#projects">{t('work')}</a>
      <a className="nav-link" href="/#spaces">{t('spaces')}</a>
      <a className="nav-link" href="/#contact">{t('contact')}</a>
    </nav>
  )
}
