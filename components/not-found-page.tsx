'use client'

import type { ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { SiteShell } from '@/components/site-shell'

const NOT_FOUND_CLASS = [
  'not-found max-[700px]:pt-15 max-[700px]:px-0 max-[700px]:pb-[90px]',
  'max-[700px]:[&_h1]:text-[length:39px] pt-[90px] px-0 pb-30 [&_h1]:text-[length:48px] [&_h1]:max-w-150',
  '[&_>_p:not(.eyebrow)]:text-body [&_>_p:not(.eyebrow)]:text-muted-foreground',
  '[&_>_p:not(.eyebrow)]:leading-[1.9] [&_>_p:not(.eyebrow)]:my-7 [&_>_p:not(.eyebrow)]:mx-0',
  '[&_>_a]:inline-flex [&_>_a]:items-center [&_>_a]:gap-[10px] [&_>_a]:text-control [&_>_a]:min-h-11',
].join(' ')

const EYEBROW_CLASS = ['eyebrow text-help font-medium tracking-[1.5px] text-muted-foreground leading-[1.6]'].join(' ')

export function NotFoundPage(): ReactElement {
  const t = useCopy()
  return (
    <SiteShell>
      <section className={NOT_FOUND_CLASS}>
        <p className={EYEBROW_CLASS}>404</p>
        <h1>{t('notfound.title')}</h1>
        <p>{t('notfound.description')}</p>
        <a href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('notfound.back')}
        </a>
      </section>
    </SiteShell>
  )
}
