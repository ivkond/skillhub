import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { components } from '@/api/generated/schema'
import { collectionApi } from '@/api/client'

type SkillCollectionCreateBody = components['schemas']['SkillCollectionCreateRequest']
type SkillCollectionUpdateBody = components['schemas']['SkillCollectionUpdateRequest']
type SkillCollectionVisibility = 'PUBLIC' | 'PRIVATE'

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
