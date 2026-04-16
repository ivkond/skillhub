import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { components } from '@/api/generated/schema'
import { ApiError, collectionApi, fetchJson } from '@/api/client'
import type { PagedResponse, SearchParams, SkillSummary } from '@/api/types'
import { buildSkillSearchUrl } from './skill-query-helpers'
import { mapCollectionAddCandidates, type CollectionAddCandidate } from './use-collection-add-candidates'

type SkillCollectionCreateBody = components['schemas']['SkillCollectionCreateRequest']
type SkillCollectionUpdateBody = components['schemas']['SkillCollectionUpdateRequest']
type SkillCollectionVisibility = 'PUBLIC' | 'PRIVATE'
type CollectionAddCandidatesParams = {
  collectionId: string
  q?: string
  label?: string
  sort?: string
  page?: number
  size?: number
  collectionSkillIds?: number[]
}

type CollectionAddCandidatesPage = PagedResponse<CollectionAddCandidate>

type BulkAddCollectionSkillsInput = {
  id: string
  skillIds: number[]
}

type BulkAddCollectionSkillsResult = {
  addedIds: number[]
  alreadyInCollectionIds: number[]
  failedIds: number[]
}

const DUPLICATE_COLLECTION_MEMBER_ERROR = 'error.skillCollection.member.duplicate'

function isDuplicateCollectionMemberError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false
  }
  return (
    error.serverMessageKey === DUPLICATE_COLLECTION_MEMBER_ERROR
    || error.serverMessage === DUPLICATE_COLLECTION_MEMBER_ERROR
    || error.message === DUPLICATE_COLLECTION_MEMBER_ERROR
  )
}

function normalizeCollectionAddCandidatesParams(params: CollectionAddCandidatesParams): Required<CollectionAddCandidatesParams> {
  const collectionSkillIds = Array.from(new Set(params.collectionSkillIds ?? [])).sort((left, right) => left - right)
  return {
    collectionId: params.collectionId,
    q: params.q ?? '',
    label: params.label ?? '',
    sort: params.sort ?? '',
    page: params.page ?? 0,
    size: params.size ?? 20,
    collectionSkillIds,
  }
}

function toSkillSearchParams(params: Required<CollectionAddCandidatesParams>): SearchParams {
  return {
    q: params.q,
    label: params.label || undefined,
    sort: params.sort || undefined,
    page: params.page,
    size: params.size,
  }
}

function invalidateMineAndDetail(queryClient: ReturnType<typeof useQueryClient>, id?: string | number | null) {
  queryClient.invalidateQueries({ queryKey: ['collections', 'mine'] })
  if (id != null && id !== '') {
    queryClient.invalidateQueries({ queryKey: ['collections', String(id)] })
    queryClient.invalidateQueries({ queryKey: ['collections', String(id), 'contributors'] })
  }
}

export function useMyCollections(params: { page?: number; size?: number } = {}) {
  const page = params.page ?? 0
  const size = params.size ?? 20
  return useQuery({
    queryKey: ['collections', 'mine', page, size],
    queryFn: () => collectionApi.listMine({ page, size }),
  })
}

export function useCollectionDetail(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['collections', id],
    queryFn: () => collectionApi.getById(id!),
    enabled: !!id && enabled,
  })
}

export function usePublicCollection(ownerKey: string | undefined, collectionSlug: string | undefined) {
  return useQuery({
    queryKey: ['collections', 'public', ownerKey, collectionSlug],
    queryFn: () => collectionApi.getPublicByOwnerAndSlug(ownerKey!, collectionSlug!),
    enabled: !!ownerKey && !!collectionSlug,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SkillCollectionCreateBody) => collectionApi.create(body),
    onSuccess: (data) => {
      invalidateMineAndDetail(queryClient, data.id)
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; body: SkillCollectionUpdateBody }) => collectionApi.updateMetadata(variables.id, variables.body),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}

export function useSetCollectionVisibility() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; visibility: SkillCollectionVisibility }) =>
      collectionApi.setVisibility(variables.id, variables.visibility),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => collectionApi.deleteCollection(id),
    onSuccess: (_data, id) => {
      invalidateMineAndDetail(queryClient, id)
    },
  })
}

export function useAddCollectionSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; skillId: number }) =>
      collectionApi.addSkill(variables.id, variables.skillId),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}

export function useRemoveCollectionSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; skillId: number }) =>
      collectionApi.removeSkill(variables.id, variables.skillId),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}

export function useReorderCollectionSkills() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; skillIdsInOrder: number[] }) =>
      collectionApi.reorderSkills(variables.id, variables.skillIdsInOrder),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}

export function useCollectionContributors(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['collections', id, 'contributors'],
    queryFn: () => collectionApi.listContributors(id!),
    enabled: !!id && enabled,
  })
}

export function useCollectionAddCandidates(params: CollectionAddCandidatesParams) {
  const normalized = normalizeCollectionAddCandidatesParams(params)
  return useQuery({
    queryKey: [
      'collections',
      normalized.collectionId,
      'add-candidates',
      normalized.q,
      normalized.label,
      normalized.sort,
      normalized.page,
      normalized.size,
    ],
    queryFn: async (): Promise<CollectionAddCandidatesPage> => {
      const searchParams = toSkillSearchParams(normalized)
      const response = await fetchJson<PagedResponse<SkillSummary>>(buildSkillSearchUrl(searchParams))
      return {
        ...response,
        items: mapCollectionAddCandidates(response.items, new Set(normalized.collectionSkillIds)),
      }
    },
    enabled: !!normalized.collectionId,
  })
}

export function useBulkAddCollectionSkills() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: BulkAddCollectionSkillsInput): Promise<BulkAddCollectionSkillsResult> => {
      const result: BulkAddCollectionSkillsResult = {
        addedIds: [],
        alreadyInCollectionIds: [],
        failedIds: [],
      }

      for (const skillId of variables.skillIds) {
        try {
          await collectionApi.addSkill(variables.id, skillId)
          result.addedIds.push(skillId)
        } catch (error) {
          if (isDuplicateCollectionMemberError(error)) {
            result.alreadyInCollectionIds.push(skillId)
            continue
          }
          result.failedIds.push(skillId)
        }
      }

      return result
    },
    onSuccess: (result, variables) => {
      if (result.addedIds.length === 0) {
        return
      }
      queryClient.invalidateQueries({ queryKey: ['collections', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['collections', String(variables.id)] })
    },
  })
}

export function useAddCollectionContributor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; userId: string }) =>
      collectionApi.addContributor(variables.id, variables.userId),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}

export function useRemoveCollectionContributor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { id: string; userId: string }) =>
      collectionApi.removeContributor(variables.id, variables.userId),
    onSuccess: (_data, variables) => {
      invalidateMineAndDetail(queryClient, variables.id)
    },
  })
}
