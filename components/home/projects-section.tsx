import type { ReactElement } from 'react'
import { ArrowUpRight, Terminal } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { LINKS, PROJECTS } from '@/lib/projects'
import { ProjectVisual } from './project-visual'

type Project = (typeof PROJECTS)[number]

function ProjectCard({ project, index }: { project: Project, index: number }): ReactElement {
  const t = useCopy()
  return (
    <article className="project-card" aria-labelledby={`${project.id}-title`}>
      <ProjectVisual id={project.id} />
      <div className="project-content">
        <p className="project-category">
          <span>{String(index + 1).padStart(2, '0')}</span>
          {t(project.category)}
        </p>
        <h3 id={`${project.id}-title`}>{t(project.title)}</h3>
        <p className="project-description">{t(project.description)}</p>
        <ul className="project-tags" aria-label={t('technologies')}>
          {project.tags.map(tag => (
            <li key={tag}>{tag === 'Multi-currency' ? t('tag.multicurrency') : tag}</li>
          ))}
        </ul>
        <div className="project-links">
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
    <article className="tools-card" aria-labelledby="tools-title">
      <div className="tools-icon" aria-hidden="true"><Terminal size={22} /></div>
      <div className="tools-body">
        <div className="tools-heading">
          <h3 id="tools-title">{t('tools.title')}</h3>
          <span className="stage-badge">
            <span aria-hidden="true" />
            {t('tools.stage')}
          </span>
        </div>
        <p>{t('tools.description')}</p>
      </div>
      <a href={LINKS.tools} className="tools-link" aria-label={`${t('source')} · zeithrold/tools`}>
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
      <div className="section-heading">
        <h2 id="projects-heading">
          <span className="section-number">01</span>
          {t('projects.heading')}
        </h2>
        <p className="eyebrow">{t('projects.note')}</p>
      </div>
      <div className="project-grid">
        {PROJECTS.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
      </div>
      <ToolsCard />
      <p className="section-footnote">{t('tools.note')}</p>
    </section>
  )
}
