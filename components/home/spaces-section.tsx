import type { ReactElement } from 'react'
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

export function SpacesSection(): ReactElement {
  const t = useCopy()
  return (
    <section className="spaces-section" id="spaces" aria-labelledby="spaces-heading">
      <div className="section-heading">
        <h2 id="spaces-heading">
          <span className="section-number">02</span>
          {t('spaces.heading')}
        </h2>
        <p className="eyebrow">{t('spaces.note')}</p>
      </div>
      <div className="spaces-grid">
        <a className="space-card" href={LINKS.blog} aria-labelledby="blog-title">
          <div className="space-icon" aria-hidden="true"><BookOpen size={23} /></div>
          <span className="space-domain">blog.ztd.me</span>
          <h3 id="blog-title">{t('blog.title')}</h3>
          <p>{t('blog.description')}</p>
          <span className="space-visit">
            {t('visit')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </a>
        <a className="space-card" href={LINKS.showcase} aria-labelledby="showcase-title">
          <div className="space-icon showcase-icon" aria-hidden="true"><Sparkles size={23} /></div>
          <span className="space-domain">showcase.ztd.me</span>
          <h3 id="showcase-title">{t('showcase.title')}</h3>
          <p>{t('showcase.description')}</p>
          <span className="space-visit">
            {t('visit')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </a>
      </div>
    </section>
  )
}
