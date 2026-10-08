'use client'

import type { ReactElement } from 'react'
import { useCopy } from '@/components/preferences-hooks'

const SITE_SECTION_LINKS_CLASS = [
  'site-section-links flex items-center gap-[30px] ml-auto justify-end pt-3 max-[700px]:gap-[17px]',
  'max-[520px]:gap-[25px] max-[520px]:ml-0 flex-wrap',
].join(' ')

const NAV_LINK_CLASS = [
  'nav-link flex items-center min-h-11 text-control text-muted-foreground hover:text-foreground',
  'max-[700px]:text-control max-[520px]:min-h-11',
].join(' ')

const NAV_LINK_CLASS_1 = [
  'nav-link flex items-center min-h-11 text-control text-muted-foreground hover:text-foreground',
  'max-[700px]:text-control max-[520px]:min-h-11',
].join(' ')

const NAV_LINK_CLASS_2 = [
  'nav-link flex items-center min-h-11 text-control text-muted-foreground hover:text-foreground',
  'max-[700px]:text-control max-[520px]:min-h-11',
].join(' ')

export function SiteSectionLinks(): ReactElement {
  const t = useCopy()
  return (
    <nav
      className={SITE_SECTION_LINKS_CLASS}
      aria-label={t('navigation')}
    >
      <a
        className={NAV_LINK_CLASS}
        href="/#projects"
      >
        {t('work')}
      </a>
      <a
        className={NAV_LINK_CLASS_1}
        href="/#spaces"
      >
        {t('spaces')}
      </a>
      <a
        className={NAV_LINK_CLASS_2}
        href="/#contact"
      >
        {t('contact')}
      </a>
    </nav>
  )
}
