'use client'

import type { ReactElement } from 'react'
import { ArrowUp, GitBranch as Github } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

export function SiteFooter(): ReactElement {
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
