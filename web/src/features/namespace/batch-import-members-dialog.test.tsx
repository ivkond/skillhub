// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BatchImportMembersDialog,
  parseCsv,
  validateRows,
} from './batch-import-members-dialog'

const batchMutation = {
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isPending: false,
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/shared/hooks/use-namespace-queries', () => ({
  useBatchAddNamespaceMembers: () => batchMutation,
}))

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/shared/ui/button', () => ({
  Button: ({
    children,
    type = 'button',
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} {...props}>{children}</button>
  ),
}))

vi.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DialogDescription: ({ children, className }: { children: ReactNode; className?: string }) => (
    <p className={className}>{children}</p>
  ),
  DialogFooter: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DialogTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
    <h2 className={className}>{children}</h2>
  ),
  DialogTrigger: ({ children }: { children: ReactNode; asChild?: boolean }) => <>{children}</>,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('parseCsv', () => {
  it('parses basic CSV with header', () => {
    const result = parseCsv('userId,role\nuser-1,MEMBER\nuser-2,ADMIN')
    expect(result).toEqual([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-2', role: 'ADMIN' },
    ])
  })

  it('parses CSV without header', () => {
    const result = parseCsv('user-1,MEMBER\nuser-2,ADMIN')
    expect(result).toEqual([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-2', role: 'ADMIN' },
    ])
  })

  it('handles Windows line endings', () => {
    const result = parseCsv('userId,role\r\nuser-1,MEMBER\r\nuser-2,ADMIN\r\n')
    expect(result).toEqual([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-2', role: 'ADMIN' },
    ])
  })

  it('normalizes role to uppercase', () => {
    const result = parseCsv('user-1,member\nuser-2,admin')
    expect(result).toEqual([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-2', role: 'ADMIN' },
    ])
  })

  it('skips empty lines', () => {
    const result = parseCsv('userId,role\nuser-1,MEMBER\n\n\nuser-2,ADMIN\n')
    expect(result).toEqual([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-2', role: 'ADMIN' },
    ])
  })

  it('returns empty array for empty input', () => {
    expect(parseCsv('')).toEqual([])
    expect(parseCsv('\n\n')).toEqual([])
  })

  it('handles missing role column', () => {
    const result = parseCsv('user-1')
    expect(result).toEqual([{ userId: 'user-1', role: '' }])
  })

  it('trims whitespace from values', () => {
    const result = parseCsv('  user-1  ,  MEMBER  ')
    expect(result).toEqual([{ userId: 'user-1', role: 'MEMBER' }])
  })
})

describe('validateRows', () => {
  it('marks valid rows', () => {
    const result = validateRows([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-2', role: 'ADMIN' },
    ])
    expect(result).toEqual([
      { userId: 'user-1', role: 'MEMBER', validation: 'valid' },
      { userId: 'user-2', role: 'ADMIN', validation: 'valid' },
    ])
  })

  it('flags missing userId', () => {
    const result = validateRows([{ userId: '', role: 'MEMBER' }])
    expect(result[0].validation).toBe('missing_user_id')
  })

  it('flags invalid role', () => {
    const result = validateRows([{ userId: 'user-1', role: 'OWNER' }])
    expect(result[0].validation).toBe('invalid_role')
  })

  it('flags empty role as invalid', () => {
    const result = validateRows([{ userId: 'user-1', role: '' }])
    expect(result[0].validation).toBe('invalid_role')
  })

  it('flags duplicate userIds', () => {
    const result = validateRows([
      { userId: 'user-1', role: 'MEMBER' },
      { userId: 'user-1', role: 'ADMIN' },
    ])
    expect(result[0].validation).toBe('valid')
    expect(result[1].validation).toBe('duplicate')
  })

  it('checks missing userId before duplicate', () => {
    const result = validateRows([{ userId: '', role: 'MEMBER' }])
    expect(result[0].validation).toBe('missing_user_id')
  })
})

describe('BatchImportMembersDialog', () => {
  it('renders the upload drop zone as a real button and keeps the hidden file input unfocusable', () => {
    const { container } = render(
      <BatchImportMembersDialog slug="team-ai">
        <button type="button">members.batchImport</button>
      </BatchImportMembersDialog>,
    )

    const uploadButton = screen.getByRole('button', { name: 'members.batchDropHint' })
    expect(uploadButton.tagName).toBe('BUTTON')

    const fileInput = container.querySelector('input[type="file"][accept=".csv"]')
    expect(fileInput).not.toBeNull()
    expect(fileInput?.getAttribute('aria-hidden')).toBeNull()
    expect(fileInput?.getAttribute('tabindex')).toBe('-1')
  })
})
