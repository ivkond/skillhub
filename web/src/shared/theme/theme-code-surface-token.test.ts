import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function extractTokenValue(cssSource: string, tokenName: string): string {
  const pattern = new RegExp(`--${tokenName}:\\s*([^;]+);`, 'g')
  const matches = Array.from(cssSource.matchAll(pattern))
  if (matches.length === 0) {
    throw new Error(`Failed to find token: --${tokenName}`)
  }
  return matches[0][1].trim()
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
  const currentFilePath = fileURLToPath(import.meta.url)
  const currentDir = path.dirname(currentFilePath)
  const cssPathCandidates = [
    path.resolve(currentDir, '../../index.css'),
    path.resolve(process.cwd(), 'web', 'src', 'index.css'),
    path.resolve(process.cwd(), 'src', 'index.css'),
    path.resolve(process.cwd(), 'index.css'),
  ]

  const cssSource = cssPathCandidates
    .filter((cssPath) => existsSync(cssPath))
    .map((cssPath) => readFileSync(cssPath, 'utf8'))
    .find((source) => /--code-surface:\s*[^;]+;/.test(source))

  if (!cssSource) {
    throw new Error(
      `Failed to load theme css with --code-surface token from paths: ${cssPathCandidates.join(', ')}`
    )
  }

  it('test_code_surface_when_light_theme_then_uses_light_background_token', () => {
    const lightToken = extractTokenValue(cssSource, 'code-surface')
    const lightness = parseHslLightness(lightToken)

    expect(lightness).toBeGreaterThan(50)
  })
})
