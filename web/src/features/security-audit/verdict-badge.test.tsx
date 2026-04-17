import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { VerdictBadge } from './verdict-badge'
import type { SecurityVerdict } from './types'

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

describe('VerdictBadge', () => {
  const verdicts: SecurityVerdict[] = ['SAFE', 'SUSPICIOUS', 'DANGEROUS', 'BLOCKED']

  it.each(verdicts)('renders the translated label for %s verdict', (verdict) => {
    const html = renderToStaticMarkup(<VerdictBadge verdict={verdict} />)

    expect(html).toContain(`securityAudit.verdict.${verdict}`)
  })

  it('applies semantic success state classes for SAFE verdict', () => {
    const html = renderToStaticMarkup(<VerdictBadge verdict="SAFE" />)

    expect(html).toContain('state-success')
  })

  it('applies semantic warning state classes for SUSPICIOUS verdict', () => {
    const html = renderToStaticMarkup(<VerdictBadge verdict="SUSPICIOUS" />)

    expect(html).toContain('state-warning')
  })

  it('applies semantic danger state classes for DANGEROUS verdict', () => {
    const html = renderToStaticMarkup(<VerdictBadge verdict="DANGEROUS" />)

    expect(html).toContain('state-danger')
  })

  it('applies semantic danger state classes for BLOCKED verdict', () => {
    const html = renderToStaticMarkup(<VerdictBadge verdict="BLOCKED" />)

    expect(html).toContain('state-danger')
  })

  it('applies semantic info state classes for SCANNING display state', () => {
    const html = renderToStaticMarkup(<VerdictBadge displayState="SCANNING" />)

    expect(html).toContain('state-info')
  })

  it('renders the scanning label for pending scan display state', () => {
    const html = renderToStaticMarkup(<VerdictBadge displayState="SCANNING" />)

    expect(html).toContain('securityAudit.statusScanning')
  })

  it('renders the scan failed label for failed scan display state', () => {
    const html = renderToStaticMarkup(<VerdictBadge displayState="SCAN_FAILED" />)

    expect(html).toContain('securityAudit.statusScanFailed')
  })

  it('renders as a span with rounded-full pill styling', () => {
    const html = renderToStaticMarkup(<VerdictBadge verdict="SAFE" />)

    expect(html).toContain('rounded-full')
    expect(html).toContain('text-sm')
    expect(html).toContain('font-medium')
  })
})
