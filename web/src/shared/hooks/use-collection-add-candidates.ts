import type { SkillSummary } from '@/api/types'

export type CollectionAddCandidate = Pick<SkillSummary, 'id' | 'displayName' | 'namespace' | 'summary' | 'status'> & {
  visibility?: string
  alreadyInCollection: boolean
}

export function mapCollectionAddCandidates(
  skills: SkillSummary[],
  memberSkillIds: ReadonlySet<number>,
): CollectionAddCandidate[] {
  return skills.map((skill) => {
    const skillWithVisibility = skill as SkillSummary & { visibility?: string }
    return {
      id: skill.id,
      displayName: skill.displayName,
      namespace: skill.namespace,
      summary: skill.summary,
      status: skill.status,
      visibility: skillWithVisibility.visibility,
      alreadyInCollection: memberSkillIds.has(skill.id),
    }
  })
}
