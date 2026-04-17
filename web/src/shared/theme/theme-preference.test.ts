// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyThemeMode,
  bootstrapThemeMode,
  getStoredThemePreference,
  resolveThemeMode,
} from './theme-preference'

describe('resolveThemeMode', () => {
  it('returns dark when system preference reports dark', () => {
    expect(resolveThemeMode('system', true)).toBe('dark')
  })

  it('returns light when system preference reports light', () => {
    expect(resolveThemeMode('system', false)).toBe('light')
  })

  it('returns explicit override for dark and light preferences', () => {
    expect(resolveThemeMode('dark', false)).toBe('dark')
    expect(resolveThemeMode('light', true)).toBe('light')
  })

  it('falls back to light when matchMedia is unavailable for system mode', () => {
    expect(resolveThemeMode('system', undefined)).toBe('light')
  })
})

describe('applyThemeMode', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('light', 'dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('light', 'dark')
  })

  it('keeps only one active theme class on document root', () => {
    applyThemeMode('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)

    applyThemeMode('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('remains idempotent for repeated apply and bootstrap-like calls', () => {
    applyThemeMode('dark')
    applyThemeMode('dark')
    applyThemeMode('light')
    applyThemeMode('light')

    const activeThemeClasses = ['light', 'dark'].filter((name) =>
      document.documentElement.classList.contains(name),
    )

    expect(activeThemeClasses).toEqual(['light'])
  })
})

describe('bootstrapThemeMode', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('light', 'dark')
    delete document.documentElement.dataset.themeBootstrap
    delete document.documentElement.dataset.themeMode
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
    document.documentElement.classList.remove('light', 'dark')
    delete document.documentElement.dataset.themeBootstrap
    delete document.documentElement.dataset.themeMode
  })

  it('is idempotent and keeps a single active class across repeated bootstrap calls', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      ((query: string) =>
        ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }) as MediaQueryList),
    )

    bootstrapThemeMode()
    bootstrapThemeMode()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(document.documentElement.dataset.themeBootstrap).toBe('done')
    expect(document.documentElement.dataset.themeMode).toBe('dark')
  })
})

describe('getStoredThemePreference', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('uses system when invalid stored value is present', () => {
    window.localStorage.setItem('skillhub-theme', 'neon')
    expect(getStoredThemePreference()).toBe('system')
  })

  it('falls back to system when localStorage read throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(() => getStoredThemePreference()).not.toThrow()
    expect(getStoredThemePreference()).toBe('system')
  })

  it('falls back to system when storage read/write errors are thrown', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('neon')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write blocked')
    })

    expect(() => getStoredThemePreference()).not.toThrow()
    expect(getStoredThemePreference()).toBe('system')
  })
})
