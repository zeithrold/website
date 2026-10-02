'use client'

import type { ReactElement, ReactNode } from 'react'
import { useCopy } from '@/components/preferences-hooks'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export { BrandMark } from '@/components/brand-mark'

export function SiteShell({ children }: { children: ReactNode }): ReactElement {
  const t = useCopy()
  return (
    <>
      <a className="skip-link" href="#main">{t('skip')}</a>
      <div className="site-shell" id="top">
        <SiteHeader />
        <main id="main" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </div>
    </>
  )
}
