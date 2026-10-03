import type { ReactElement } from 'react'
import { FrontendProvider, PublicShell } from '../../components/ui/ztd-me/client'
import { createPreferencePolicy, resolveInitialPreferences } from '../../components/ui/ztd-me/index.ts'
import '../../components/ui/ztd-me/styles.css'

const policy = createPreferencePolicy({ name: 'consumer.ui.v1', secure: true })
const initialPreferences = resolveInitialPreferences({ policy })

export function Example(): ReactElement {
  return (
    <FrontendProvider initialPreferences={initialPreferences} policy={policy}>
      <PublicShell brand={{ label: 'Consumer', homeHref: '/' }}>
        <h1>Consumer-owned content</h1>
      </PublicShell>
    </FrontendProvider>
  )
}
