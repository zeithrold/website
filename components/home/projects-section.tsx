import type { ReactElement } from 'react'
import { ArrowUpRight, Terminal } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS, PROJECTS } from '@/lib/projects'
import { ProjectVisual } from './project-visual'

const SECTION_NUMBER_CLASS = ['section-number text-accent text-help font-normal tabular-nums'].join(' ')

const PROJECT_CARD_CLASS = [
  'project-card bg-card border border-border rounded-[20px] overflow-hidden p-[15px] max-[700px]:p-[13px]',
  'min-w-0 wrap-anywhere',
].join(' ')

const PROJECT_CONTENT_CLASS = [
  'project-content pt-[25px] px-[13px] pb-[6px] [&_h3]:font-sans [&_h3]:text-[length:29px]',
  '[&_h3]:font-medium [&_h3]:tracking-[-1px] [&_h3]:mt-0 [&_h3]:mx-0 [&_h3]:mb-3 max-[700px]:pt-[22px]',
  'max-[700px]:px-[10px] max-[700px]:pb-1',
].join(' ')

const PROJECT_CATEGORY_CLASS = [
  'project-category flex gap-3 mt-0 mx-0 mb-[10px] text-help tracking-[1.2px] text-muted-foreground',
  '[&_>_span]:text-accent [&_>_span]:tabular-nums [&_>_span]:tracking-[0]',
].join(' ')

const PROJECT_DESCRIPTION_CLASS = [
  'project-description m-0 text-muted-foreground text-body leading-[1.85] max-w-[415px]',
  'max-[700px]:min-h-0 max-[700px]:text-body min-h-0',
].join(' ')

const PROJECT_TAGS_CLASS = [
  'project-tags list-none flex flex-wrap gap-[7px] p-0 my-[18px] mx-0 [&_li]:text-muted-foreground',
  '[&_li]:border [&_li]:border-border [&_li]:rounded-[5px] [&_li]:py-1 [&_li]:px-[7px] [&_li]:text-help',
  'max-[700px]:my-[17px] max-[700px]:mx-0',
].join(' ')

const PROJECT_LINKS_CLASS = [
  'project-links flex items-center gap-[25px] border-t border-border pt-2 [&_a]:inline-flex',
  '[&_a]:items-center [&_a]:gap-[10px] [&_a]:text-control [&_a]:min-h-11 [&_svg]:text-accent',
  '[&_a:hover]:text-accent flex-wrap',
].join(' ')

const TOOLS_CARD_CLASS = [
  'tools-card flex items-center gap-5 py-[22px] px-7 border border-border rounded-[14px] mt-5 bg-card',
  'max-[700px]:p-5 max-[700px]:gap-[14px] max-[700px]:items-start min-w-0 wrap-anywhere',
].join(' ')

const TOOLS_ICON_CLASS = [
  'tools-icon flex items-center justify-center w-[46px] h-[46px] bg-muted border border-border',
  'rounded-[10px] shrink-0 text-muted-foreground max-[700px]:w-[38px] max-[700px]:h-[38px]',
  'max-[700px]:rounded-[8px]',
].join(' ')

const TOOLS_BODY_CLASS = [
  'tools-body flex-1 min-w-0 [&_>_p]:text-muted-foreground [&_>_p]:text-body [&_>_p]:leading-[1.85]',
  '[&_>_p]:mt-2 [&_>_p]:mx-0 [&_>_p]:mb-0 max-[700px]:[&_>_p]:text-body max-[700px]:[&_>_p]:mt-2',
].join(' ')

const TOOLS_HEADING_CLASS = [
  'tools-heading flex items-center flex-wrap gap-[14px] [&_h3]:m-0 [&_h3]:text-control [&_h3]:font-medium',
  '[&_h3]:tracking-[-.25px] max-[700px]:gap-y-[6px] max-[700px]:gap-x-3 max-[700px]:[&_h3]:text-control',
].join(' ')

const STAGE_BADGE_CLASS = [
  'stage-badge flex items-center gap-[6px] text-help text-accent [&_>_span]:w-1 [&_>_span]:h-1',
  '[&_>_span]:rounded-full [&_>_span]:bg-accent',
].join(' ')

const TOOLS_LINK_CLASS = [
  'tools-link flex items-center gap-[14px] min-h-11 text-control [&_svg]:text-accent hover:text-accent',
  'max-[700px]:min-w-6 max-[700px]:[&_span]:hidden',
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

const PROJECT_GRID_CLASS = [
  'project-grid grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-6 max-[700px]:grid-cols-[1fr]',
  'max-[700px]:gap-[18px]',
].join(' ')

const SECTION_FOOTNOTE_CLASS = [
  'section-footnote mt-3 mx-[3px] mb-0 text-help text-muted-foreground text-right leading-[1.7]',
  'max-[700px]:text-help max-[700px]:text-left max-[700px]:ml-0',
].join(' ')

type Project = (typeof PROJECTS)[number]

function ProjectCard({ project, index }: { project: Project, index: number }): ReactElement {
  const t = useCopy()
  return (
    <article
      className={PROJECT_CARD_CLASS}
      aria-labelledby={`${project.id}-title`}
    >
      <ProjectVisual id={project.id} />
      <div className={PROJECT_CONTENT_CLASS}>
        <p className={PROJECT_CATEGORY_CLASS}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          {t(project.category)}
        </p>
        <h3 id={`${project.id}-title`}>{t(project.title)}</h3>
        <p className={PROJECT_DESCRIPTION_CLASS}>
          {t(project.description)}
        </p>
        <ul
          className={PROJECT_TAGS_CLASS}
          aria-label={t('technologies')}
        >
          {project.tags.map(tag => (
            <li key={tag}>{tag === 'Multi-currency' ? t('tag.multicurrency') : tag}</li>
          ))}
        </ul>
        <div className={PROJECT_LINKS_CLASS}>
          {project.links.map(link => (
            <a href={link.href} key={link.href} aria-label={`${t(link.label)} · ${t(project.title)}`}>
              {t(link.label)}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

function ToolsCard(): ReactElement {
  const t = useCopy()
  return (
    <article
      className={TOOLS_CARD_CLASS}
      aria-labelledby="tools-title"
    >
      <div
        className={TOOLS_ICON_CLASS}
        aria-hidden="true"
      >
        <Terminal size={22} />
      </div>
      <div className={TOOLS_BODY_CLASS}>
        <div className={TOOLS_HEADING_CLASS}>
          <h3 id="tools-title">{t('tools.title')}</h3>
          <span className={STAGE_BADGE_CLASS}>
            <span aria-hidden="true" />
            {t('tools.stage')}
          </span>
        </div>
        <p>{t('tools.description')}</p>
      </div>
      <a
        href={LINKS.tools}
        className={TOOLS_LINK_CLASS}
        aria-label={`${t('source')} · zeithrold/tools`}
      >
        <span>{t('source')}</span>
        <ArrowUpRight size={19} aria-hidden="true" />
      </a>
    </article>
  )
}

export function ProjectsSection(): ReactElement {
  const t = useCopy()
  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-heading">
      <div className={SECTION_HEADING_CLASS}>
        <h2 id="projects-heading">
          <span className={SECTION_NUMBER_CLASS}>01</span>
          {t('projects.heading')}
        </h2>
        <p className={EYEBROW_CLASS}>{t('projects.note')}</p>
      </div>
      <div className={PROJECT_GRID_CLASS}>
        {PROJECTS.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
      </div>
      <ToolsCard />
      <p className={SECTION_FOOTNOTE_CLASS}>
        {t('tools.note')}
      </p>
    </section>
  )
}
