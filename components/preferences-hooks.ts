import type { CopyKey } from '@/lib/copy'
import { useTranslation } from 'react-i18next'

export function useCopy(): (key: CopyKey) => string {
  const { t } = useTranslation()
  return key => t(key)
}
