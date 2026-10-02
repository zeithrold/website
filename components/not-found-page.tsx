'use client'

import type { ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { SiteShell } from '@/components/site-shell'

export function NotFoundPage(): ReactElement {
  const t = useCopy()
  return (
    <SiteShell>
      <section className="not-found">
        <p className="eyebrow">404</p>
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
