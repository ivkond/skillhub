// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BatchImportMembersDialog,
  parseCsv,
  validateRows,
} from './batch-import-members-dialog'

const expectedParsedRows = [
  { userId: 'user-1', role: 'MEMBER' },
  { userId: 'user-2', role: 'ADMIN' },
]

const renderDialog = () =>
  render(
    <BatchImportMembersDialog slug="team-ai">
      <button type="button">members.batchImport</button>
    </BatchImportMembersDialog>,
  )

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

vi.mock('@/shared/ui/dialog', () => {
  const renderTag = (tag: 'div' | 'p' | 'h2') => (
    { children, className }: { children: ReactNode; className?: string },
  ) => {
    const Tag = tag
    return <Tag className={className}>{children}</Tag>
  }

  return {
    Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogContent: renderTag('div'),
    DialogDescription: renderTag('p'),
    DialogFooter: renderTag('div'),
    DialogHeader: renderTag('div'),
    DialogTitle: renderTag('h2'),
    DialogTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('parseCsv', () => {
  it.each([
    ['parses basic CSV with header', 'userId,role\nuser-1,MEMBER\nuser-2,ADMIN'],
    ['parses CSV without header', 'user-1,MEMBER\nuser-2,ADMIN'],
    ['handles Windows line endings', 'userId,role\r\nuser-1,MEMBER\r\nuser-2,ADMIN\r\n'],
    ['normalizes role to uppercase', 'user-1,member\nuser-2,admin'],
    ['skips empty lines', 'userId,role\nuser-1,MEMBER\n\n\nuser-2,ADMIN\n'],
  ])('%s', (_, csvText) => {
    expect(parseCsv(csvText)).toEqual(expectedParsedRows)
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
      ...expectedParsedRows,
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
    const { container } = renderDialog()

    const uploadButton = screen.getByRole('button', { name: 'members.batchDropHint' })
    expect(uploadButton.tagName).toBe('BUTTON')

    const fileInput = container.querySelector('input[type="file"][accept=".csv"]')
    expect(fileInput).not.toBeNull()
    expect(fileInput?.getAttribute('aria-hidden')).toBeNull()
    expect(fileInput?.getAttribute('tabindex')).toBe('-1')
  })
})
