import type { ReactElement } from 'react'
import { ArrowRight, ArrowUpRight, Braces, Check, Equal, Layers } from 'lucide-react'
import { useCopy } from '@/components/preferences-hooks'

function MemoryVisual(): ReactElement {
  const t = useCopy()
  return (
    <div className="project-visual memory-visual" role="img" aria-label={t('memory.visual')}>
      <div className="visual-topline">
        <span className="visual-dot" />
        {t('memory.context')}
        <ArrowUpRight className="visual-glyph" size={13} aria-hidden="true" />
      </div>
      <div className="memory-diagram" aria-hidden="true">
        <div className="memory-core">
          <Layers size={20} />
          <span>{t('memory.library')}</span>
          <span className="core-count">HTTP + MCP</span>
        </div>
        <div className="memory-connectors">
          <i />
          <i />
          <i />
        </div>
        <div className="agent-nodes">
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
    <div className="project-visual ledger-visual" role="img" aria-label={t('ledger.visual')}>
      <div className="visual-topline">
        <span className="visual-dot" />
        {t('ledger.exact')}
        <Equal className="visual-glyph" size={13} aria-hidden="true" />
      </div>
      <div className="ledger-diagram" aria-hidden="true">
        <div className="currency-row">
          <span>USD</span>
          <span>EUR</span>
          <span>CNY</span>
        </div>
        <div className="ledger-system">
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
        <div className="precision-label">
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
