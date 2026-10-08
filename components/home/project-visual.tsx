import type { ReactElement } from 'react'
import { ArrowRight, ArrowUpRight, Braces, Check, Equal, Layers } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'

const AGENT_NODES_CLASS = [
  'agent-nodes flex justify-around gap-[9px] [&_span]:min-w-0 [&_span]:flex-1 [&_span]:wrap-anywhere',
  '[&_span]:w-[90px] [&_span]:flex [&_span]:items-center [&_span]:justify-center',
  '[&_span]:px-1 [&_span]:py-2.5 [&_span]:border [&_span]:border-border',
  '[&_span]:rounded-[7px] [&_span]:bg-surface [&_span]:text-help',
].join(' ')

const VISUAL_TOPLINE_CLASS = [
  'visual-topline flex flex-wrap items-center gap-[7px] text-muted-foreground text-help tracking-[.2px]',
].join(' ')
const VISUAL_GLYPH_CLASS = ['visual-glyph ml-auto text-accent text-control leading-none'].join(' ')
const MEMORY_CONNECTORS_CLASS = [
  'memory-connectors h-7 flex justify-around w-[70%] mx-auto my-0 border-t border-border relative top-[13px]',
  'before:content-[""] before:absolute before:w-px before:h-[13px] before:-top-[13px]',
  'before:left-1/2 before:bg-border [&_i]:block [&_i]:h-[15px] [&_i]:w-px [&_i]:bg-border',
].join(' ')
const CURRENCY_ROW_CLASS = [
  'currency-row flex flex-wrap justify-center gap-[9px] [&_>_span]:text-help [&_>_span]:font-medium',
  '[&_>_span]:tracking-[.7px] [&_>_span]:text-accent [&_>_span]:px-4 [&_>_span]:py-2',
  '[&_>_span]:bg-surface [&_>_span]:border [&_>_span]:border-border [&_>_span]:rounded-[7px]',
].join(' ')
const PRECISION_LABEL_CLASS = [
  'precision-label flex justify-center items-center gap-1 text-help text-muted-foreground mt-4',
  '[&_>_svg]:text-accent',
].join(' ')

const PROJECT_VISUAL_CLASS = [
  'project-visual memory-visual border border-border rounded-[11px] px-[22px] py-4',
  'bg-[color-mix(in_srgb,var(--ztd-background)_85%,var(--ztd-muted))]',
  'max-[700px]:h-[199px] max-[700px]:py-[17px] max-[700px]:px-5',
  'max-[360px]:pl-[13px] max-[360px]:pr-[13px] h-auto min-h-65 max-[700px]:min-h-[250px]',
].join(' ')

const MEMORY_CORE_CLASS = [
  'memory-core flex items-center gap-2.5 max-w-full px-3.5 py-3 mx-auto my-0 border border-border',
  'rounded-[9px] bg-surface shadow-[0_5px_12px_var(--shadow-diagram)] [&_>_svg]:text-accent',
  '[&_>_span]:text-help [&_.core-count]:text-help [&_.core-count]:text-muted-foreground',
  '[&_.core-count]:ml-auto max-[360px]:gap-[7px] max-[360px]:py-[11px] max-[360px]:px-[10px]',
  'max-[360px]:[&_>_span]:text-help w-[min(100%,_290px)] [&_.core-count]:whitespace-nowrap',
].join(' ')

const PROJECT_VISUAL_CLASS_1 = [
  'project-visual ledger-visual border border-border rounded-[11px] px-[22px] py-4 bg-background',
  'max-[700px]:h-[199px] max-[700px]:py-[17px] max-[700px]:px-5',
  'max-[360px]:pl-[13px] max-[360px]:pr-[13px] h-auto min-h-65 max-[700px]:min-h-[250px]',
].join(' ')

const LEDGER_SYSTEM_CLASS = [
  'ledger-system flex items-center justify-between gap-[9px] mt-4 text-muted-foreground',
  '[&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-2 [&_>_span]:text-foreground',
  '[&_>_span]:text-help [&_>_span_svg]:text-muted-foreground',
  'max-[360px]:[&_>_span]:text-help max-[360px]:[&_>_span]:gap-[5px] flex-wrap',
  'max-[700px]:justify-center',
].join(' ')

function MemoryVisual(): ReactElement {
  const t = useCopy()
  return (
    <div
      className={PROJECT_VISUAL_CLASS}
      role="img"
      aria-label={t('memory.visual')}
    >
      <div className={VISUAL_TOPLINE_CLASS}>
        <span className="visual-dot size-1 rounded-full bg-accent" />
        {t('memory.context')}
        <ArrowUpRight className={VISUAL_GLYPH_CLASS} size={13} aria-hidden="true" />
      </div>
      <div className="memory-diagram w-[min(310px,_100%)] mx-auto mt-[25px] mb-0" aria-hidden="true">
        <div className={MEMORY_CORE_CLASS}>
          <Layers size={20} />
          <span>{t('memory.library')}</span>
          <span className="core-count">HTTP + MCP</span>
        </div>
        <div className={MEMORY_CONNECTORS_CLASS}>
          <i />
          <i />
          <i />
        </div>
        <div className={AGENT_NODES_CLASS}>
          <span>ChatGPT</span>
          <span>Codex</span>
          <span>Cursor</span>
        </div>
      </div>
    </div>
  )
}

function LedgerVisual(): ReactElement {
  const t = useCopy()
  return (
    <div
      className={PROJECT_VISUAL_CLASS_1}
      role="img"
      aria-label={t('ledger.visual')}
    >
      <div className={VISUAL_TOPLINE_CLASS}>
        <span className="visual-dot size-1 rounded-full bg-accent" />
        {t('ledger.exact')}
        <Equal className={VISUAL_GLYPH_CLASS} size={13} aria-hidden="true" />
      </div>
      <div className="ledger-diagram w-[min(300px,_100%)] mx-auto mt-[23px] mb-0" aria-hidden="true">
        <div className={CURRENCY_ROW_CLASS}>
          <span>USD</span>
          <span>EUR</span>
          <span>CNY</span>
        </div>
        <div className={LEDGER_SYSTEM_CLASS}>
          <span>
            <Braces size={19} />
            {t('ledger.api')}
          </span>
          <ArrowRight size={17} />
          <span>
            <Layers size={19} />
            {t('ledger.client')}
          </span>
        </div>
        <div className={PRECISION_LABEL_CLASS}>
          <Check size={12} />
          {t('ledger.precision')}
        </div>
      </div>
    </div>
  )
}

export function ProjectVisual({ id }: { id: 'memory' | 'ledger' }): ReactElement {
  return id === 'memory' ? <MemoryVisual /> : <LedgerVisual />
}
