import type { ReactElement } from 'react'
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

const SECTION_NUMBER_CLASS = ['section-number text-accent text-help font-normal tabular-nums'].join(' ')

const SPACES_SECTION_CLASS = 'spaces-section py-16 max-[700px]:py-12'

const SECTION_HEADING_CLASS = [
  'section-heading flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-5 [&_h2]:flex',
  '[&_h2]:items-center [&_h2]:gap-3 [&_h2]:m-0 [&_h2]:text-control [&_h2]:font-semibold',
  '[&_.eyebrow]:m-0 [&_.eyebrow]:text-help [&_.eyebrow]:tracking-[.1em]',
].join(' ')

const EYEBROW_CLASS = ['eyebrow text-help font-medium tracking-[1.5px] text-muted-foreground leading-[1.6]'].join(' ')

const SPACES_GRID_CLASS = 'spaces-grid grid grid-cols-2 gap-10 max-[700px]:grid-cols-1 max-[700px]:gap-0'

const SPACE_CARD_CLASS = [
  'space-card group grid grid-cols-[40px_1fr] gap-x-4 border-t border-border py-7 relative min-w-0',
  'wrap-anywhere [&_h3]:col-start-2 [&_h3]:m-0 [&_h3]:mb-2 [&_h3]:text-[length:21px]',
  '[&_h3]:font-medium [&_h3]:tracking-[-.025em] [&_>_p]:col-start-2 [&_>_p]:m-0 [&_>_p]:mb-4',
  '[&_>_p]:text-body [&_>_p]:text-muted-foreground [&_>_p]:leading-[1.8]',
  '[&:hover_.space-visit_svg]:translate-x-0.5 [&:hover_.space-visit_svg]:-translate-y-0.5',
].join(' ')

const SPACE_ICON_CLASS = [
  'space-icon row-span-4 grid place-items-center size-10 rounded-sm border border-border bg-muted',
  'text-accent',
].join(' ')

const SPACE_DOMAIN_CLASS = 'space-domain col-start-2 mb-3 text-help text-muted-foreground'

const SPACE_VISIT_CLASS = [
  'space-visit col-start-2 flex items-center gap-3 min-h-11 text-control [&_svg]:text-accent',
].join(' ')

const SPACE_CARD_CLASS_1 = [
  'space-card group grid grid-cols-[40px_1fr] gap-x-4 border-t border-border py-7 relative min-w-0',
  'wrap-anywhere [&_h3]:col-start-2 [&_h3]:m-0 [&_h3]:mb-2 [&_h3]:text-[length:21px]',
  '[&_h3]:font-medium [&_h3]:tracking-[-.025em] [&_>_p]:col-start-2 [&_>_p]:m-0 [&_>_p]:mb-4',
  '[&_>_p]:text-body [&_>_p]:text-muted-foreground [&_>_p]:leading-[1.8]',
  '[&:hover_.space-visit_svg]:translate-x-0.5 [&:hover_.space-visit_svg]:-translate-y-0.5',
].join(' ')

const SPACE_ICON_CLASS_2 = [
  'space-icon row-span-4 grid place-items-center size-10 rounded-sm border border-border bg-muted',
  'text-accent',
].join(' ')

const SPACE_DOMAIN_CLASS_3 = 'space-domain col-start-2 mb-3 text-help text-muted-foreground'

const SPACE_VISIT_CLASS_4 = [
  'space-visit col-start-2 flex items-center gap-3 min-h-11 text-control [&_svg]:text-accent',
].join(' ')

export function SpacesSection(): ReactElement {
  const t = useCopy()
  return (
    <section className={SPACES_SECTION_CLASS} id="spaces" aria-labelledby="spaces-heading">
      <div className={SECTION_HEADING_CLASS}>
        <h2 id="spaces-heading">
          <span className={SECTION_NUMBER_CLASS}>02</span>
          {t('spaces.heading')}
        </h2>
        <p className={EYEBROW_CLASS}>{t('spaces.note')}</p>
      </div>
      <div className={SPACES_GRID_CLASS}>
        <a
          className={SPACE_CARD_CLASS}
          href={LINKS.blog}
          aria-labelledby="blog-title"
        >
          <div
            className={SPACE_ICON_CLASS}
            aria-hidden="true"
          >
            <BookOpen size={23} />
          </div>
          <span className={SPACE_DOMAIN_CLASS}>
            blog.ztd.me
          </span>
          <h3 id="blog-title">{t('blog.title')}</h3>
          <p>{t('blog.description')}</p>
          <span className={SPACE_VISIT_CLASS}>
            {t('visit')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </a>
        <a
          className={SPACE_CARD_CLASS_1}
          href={LINKS.showcase}
          aria-labelledby="showcase-title"
        >
          <div
            className={SPACE_ICON_CLASS_2}
            aria-hidden="true"
          >
            <Sparkles size={23} />
          </div>
          <span className={SPACE_DOMAIN_CLASS_3}>
            showcase.ztd.me
          </span>
          <h3 id="showcase-title">{t('showcase.title')}</h3>
          <p>{t('showcase.description')}</p>
          <span className={SPACE_VISIT_CLASS_4}>
            {t('visit')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </a>
      </div>
    </section>
  )
}
