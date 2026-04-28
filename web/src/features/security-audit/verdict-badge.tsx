import { useTranslation } from 'react-i18next'
import type { SecurityAuditDisplayState, SecurityVerdict } from './types'

interface VerdictBadgeProps {
  verdict?: SecurityVerdict
  displayState?: SecurityAuditDisplayState
}

export function VerdictBadge({ verdict, displayState }: VerdictBadgeProps) {
  const { t } = useTranslation()
  const state = displayState ?? verdict

  if (!state) {
    return null
  }

  const styles = {
    SCANNING: 'state-info',
    SCAN_FAILED: 'state-danger',
    SAFE: 'state-success',
    SUSPICIOUS: 'state-warning',
    DANGEROUS: 'state-danger',
    BLOCKED: 'state-danger',
  }

  const label = state === 'SCANNING'
    ? t('securityAudit.statusScanning')
    : state === 'SCAN_FAILED'
      ? t('securityAudit.statusScanFailed')
      : t(`securityAudit.verdict.${state}`)

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${styles[state]}`}
    >
      {label}
    </span>
  )
}
