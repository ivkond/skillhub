import { describe, expect, it } from 'vitest'
import { selectReusableTeamNamespace, type SeededNamespace } from './test-data-builder'

function buildNamespace(overrides: Partial<SeededNamespace>): SeededNamespace {
  return {
    id: overrides.id ?? 1,
    slug: overrides.slug ?? 'team-alpha',
    displayName: overrides.displayName ?? 'Team Alpha',
    status: overrides.status ?? 'ACTIVE',
    type: overrides.type ?? 'TEAM',
    currentUserRole: overrides.currentUserRole,
    canRestore: overrides.canRestore,
    canUnfreeze: overrides.canUnfreeze,
  }
}

describe('selectReusableTeamNamespace', () => {
  it('test_selectReusableTeamNamespace_prefers_active_team_over_global', () => {
    const globalNamespace = buildNamespace({
      id: 1,
      slug: 'global',
      displayName: 'Global',
      type: 'OFFICIAL',
    })
    const teamNamespace = buildNamespace({
      id: 2,
      slug: 'team-space',
      displayName: 'Team Space',
      type: 'TEAM',
    })

    const selected = selectReusableTeamNamespace([globalNamespace, teamNamespace])

    expect(selected).toEqual(teamNamespace)
  })

  it('test_selectReusableTeamNamespace_returns_activatable_team_when_no_active_team_exists', () => {
    const archivedTeam = buildNamespace({
      id: 2,
      slug: 'team-archived',
      displayName: 'Team Archived',
      status: 'ARCHIVED',
      canRestore: true,
    })

    const selected = selectReusableTeamNamespace([archivedTeam])

    expect(selected).toEqual(archivedTeam)
  })

  it('test_selectReusableTeamNamespace_with_only_global_namespace_returns_null', () => {
    const globalNamespace = buildNamespace({
      id: 1,
      slug: 'global',
      displayName: 'Global',
      type: 'OFFICIAL',
    })

    const selected = selectReusableTeamNamespace([globalNamespace])

    expect(selected).toBeNull()
  })
})
