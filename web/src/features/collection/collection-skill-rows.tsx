import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type components } from '@/api/generated/schema'
import { useReorderCollectionSkills } from '@/shared/hooks/use-collection-queries'
import { useSkillById } from '@/shared/hooks/use-skill-by-id'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

type SkillCollectionMemberResponse = components['schemas']['SkillCollectionMemberResponse']

interface CollectionSkillRowsProps {
  collectionId: string
  members: SkillCollectionMemberResponse[]
  canReorder: boolean
  showActions?: boolean
}

interface SkillRowProps {
  member: SkillCollectionMemberResponse
  canMoveUp: boolean
  canMoveDown: boolean
  canReorder: boolean
  busy: boolean
  hideActions: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

function SkillRow({
  member,
  canMoveUp,
  canMoveDown,
  canReorder,
  busy,
  hideActions,
  onMoveUp,
  onMoveDown,
}: SkillRowProps) {
  const { t } = useTranslation()
  const skillId = member.skillId ?? undefined
  const { data: skill, isLoading } = useSkillById(skillId)

  const displayName = skill?.displayName ?? t('collections.skillFallbackTitle', { skillId: skillId ?? '-' })
  const namespace = skill?.namespace ?? ''
  const slug = skill?.slug ?? ''

  return (
    <tr className="border-b border-border/40 last:border-b-0">
      <td className="p-3 text-sm text-muted-foreground">{(member.sortOrder ?? 0) + 1}</td>
      <td className="p-3">
        {isLoading ? (
          <span className="text-sm text-muted-foreground">{t('collections.skillLoading')}</span>
        ) : skill && namespace && slug ? (
          <Link
            to="/space/$namespace/$slug"
            params={{ namespace, slug: encodeURIComponent(slug) }}
            className="text-sm font-medium text-primary hover:underline"
          >
            {displayName}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">{displayName}</span>
        )}
      </td>
      {!hideActions ? (
        <td className="p-3 text-right">
          <div className="inline-flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onMoveUp}
              disabled={!canReorder || !canMoveUp || busy}
              aria-label={t('collections.moveUp')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onMoveDown}
              disabled={!canReorder || !canMoveDown || busy}
              aria-label={t('collections.moveDown')}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </td>
      ) : null}
    </tr>
  )
}

export function CollectionSkillRows({ collectionId, members, canReorder, showActions = true }: CollectionSkillRowsProps) {
  const { t } = useTranslation()
  const reorderMutation = useReorderCollectionSkills()

  const orderedMembers = [...members].sort((a, b) => {
    const sortDelta = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (sortDelta !== 0) {
      return sortDelta
    }
    return (a.membershipId ?? 0) - (b.membershipId ?? 0)
  })

  const orderedSkillIds = orderedMembers
    .map((member) => member.skillId)
    .filter((id): id is number => typeof id === 'number')

  const moveRow = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedSkillIds.length || fromIndex === toIndex) {
      return
    }
    const nextOrder = [...orderedSkillIds]
    const [moved] = nextOrder.splice(fromIndex, 1)
    nextOrder.splice(toIndex, 0, moved)

    try {
      await reorderMutation.mutateAsync({
        id: collectionId,
        skillIdsInOrder: nextOrder,
      })
      toast.success(t('collections.reorderSuccess'))
    } catch (error) {
      toast.error(t('collections.reorderError'), error instanceof Error ? error.message : '')
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">{t('collections.columnOrder')}</th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">{t('collections.columnSkill')}</th>
              {showActions ? (
                <th className="p-3 text-right text-sm font-medium text-muted-foreground">{t('collections.columnActions')}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {orderedMembers.map((member, index) => (
              <SkillRow
                key={member.membershipId ?? `${member.skillId ?? 'unknown'}-${index}`}
                member={member}
                canMoveUp={index > 0}
                canMoveDown={index < orderedMembers.length - 1}
                canReorder={canReorder}
                busy={reorderMutation.isPending}
                onMoveUp={() => {
                  void moveRow(index, index - 1)
                }}
                onMoveDown={() => {
                  void moveRow(index, index + 1)
                }}
                hideActions={!showActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
