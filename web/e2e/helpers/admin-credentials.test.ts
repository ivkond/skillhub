import { describe, expect, it } from 'vitest'
import { adminCredentials, hasConfiguredAdminCredentials, resolvePublisherMode } from './search-seed'
import { bootstrapAdminCredentials } from './test-data-builder'

const ADMIN_ENV_KEYS = [
  'E2E_ADMIN_USERNAME',
  'BOOTSTRAP_ADMIN_USERNAME',
  'E2E_ADMIN_PASSWORD',
  'BOOTSTRAP_ADMIN_PASSWORD',
] as const

function withAdminEnv<T>(overrides: Partial<Record<(typeof ADMIN_ENV_KEYS)[number], string | undefined>>, run: () => T): T {
  const previous = Object.fromEntries(ADMIN_ENV_KEYS.map((key) => [key, process.env[key]])) as Record<
    (typeof ADMIN_ENV_KEYS)[number],
    string | undefined
  >

  for (const key of ADMIN_ENV_KEYS) {
    const value = overrides[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  try {
    return run()
  } finally {
    for (const key of ADMIN_ENV_KEYS) {
      const value = previous[key]
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

describe('admin credential helpers', () => {
  it('test_hasConfiguredAdminCredentials_without_env_returns_false', () => {
    const configured = withAdminEnv({}, () => hasConfiguredAdminCredentials())

    expect(configured).toBe(false)
  })

  it('test_hasConfiguredAdminCredentials_with_bootstrap_password_returns_true', () => {
    const configured = withAdminEnv({ BOOTSTRAP_ADMIN_PASSWORD: 'ci-secret' }, () => hasConfiguredAdminCredentials())

    expect(configured).toBe(true)
  })

  it.each([
    ['search seed helper', adminCredentials],
    ['test data builder helper', bootstrapAdminCredentials],
  ])('test_%s_prefers_explicit_admin_env_values', (_label, getCredentials) => {
    const credentials = withAdminEnv(
      {
        E2E_ADMIN_USERNAME: 'ci-admin',
        E2E_ADMIN_PASSWORD: 'ci-secret',
        BOOTSTRAP_ADMIN_USERNAME: 'fallback-admin',
        BOOTSTRAP_ADMIN_PASSWORD: 'fallback-secret',
      },
      () => getCredentials(),
    )

    expect(credentials).toEqual({
      username: 'ci-admin',
      password: 'ci-secret',
    })
  })
})

describe('search seed publisher selection', () => {
  it('test_resolvePublisherMode_ci_without_admin_credentials_uses_adhoc_mode', () => {
    const mode = resolvePublisherMode({
      count: 13,
      hasConfiguredAdminCredentials: false,
      hasPublisherCredentials: false,
      isCi: true,
    })

    expect(mode).toBe('adhoc')
  })

  it('test_resolvePublisherMode_ci_without_admin_credentials_keeps_provided_mode', () => {
    const mode = resolvePublisherMode({
      count: 3,
      hasConfiguredAdminCredentials: false,
      hasPublisherCredentials: true,
      isCi: true,
    })

    expect(mode).toBe('provided')
  })

  it('test_resolvePublisherMode_ci_with_admin_credentials_prefers_admin_mode', () => {
    const mode = resolvePublisherMode({
      count: 13,
      hasConfiguredAdminCredentials: true,
      hasPublisherCredentials: true,
      isCi: true,
    })

    expect(mode).toBe('admin')
  })
})
