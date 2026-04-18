import { describe, expect, it } from 'vitest'

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: {
        eager: true
        import: 'default'
        query: '?raw'
      }
    ): Record<string, string>
  }
}

function extractBlock(cssSource: string, selector: string): string {
  const escapedSelector = selector.replace('.', '\\.')
  const match = cssSource.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`))
  if (!match) {
    throw new Error(`Failed to find CSS block for selector: ${selector}`)
  }
  return match[1]
}

function extractTokenValue(cssBlock: string, tokenName: string): string {
  const match = cssBlock.match(new RegExp(`--${tokenName}:\\s*([^;]+);`))
  if (!match) {
    throw new Error(`Failed to find token: --${tokenName}`)
  }
  return match[1].trim()
}

function parseHslLightness(tokenValue: string): number {
  const match = tokenValue.match(/(\d+(?:\.\d+)?)%\s*$/)
  if (!match) {
    throw new Error(`Token value is not an HSL triplet: ${tokenValue}`)
  }
  return Number(match[1])
}

describe('theme code surface token', () => {
  const cssFiles = import.meta.glob('../../index.css', {
    eager: true,
    import: 'default',
    query: '?raw',
  })
  const cssSource = cssFiles['../../index.css']

  if (typeof cssSource !== 'string') {
    throw new Error('Failed to load CSS source for token test')
  }

  it('test_code_surface_when_light_theme_then_uses_light_background_token', () => {
    const rootBlock = extractBlock(cssSource, ':root')
    const lightToken = extractTokenValue(rootBlock, 'code-surface')
    const lightness = parseHslLightness(lightToken)

    expect(lightness).toBeGreaterThan(50)
  })
})
