// @vitest-environment jsdom

import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { collectionApi } from '@/api/client'
import {
  useCollectionContributors,
  useCreateCollection,
  useMyCollections,
  useReorderCollectionSkills,
} from './use-collection-queries'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('use-collection-queries', () => {
  const createSpy = vi.spyOn(collectionApi, 'create')
  const listMineSpy = vi.spyOn(collectionApi, 'listMine')
  const listContributorsSpy = vi.spyOn(collectionApi, 'listContributors')
  const reorderSkillsSpy = vi.spyOn(collectionApi, 'reorderSkills')

  beforeEach(() => {
    createSpy.mockReset()
    listMineSpy.mockReset()
    listContributorsSpy.mockReset()
    reorderSkillsSpy.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('useMyCollections uses stable list query key and calls listMine', async () => {
    listMineSpy.mockResolvedValue({ items: [], total: 0, page: 0, size: 20 })
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useMyCollections({ page: 1, size: 10 }), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(listMineSpy).toHaveBeenCalledWith({ page: 1, size: 10 })

    const cached = queryClient.getQueryData(['collections', 'mine', 1, 10])
    expect(cached).toEqual({ items: [], total: 0, page: 0, size: 20 })
  })

  it('useCreateCollection invalidates mine and detail queries on success', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    createSpy.mockResolvedValue({
      id: 42,
      ownerId: 'u1',
      slug: 'my-col',
      title: 'T',
      description: '',
      visibility: 'PUBLIC',
      members: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    })

    const { result } = renderHook(() => useCreateCollection(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      title: 'T',
      visibility: 'PUBLIC',
      slug: 'my-col',
    })

    expect(createSpy).toHaveBeenCalledWith({
      title: 'T',
      visibility: 'PUBLIC',
      slug: 'my-col',
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections', 'mine'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections', '42'] })
  })

  it('useCollectionContributors fetches contributor list by collection id', async () => {
    listContributorsSpy.mockResolvedValue([
      {
        userId: 'u-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ])
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCollectionContributors('42'), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(listContributorsSpy).toHaveBeenCalledWith('42')
    expect(queryClient.getQueryData(['collections', '42', 'contributors'])).toEqual([
      {
        userId: 'u-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ])
  })

  it('useReorderCollectionSkills calls API and invalidates mine/detail queries', async () => {
    reorderSkillsSpy.mockResolvedValue([
      { membershipId: 10, skillId: 200, sortOrder: 0 },
      { membershipId: 11, skillId: 100, sortOrder: 1 },
    ])
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useReorderCollectionSkills(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      id: '42',
      skillIdsInOrder: [200, 100],
    })

    expect(reorderSkillsSpy).toHaveBeenCalledWith('42', [200, 100])
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections', 'mine'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collections', '42'] })
  })
})
