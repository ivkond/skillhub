import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SeverityBadge } from './severity-badge'
import type { FindingSeverity } from './types'

vi.mock('react-i18next', async () => {
  const actual = await vi.importActual<typeof import('react-i18next')>('react-i18next')
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en' },
    }),
  }
})

describe('SeverityBadge', () => {
  const severities: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

  it.each(severities)('renders the translated label for %s severity', (severity) => {
    const html = renderToStaticMarkup(<SeverityBadge severity={severity} />)

    expect(html).toContain(`securityAudit.severity.${severity}`)
  })

  it('applies semantic danger state classes for CRITICAL severity', () => {
    const html = renderToStaticMarkup(<SeverityBadge severity="CRITICAL" />)

    expect(html).toContain('state-danger')
  })

  it('applies semantic danger state classes for HIGH severity', () => {
    const html = renderToStaticMarkup(<SeverityBadge severity="HIGH" />)

    expect(html).toContain('state-danger')
  })

  it('applies semantic warning state classes for MEDIUM severity', () => {
    const html = renderToStaticMarkup(<SeverityBadge severity="MEDIUM" />)

    expect(html).toContain('state-warning')
  })

  it('applies semantic info state classes for LOW severity', () => {
    const html = renderToStaticMarkup(<SeverityBadge severity="LOW" />)

    expect(html).toContain('state-info')
  })

  it('applies semantic success state classes for INFO severity', () => {
    const html = renderToStaticMarkup(<SeverityBadge severity="INFO" />)

    expect(html).toContain('state-success')
  })

  it('renders as a span with rounded-full pill styling', () => {
    const html = renderToStaticMarkup(<SeverityBadge severity="LOW" />)

    expect(html).toContain('rounded-full')
    expect(html).toContain('text-xs')
    expect(html).toContain('font-medium')
  })
})
