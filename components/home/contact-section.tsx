import type { ReactElement } from 'react'
import { ArrowUpRight, Mail } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

const CONTACT_SECTION_CLASS = [
  'contact-section max-[960px]:p-8 max-[960px]:gap-[25px] max-[700px]:p-7 max-[700px]:block',
  'max-[700px]:mb-[38px] max-[700px]:[&_h2]:text-[length:27px] max-[360px]:p-[23px] flex items-center',
  'justify-between gap-[38px] py-[37px] px-[39px] bg-muted border',
  'border-[color-mix(in_srgb,_var(--ztd-accent)_15%,_var(--ztd-border))] rounded-[18px] mb-[57px]',
  '[&_.eyebrow]:text-accent [&_.eyebrow]:text-help [&_.eyebrow]:mt-0 [&_.eyebrow]:mx-0 [&_.eyebrow]:mb-3',
  '[&_h2]:font-sans [&_h2]:text-[length:30px] [&_h2]:font-medium [&_h2]:tracking-[-.85px]',
  '[&_h2]:leading-[1.3] [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-3 min-w-0 wrap-anywhere',
].join(' ')

const EYEBROW_CLASS = ['eyebrow text-help font-medium tracking-[1.5px] text-muted-foreground leading-[1.6]'].join(' ')

const CONTACT_DESCRIPTION_CLASS = [
  'contact-description max-[700px]:text-body max-[700px]:max-w-[290px] max-w-[345px] m-0 text-body',
  'text-foreground leading-[1.85]',
].join(' ')

const EMAIL_LINK_CLASS = [
  'email-link max-[960px]:text-[length:25px] max-[960px]:gap-[11px]',
  'max-[960px]:[&_>_svg:first-child]:hidden max-[700px]:text-[length:29px] max-[700px]:mt-[23px]',
  'max-[700px]:gap-3 max-[700px]:[&_>_svg:first-child]:block max-[700px]:[&_>_svg:first-child]:w-[19px]',
  'max-[700px]:[&_>_svg:last-child]:w-[21px] max-[700px]:[&_>_svg:last-child]:ml-auto',
  'max-[360px]:text-[length:25px] max-[360px]:gap-2 flex items-center gap-[15px] font-sans',
  'text-[length:29px] tracking-[-.8px] min-h-12 whitespace-nowrap [&_>_svg]:text-accent',
  '[&:hover_span]:underline [&:hover_span]:underline-offset-[6px]',
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
