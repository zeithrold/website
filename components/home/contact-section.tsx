import type { ReactElement } from 'react'
import { ArrowUpRight, Mail } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

export function ContactSection(): ReactElement {
  const t = useCopy()
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div>
        <p className="eyebrow">{t('contact.eyebrow')}</p>
        <h2 id="contact-heading">{t('contact.heading')}</h2>
        <p className="contact-description">{t('contact.description')}</p>
      </div>
      <a className="email-link" href={LINKS.email}>
        <Mail size={21} aria-hidden="true" />
        <span>hello@ztd.me</span>
        <ArrowUpRight size={25} aria-hidden="true" />
      </a>
    </section>
  )
}
