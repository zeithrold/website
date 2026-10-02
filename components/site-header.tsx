'use client'

import type { ReactElement } from 'react'
import { BrandMark } from '@/components/brand-mark'
import { PreferencesControls } from '@/components/preferences-controls'
import { useCopy } from '@/components/preferences-hooks'
import { SiteSectionLinks } from '@/components/site-section-links'

export { BrandMark } from '@/components/brand-mark'

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
      <SiteSectionLinks />
      <PreferencesControls />
    </header>
  )
}
