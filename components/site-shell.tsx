'use client'

import type { ReactElement, ReactNode } from 'react'
import { PublicShell } from '@ztd-me/frontend/client'
import { ArrowUp } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { useCopy } from '@/components/preferences-hooks'
import { SiteSectionLinks } from '@/components/site-section-links'

export { BrandMark } from '@/components/brand-mark'

export function SiteShell({ children }: { children: ReactNode }): ReactElement {
  const t = useCopy()
  return (
    <PublicShell
      brand={{ label: 'zeithrold.', homeHref: '/', mark: <BrandMark /> }}
      footer={{
        copyright: '© Zeithrold',
        links: [
          { label: 'GitHub', href: 'https://github.com/zeithrold/website', ariaLabel: t('footer.source') },
          { label: 'hello@ztd.me', href: 'mailto:hello@ztd.me' },
        ],
      }}
      mainId="main"
    >
      <div className="site-content" id="top">
        <SiteSectionLinks />
        {children}
        <div className="site-afterword">
          <p>{t('footer.description')}</p>
          <a href="#top" className="back-top">
            {t('footer.back')}
            <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </PublicShell>
  )
}
