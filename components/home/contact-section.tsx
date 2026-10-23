import type { ReactElement } from 'react'
import { ArrowUpRight, Mail } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

const CONTACT_SECTION_CLASS = [
  'contact-section flex items-center justify-between gap-10 border-t border-border pt-10 pb-12 mb-5',
  'min-w-0 wrap-anywhere [&_.eyebrow]:text-help [&_.eyebrow]:mb-4 [&_h2]:text-[length:26px]',
  '[&_h2]:font-medium [&_h2]:tracking-[-.035em] [&_h2]:m-0 [&_h2]:mb-3 max-[700px]:block',
  'max-[700px]:pt-8 max-[700px]:pb-9',
].join(' ')

const EYEBROW_CLASS = ['eyebrow text-help font-medium tracking-[1.5px] text-muted-foreground leading-[1.6]'].join(' ')

const CONTACT_DESCRIPTION_CLASS = 'contact-description max-w-90 m-0 text-body text-muted-foreground leading-[1.8]'

const EMAIL_LINK_CLASS = [
  'email-link inline-flex items-center gap-3 min-h-12 text-[length:23px] tracking-[-.035em]',
  '[&_>_svg]:text-accent [&:hover_span]:underline [&:hover_span]:underline-offset-4 max-[700px]:mt-5',
  'max-[360px]:text-[length:21px]',
].join(' ')

export function ContactSection(): ReactElement {
  const t = useCopy()
  return (
    <section
      className={CONTACT_SECTION_CLASS}
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div>
        <p className={EYEBROW_CLASS}>{t('contact.eyebrow')}</p>
        <h2 id="contact-heading">{t('contact.heading')}</h2>
        <p className={CONTACT_DESCRIPTION_CLASS}>
          {t('contact.description')}
        </p>
      </div>
      <a
        className={EMAIL_LINK_CLASS}
        href={LINKS.email}
      >
        <Mail size={21} aria-hidden="true" />
        <span>hello@ztd.me</span>
        <ArrowUpRight size={25} aria-hidden="true" />
      </a>
    </section>
  )
}
