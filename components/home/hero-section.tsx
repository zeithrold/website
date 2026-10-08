import type { ReactElement } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  Braces,
  GitBranch as Github,
  Layers,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'
import { Button } from '@/components/ui/button'
import { LINKS } from '@/lib/projects'

const SKETCH_CANVAS_CLASS = ['sketch-canvas h-[234px] relative max-w-90 my-0 mx-auto'].join(' ')

const ASTERISK_CLASS = ['asterisk text-accent text-[length:20px] leading-[1]'].join(' ')

const SKETCH_PLUS_CLASS_1 = ['sketch-plus plus-two absolute left-[43px] bottom-[17px] text-accent'].join(' ')

const EYEBROW_CLASS = [
  'eyebrow sketch-label font-medium tracking-[1.5px] text-muted-foreground text-center m-0 text-help',
].join(' ')

const SKETCH_LINES_CLASS = ['sketch-lines absolute [inset:9px_0_0] w-full h-[210px] overflow-visible'].join(' ')

const IDEA_NODE_CLASS = [
  'idea-node node-memory absolute flex flex-col justify-center items-center gap-2 border border-border',
  'bg-card rounded-[19px] w-[90px] h-[90px] shadow-[0_9px_23px_var(--shadow-sketch)] [&_span]:text-help',
  '[&_span]:tracking-[.3px] left-8 top-[29px] transform-[rotate(-9deg)] [&_svg]:text-accent',
].join(' ')

const IDEA_NODE_CLASS_1 = [
  'idea-node node-build absolute flex flex-col justify-center items-center gap-2 border border-border',
  'rounded-[19px] shadow-[0_9px_23px_var(--shadow-sketch)] [&_span]:text-help [&_span]:tracking-[.3px]',
  'left-[127px] top-[121px] w-[78px] h-[78px] transform-[rotate(7deg)] bg-muted',
].join(' ')

const IDEA_NODE_CLASS_2 = [
  'idea-node node-explore absolute flex flex-col justify-center items-center gap-2 border border-border',
  'rounded-[19px] w-[90px] h-[90px] shadow-[0_9px_23px_var(--shadow-sketch)] [&_span]:text-help',
  '[&_span]:tracking-[.3px] right-[38px] top-[82px] transform-[rotate(11deg)] bg-muted text-accent',
].join(' ')

const SKETCH_PLUS_CLASS = ['sketch-plus plus-one absolute text-muted-foreground right-[69px] top-[18px]'].join(' ')

const SKETCH_CAPTION_CLASS = ['sketch-caption text-muted-foreground text-center font-sans text-help m-0'].join(' ')

const HERO_CLASS = [
  'hero grid grid-cols-[1.25fr_1fr] gap-[70px] items-center pt-[75px] px-0 pb-[77px]',
  'max-[960px]:gap-[35px] max-[960px]:py-16 max-[960px]:px-0 max-[700px]:grid-cols-[1fr]',
  'max-[700px]:gap-0 max-[700px]:pt-[54px] max-[700px]:px-0 max-[700px]:pb-[45px] max-[520px]:pt-[43px]',
].join(' ')

const EYEBROW_CLASS_3 = [
  'eyebrow hero-eyebrow text-help font-medium tracking-[1.5px] text-muted-foreground leading-[1.6] flex',
  'items-center gap-[10px] mt-0 mx-0 mb-[25px] max-[700px]:mb-6',
].join(' ')

const HERO_DESCRIPTION_CLASS = [
  'hero-description mt-[26px] mx-0 mb-7 max-w-[370px] text-muted-foreground text-body leading-[1.9]',
  'max-[700px]:mt-[22px] max-[700px]:mx-0 max-[700px]:mb-[23px] max-[700px]:max-w-90',
  'max-[700px]:text-body',
].join(' ')

const HERO_ACTIONS_CLASS = [
  'hero-actions flex items-center gap-[22px] max-[960px]:gap-[14px] max-[960px]:flex-wrap',
  'max-[700px]:gap-[19px] max-[520px]:gap-y-3 max-[520px]:gap-x-5 flex-wrap',
].join(' ')

const PRIMARY_LINK_CLASS = [
  'primary-link rounded-[8px] h-11 py-0 px-[17px] text-control gap-[15px] font-medium text-background',
  'max-[520px]:text-control max-[520px]:py-0 max-[520px]:px-[13px] max-[520px]:gap-3',
].join(' ')

const GITHUB_LINK_CLASS = [
  'github-link flex items-center gap-2 min-h-11 text-control text-muted-foreground hover:text-foreground',
  'max-[520px]:text-control',
].join(' ')

function IdeaSketch(): ReactElement {
  const t = useCopy()
  return (
    <div className="idea-sketch pt-[17px] max-[700px]:hidden" aria-hidden="true">
      <p className={EYEBROW_CLASS}>
        {t('sketch.label')}
      </p>
      <div className={SKETCH_CANVAS_CLASS}>
        <svg className={SKETCH_LINES_CLASS} viewBox="0 0 360 210">
          <path d="M84 66 C160 34 236 70 256 135 M84 66 C67 150 134 193 173 156 M173 156 Q244 207 256 135" />
          <circle cx="162" cy="71" r="3" />
          <circle cx="108" cy="147" r="3" />
          <circle cx="226" cy="173" r="3" />
        </svg>
        <div className={IDEA_NODE_CLASS}>
          <Layers size={25} />
          <span>{t('sketch.memory')}</span>
        </div>
        <div className={IDEA_NODE_CLASS_1}>
          <Braces size={30} />
          <span>{t('sketch.build')}</span>
        </div>
        <div className={IDEA_NODE_CLASS_2}>
          <Sparkles size={24} />
          <span>{t('sketch.explore')}</span>
        </div>
        <Plus className={SKETCH_PLUS_CLASS} size={19} strokeWidth={1.5} aria-hidden="true" />
        <Plus className={SKETCH_PLUS_CLASS_1} size={19} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <p className={SKETCH_CAPTION_CLASS}>{t('sketch.caption')}</p>
    </div>
  )
}

export function HeroSection(): ReactElement {
  const t = useCopy()
  return (
    <section
      className={HERO_CLASS}
      aria-labelledby="hero-heading"
    >
      <div className="hero-copy">
        <p className={EYEBROW_CLASS_3}>
          <Asterisk className={ASTERISK_CLASS} size={22} aria-hidden="true" />
          {t('eyebrow')}
        </p>
        <h1 id="hero-heading">
          {t('hero.first')}
          <br />
          <span>{t('hero.second')}</span>
        </h1>
        <p className={HERO_DESCRIPTION_CLASS}>
          {t('hero.description')}
        </p>
        <div className={HERO_ACTIONS_CLASS}>
          <Button
            asChild
            className={PRIMARY_LINK_CLASS}
          >
            <a href="#projects">
              {t('hero.explore')}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </Button>
          <a
            href={LINKS.github}
            className={GITHUB_LINK_CLASS}
          >
            <Github size={16} aria-hidden="true" />
            {t('hero.github')}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <IdeaSketch />
    </section>
  )
}
