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
  const selectorIndex = cssSource.indexOf(selector)
  if (selectorIndex === -1) {
    throw new Error(`Failed to find CSS block for selector: ${selector}`)
  }

  const openBraceIndex = cssSource.indexOf('{', selectorIndex + selector.length)
  if (openBraceIndex === -1) {
    throw new Error(`Failed to find CSS block for selector: ${selector}`)
  }

  let depth = 1
  let cursor = openBraceIndex + 1
  while (cursor < cssSource.length && depth > 0) {
    const char = cssSource[cursor]
    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
    }
    cursor += 1
  }

  if (depth !== 0) {
    throw new Error(`Failed to find CSS block for selector: ${selector}`)
  }

  return cssSource.slice(openBraceIndex + 1, cursor - 1)
}

function extractTokenValue(cssBlock: string, tokenName: string): string {
  const match = cssBlock.match(new RegExp(`--${tokenName}:\\s*([^;]+);`))
  if (!match) {
    throw new Error(`Failed to find token: --${tokenName}`)
  }
  return match[1].trim()
}

function parseHslLightness(tokenValue: string): number {
  const percentIndex = tokenValue.lastIndexOf('%')
  if (percentIndex <= 0) {
    throw new Error(`Token value is not an HSL triplet: ${tokenValue}`)
  }

  let start = percentIndex - 1
  while (start >= 0) {
    const char = tokenValue[start]
    if ((char >= '0' && char <= '9') || char === '.') {
      start -= 1
      continue
    }
    break
  }

  const value = Number(tokenValue.slice(start + 1, percentIndex))
  if (!Number.isFinite(value)) {
    throw new Error(`Token value is not an HSL triplet: ${tokenValue}`)
  }
  return value
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
