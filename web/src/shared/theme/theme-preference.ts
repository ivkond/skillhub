export type ThemePreference = 'light' | 'dark' | 'system'
export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'skillhub-theme'

function persistThemePreference(preference: ThemePreference): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Ignore storage write errors to keep bootstrap resilient.
  }
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system'
  }

  try {
    const rawValue = window.localStorage.getItem(THEME_STORAGE_KEY)

    if (rawValue === 'light' || rawValue === 'dark' || rawValue === 'system') {
      return rawValue
    }

    if (rawValue !== null) {
      persistThemePreference('system')
    }
  } catch {
    persistThemePreference('system')
  }

  return 'system'
}

export function resolveThemeMode(preference: ThemePreference, prefersDark?: boolean): ThemeMode {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }

  if (prefersDark === true) {
    return 'dark'
  }

  return 'light'
}

export function applyThemeMode(mode: ThemeMode): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(mode)
}

function getSystemPrefersDark(): boolean | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return undefined
  }
}

export function bootstrapThemeMode(): ThemeMode {
  const preference = getStoredThemePreference()
  const mode = resolveThemeMode(preference, getSystemPrefersDark())
  applyThemeMode(mode)

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.themeBootstrap = 'done'
    document.documentElement.dataset.themeMode = mode
  }

  return mode
}
