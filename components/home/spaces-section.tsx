import type { ReactElement } from 'react'
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS } from '@/lib/projects'

const SECTION_NUMBER_CLASS = ['section-number text-accent text-help font-normal tabular-nums'].join(' ')

const SPACES_SECTION_CLASS = [
  'spaces-section max-[700px]:pt-11 max-[700px]:px-0 max-[700px]:pb-[39px] pt-[61px] px-0 pb-15',
].join(' ')

const SECTION_HEADING_CLASS = [
  'section-heading flex items-center justify-between gap-5 mb-[22px] [&_h2]:flex [&_h2]:items-center',
  '[&_h2]:gap-[13px] [&_h2]:m-0 [&_h2]:text-control [&_h2]:font-semibold [&_.eyebrow]:m-0',
  '[&_.eyebrow]:text-help [&_.eyebrow]:tracking-[1.2px] max-[700px]:mb-[18px]',
  'max-[700px]:[&_h2]:text-control max-[700px]:[&_h2]:gap-[10px] max-[700px]:[&_.eyebrow]:text-help',
  'max-[700px]:[&_.eyebrow]:tracking-[.8px] max-[700px]:[&_.eyebrow]:text-right',
  'max-[700px]:[&_.eyebrow]:max-w-[130px] max-[360px]:[&_.eyebrow]:max-w-[110px]',
  'max-[360px]:[&_.eyebrow]:text-help flex-wrap [&_.eyebrow]:max-w-none [&_.eyebrow]:[text-align:start]',
  'max-[700px]:items-start max-[700px]:gap-y-2 max-[700px]:gap-x-4',
].join(' ')

const EYEBROW_CLASS = ['eyebrow text-help font-medium tracking-[1.5px] text-muted-foreground leading-[1.6]'].join(' ')

const SPACES_GRID_CLASS = [
  'spaces-grid max-[700px]:grid-cols-[1fr] max-[700px]:gap-[18px] grid',
  'grid-cols-[repeat(2,_minmax(0,_1fr))] gap-6',
].join(' ')

const SPACE_CARD_CLASS = [
  'space-card max-[700px]:p-[25px] max-[700px]:[&_>_p]:min-h-0 max-[700px]:[&_>_p]:max-w-[310px] block',
  'relative bg-card border border-border rounded-[16px] p-7 [transition:border-color_.2s,_box-shadow_.2s]',
  'hover:border-[color-mix(in_srgb,_var(--ztd-accent)_50%,_var(--ztd-border))]',
  'hover:shadow-[0_7px_24px_var(--shadow-hover)] [&_h3]:font-sans [&_h3]:mt-0 [&_h3]:mx-0',
  '[&_h3]:mb-[10px] [&_h3]:text-[length:23px] [&_h3]:font-medium [&_h3]:tracking-[-.5px] [&_>_p]:mt-0',
  '[&_>_p]:mx-0 [&_>_p]:mb-[15px] [&_>_p]:text-muted-foreground [&_>_p]:text-body [&_>_p]:leading-[1.9]',
  '[&_>_p]:max-w-[350px] [&:hover_.space-visit_svg]:transform-[translate(2px,_-2px)] [&_>_p]:min-h-0',
  'min-w-0 wrap-anywhere',
].join(' ')

const SPACE_ICON_CLASS = [
  'space-icon flex items-center justify-center w-[45px] h-[45px] rounded-[10px] bg-muted',
  'text-muted-foreground mb-[21px]',
].join(' ')

const SPACE_DOMAIN_CLASS = [
  'space-domain max-[700px]:right-[25px] max-[700px]:top-[39px] absolute top-[41px] right-7',
  'text-muted-foreground text-help max-[700px]:[position:static] max-[700px]:block max-[700px]:mb-3',
].join(' ')

const SPACE_VISIT_CLASS = [
  'space-visit flex items-center gap-[11px] text-control [&_svg]:text-accent',
  '[&_svg]:[transition:transform_.2s]',
].join(' ')

const SPACE_CARD_CLASS_1 = [
  'space-card max-[700px]:p-[25px] max-[700px]:[&_>_p]:min-h-0 max-[700px]:[&_>_p]:max-w-[310px] block',
  'relative bg-card border border-border rounded-[16px] p-7 [transition:border-color_.2s,_box-shadow_.2s]',
  'hover:border-[color-mix(in_srgb,_var(--ztd-accent)_50%,_var(--ztd-border))]',
  'hover:shadow-[0_7px_24px_var(--shadow-hover)] [&_h3]:font-sans [&_h3]:mt-0 [&_h3]:mx-0',
  '[&_h3]:mb-[10px] [&_h3]:text-[length:23px] [&_h3]:font-medium [&_h3]:tracking-[-.5px] [&_>_p]:mt-0',
  '[&_>_p]:mx-0 [&_>_p]:mb-[15px] [&_>_p]:text-muted-foreground [&_>_p]:text-body [&_>_p]:leading-[1.9]',
  '[&_>_p]:max-w-[350px] [&:hover_.space-visit_svg]:transform-[translate(2px,_-2px)] [&_>_p]:min-h-0',
  'min-w-0 wrap-anywhere',
].join(' ')

const SPACE_ICON_CLASS_2 = [
  'space-icon showcase-icon flex items-center justify-center w-[45px] h-[45px] rounded-[10px] mb-[21px]',
  'bg-muted text-accent',
].join(' ')

const SPACE_DOMAIN_CLASS_3 = [
  'space-domain max-[700px]:right-[25px] max-[700px]:top-[39px] absolute top-[41px] right-7',
  'text-muted-foreground text-help max-[700px]:[position:static] max-[700px]:block max-[700px]:mb-3',
].join(' ')

const SPACE_VISIT_CLASS_4 = [
  'space-visit flex items-center gap-[11px] text-control [&_svg]:text-accent',
  '[&_svg]:[transition:transform_.2s]',
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
