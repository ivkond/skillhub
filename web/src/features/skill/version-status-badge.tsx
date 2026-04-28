import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'

type VersionStatus =
  | 'DRAFT'
  | 'SCANNING'
  | 'SCAN_FAILED'
  | 'UPLOADED'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'YANKED'

const statusStyles: Record<VersionStatus, string> = {
  PUBLISHED:
    'border-state-success/30 bg-state-success/10 text-state-success',
  UPLOADED:
    'border-state-info/30 bg-state-info/10 text-state-info',
  PENDING_REVIEW:
    'border-state-warning/30 bg-state-warning/10 text-state-warning',
  REJECTED:
    'border-state-danger/30 bg-state-danger/10 text-state-danger',
  SCANNING:
    'border-state-info/30 bg-state-info/10 text-state-info',
  SCAN_FAILED:
    'border-state-danger/30 bg-state-danger/10 text-state-danger',
  YANKED:
    'border-border/60 bg-secondary/40 text-muted-foreground',
  DRAFT:
    'border-border/60 bg-secondary/40 text-muted-foreground',
}

const i18nKeys: Record<VersionStatus, string> = {
  DRAFT: 'skillDetail.versionStatusDraft',
  SCANNING: 'skillDetail.versionStatusScanning',
  SCAN_FAILED: 'skillDetail.versionStatusScanFailed',
  UPLOADED: 'skillDetail.versionStatusUploaded',
  PENDING_REVIEW: 'skillDetail.versionStatusPendingReview',
  PUBLISHED: 'skillDetail.versionStatusPublished',
  REJECTED: 'skillDetail.versionStatusRejected',
  YANKED: 'skillDetail.versionStatusYanked',
}

/** Color-coded row styles (left-border + subtle background) for version cards. */
export const versionRowStyles: Record<VersionStatus, string> = {
  UPLOADED:
    'border-l-4 !border-l-state-info bg-state-info/5',
  PENDING_REVIEW:
    'border-l-4 !border-l-state-warning bg-state-warning/5',
  REJECTED:
    'border-l-4 !border-l-state-danger bg-state-danger/5',
  SCANNING:
    'border-l-4 !border-l-state-info bg-state-info/5',
  SCAN_FAILED:
    'border-l-4 !border-l-state-danger bg-state-danger/5',
  PUBLISHED: '',
  YANKED: '',
  DRAFT: '',
}

export function getVersionRowStyle(status?: string): string {
  if (!status) return ''
  return versionRowStyles[status as VersionStatus] ?? ''
}

export function VersionStatusBadge({
  status,
  className,
}: {
  status?: string
  className?: string
}) {
  const { t } = useTranslation()
  if (!status) return null

  const style = statusStyles[status as VersionStatus] ?? statusStyles.DRAFT
  const label = i18nKeys[status as VersionStatus]
    ? t(i18nKeys[status as VersionStatus])
    : status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {label}
    </span>
  )
}
