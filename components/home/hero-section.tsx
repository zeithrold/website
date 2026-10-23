import type { ReactElement } from 'react'
import { ArrowDown, ArrowUpRight, Asterisk, Braces, GitBranch as Github, Layers, Sparkles } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { Button } from '@/components/ui/button'
import { LINKS } from '@/lib/projects'

const atlasCanvasStyle1 = [
  'atlas-canvas relative aspect-[1.45] max-[700px]:aspect-[2.8] border border-border rounded-sm',
  'overflow-hidden bg-surface',
].join(' ')

const heroStyle2 = [
  'hero grid grid-cols-[1.2fr_1fr] items-center gap-20 pt-14 pb-20 max-[960px]:gap-10',
  'max-[700px]:grid-cols-1 max-[700px]:gap-8 max-[700px]:pt-9 max-[700px]:pb-12',
].join(' ')

const eyebrowStyle3 = [
  'eyebrow hero-eyebrow flex items-center gap-2.5 m-0 mb-5 text-help font-medium tracking-[.13em]',
  'text-muted-foreground',
].join(' ')

const heroDescriptionStyle4 = [
  'hero-description mt-6 mb-6 max-w-90 text-balance text-body leading-[1.85] text-muted-foreground',
].join(' ')

const githubLinkStyle5 = [
  'github-link inline-flex items-center gap-2 min-h-11 text-control text-muted-foreground',
  'hover:text-foreground',
].join(' ')

const atlasIdeaClass = [
  'atlas-idea absolute flex items-center gap-3 border border-border bg-surface rounded-sm px-4 py-3',
  'max-[700px]:gap-2 max-[700px]:px-2 max-[700px]:py-1.5',
].join(' ')

function IdeaSketch(): ReactElement {
  const t = useCopy()
  const ideas = [
    { key: 'sketch.memory', Icon: Layers },
    { key: 'sketch.build', Icon: Braces },
    { key: 'sketch.explore', Icon: Sparkles },
  ] as const
  return (
    <figure className="idea-sketch m-0 w-full max-w-96 justify-self-end max-[700px]:max-w-full" aria-hidden="true">
      <figcaption className="flex items-center justify-between gap-4 text-help text-muted-foreground mb-4">
        <span className="tracking-[.1em]">{t('sketch.label')}</span>
        <span className="font-mono tabular-nums">01—03</span>
      </figcaption>
      <div className={atlasCanvasStyle1}>
        <svg
          className="atlas-routes absolute inset-0 size-full"
          viewBox="0 0 400 276"
          preserveAspectRatio="none"
          fill="none"
        >
          <path className="atlas-guide" d="M28 69H372M28 138H372M28 207H372M100 24V252M200 24V252M300 24V252" />
          <path className="atlas-route" pathLength="1" d="M90 65H309V138H90V211H309" />
          <circle className="atlas-point" cx="90" cy="65" r="4" />
          <circle className="atlas-point" cx="309" cy="138" r="4" />
          <circle className="atlas-point" cx="90" cy="211" r="4" />
          <path className="atlas-register" d="M16 8V24M8 16H24M384 252V268M376 260H392" />
        </svg>
        <ol className="atlas-ideas list-none m-0 p-0 absolute inset-0">
          {ideas.map(({ key, Icon }, index) => (
            <li key={key} className={`atlas-idea-${index + 1} ${atlasIdeaClass}`}>
              <span className="font-mono text-help text-muted-foreground max-[700px]:hidden">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon size={18} strokeWidth={1.5} className="text-accent max-[700px]:size-3.5" />
              <span className="text-control font-medium">{t(key)}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="m-0 mt-4 text-help text-muted-foreground max-[700px]:hidden">{t('sketch.caption')}</p>
    </figure>
  )
}

export function HeroSection(): ReactElement {
  const t = useCopy()
  return (
    <section className={heroStyle2} aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className={eyebrowStyle3}>
          <Asterisk size={17} className="text-accent" aria-hidden="true" />
          {t('eyebrow')}
        </p>
        <h1 id="hero-heading">
          {t('hero.first')}
          <br />
          <span>{t('hero.second')}</span>
        </h1>
        <p className={heroDescriptionStyle4}>
          {t('hero.description')}
        </p>
        <div className="hero-actions flex flex-wrap items-center gap-x-5 gap-y-2">
          <Button asChild className="primary-link min-h-11 rounded-sm gap-4 px-4 text-control font-medium">
            <a href="#projects">
              {t('hero.explore')}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </Button>
          <a href={LINKS.github} className={githubLinkStyle5}>
            <Github size={15} aria-hidden="true" />
            {t('hero.github')}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <IdeaSketch />
    </section>
  )
}
