import { useQuery } from '@tanstack/react-query'
import { collectionApi } from '@/api/client'

/**
 * Resolves a skill identifier into full skill detail metadata that includes
 * namespace and slug needed for stable detail links.
 */
export function useSkillById(skillId: number | undefined) {
  return useQuery({
    queryKey: ['skills', 'by-id', skillId],
    queryFn: () => collectionApi.getSkillById(skillId!),
    enabled: skillId != null,
  })
}
