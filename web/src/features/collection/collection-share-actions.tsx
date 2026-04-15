import { useTranslation } from 'react-i18next'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/button'

interface CollectionShareActionsProps {
  ownerId: string
  slug: string
  visibility: string
}

function buildPublicUrl(ownerId: string, slug: string): string {
  const origin = window.location.origin
  return `${origin}/u/${encodeURIComponent(ownerId)}/c/${encodeURIComponent(slug)}`
}

export function CollectionShareActions({ ownerId, slug, visibility }: CollectionShareActionsProps) {
  const { t } = useTranslation()
  const isPublic = visibility === 'PUBLIC'
  const publicUrl = buildPublicUrl(ownerId, slug)

  const copyLink = async () => {
    try {
      await copyToClipboard(publicUrl)
      toast.success(t('collections.shareCopySuccess'))
    } catch (error) {
      toast.error(t('collections.shareCopyError'), error instanceof Error ? error.message : '')
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-secondary/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t('collections.shareTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {isPublic ? t('collections.sharePublicHint') : t('collections.sharePrivateHint')}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void copyLink()}>
          {t('collections.shareCopyAction')}
        </Button>
      </div>
      <p className="break-all text-xs text-muted-foreground">{publicUrl}</p>
    </div>
  )
}
