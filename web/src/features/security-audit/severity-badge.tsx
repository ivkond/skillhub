import { useTranslation } from 'react-i18next'
import type { FindingSeverity } from './types'

interface SeverityBadgeProps {
  severity: FindingSeverity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { t } = useTranslation()

  const styles = {
    CRITICAL: 'state-danger',
    HIGH: 'state-danger',
    MEDIUM: 'state-warning',
    LOW: 'state-info',
    INFO: 'state-success',
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[severity]}`}
    >
      {t(`securityAudit.severity.${severity}`)}
    </span>
  )
}
