'use client'

import type { ReactElement, ReactNode } from 'react'
import { ArrowUp } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { useCopy } from '@/components/preferences-hooks'
import { SiteSectionLinks } from '@/components/site-section-links'
import { PublicShell } from '@/components/ui/ztd-me/client'

const SITE_CONTENT_CLASS = [
  'site-content w-[min(1080px,_calc(100%_-_96px))] my-0 mx-auto max-[960px]:w-[calc(100%_-_64px)]',
  'max-[700px]:w-[calc(100%_-_40px)] max-[360px]:w-[calc(100%_-_32px)]',
].join(' ')

const SITE_AFTERWORD_CLASS = [
  'site-afterword max-[700px]:pt-4 max-[700px]:px-0 max-[700px]:pb-5 flex items-center justify-between',
  'gap-6 pt-[26px] px-0 pb-[31px] border-t border-border text-muted-foreground [&_p]:flex',
  '[&_p]:items-center [&_p]:m-0 [&_p]:text-body [&_a]:inline-flex [&_a]:min-h-11 [&_a]:min-w-8',
  '[&_a]:items-center [&_a]:justify-center [&_a:hover]:text-foreground',
].join(' ')

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
      <div
        className={SITE_CONTENT_CLASS}
        id="top"
      >
        <SiteSectionLinks />
        {children}
        <div className={SITE_AFTERWORD_CLASS}>
          <p>{t('footer.description')}</p>
          <a href="#top" className="back-top gap-[9px] text-help">
            {t('footer.back')}
            <ArrowUp size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </PublicShell>
  )
}
