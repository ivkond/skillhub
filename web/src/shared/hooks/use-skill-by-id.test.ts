// @vitest-environment jsdom

import React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { collectionApi } from '@/api/client'
import { useSkillById } from './use-skill-by-id'

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

describe('useSkillById', () => {
  const getSkillByIdSpy = vi.spyOn(collectionApi, 'getSkillById')

  beforeEach(() => {
    getSkillByIdSpy.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads skill detail using skill id query key', async () => {
    getSkillByIdSpy.mockResolvedValue({
      id: 10,
      slug: 'demo-skill',
      displayName: 'Demo skill',
      summary: 's',
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      downloadCount: 0,
      starCount: 0,
      ratingCount: 0,
      hidden: false,
      namespace: 'team',
      canManageLifecycle: false,
      canSubmitPromotion: false,
      canInteract: true,
      canReport: true,
    })
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSkillById(10), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getSkillByIdSpy).toHaveBeenCalledWith(10)
    expect(queryClient.getQueryData(['skills', 'by-id', 10])).toMatchObject({
      id: 10,
      namespace: 'team',
      slug: 'demo-skill',
    })
  })
})
