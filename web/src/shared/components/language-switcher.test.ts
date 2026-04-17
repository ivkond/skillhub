// @vitest-environment jsdom

import { createElement } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as mod from './language-switcher'

const changeLanguage = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en-US',
      changeLanguage,
    },
  }),
}))

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: unknown }) => createElement('div', { 'data-testid': 'menu-root' }, children),
  DropdownMenuTrigger: ({ children }: { children: unknown }) => createElement('div', {}, children),
  DropdownMenuContent: ({ children, className }: { children: unknown; className?: string }) => (
    createElement('div', { 'data-testid': 'menu-content', className }, children)
  ),
  DropdownMenuItem: ({
    children,
    className,
    onClick,
  }: {
    children: unknown
    className?: string
    onClick?: () => void
  }) => createElement('button', { type: 'button', className, onClick }, children),
}))

describe('language-switcher module exports', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('exports the LanguageSwitcher component', () => {
    expect(mod.LanguageSwitcher).toBeTypeOf('function')
  })

  it('renders menu with semantic dark-safe classes and highlights active language with readable contrast', () => {
    render(createElement(mod.LanguageSwitcher))

    const menuContent = screen.getByTestId('menu-content')
    expect(menuContent.className).toContain('bg-card')
    expect(menuContent.className).toContain('text-card-foreground')

    const englishOption = within(menuContent).getByRole('button', { name: 'English' })
    expect(englishOption.className).toContain('bg-primary')
    expect(englishOption.className).toContain('text-primary-foreground')
  })

  it('changes language when another option is clicked', () => {
    render(createElement(mod.LanguageSwitcher))

    fireEvent.click(screen.getByRole('button', { name: '中文' }))
    expect(changeLanguage).toHaveBeenCalledWith('zh')
  })
})
