import { expect, test, type APIResponse, type Page, type TestInfo } from '@playwright/test'
import { setEnglishLocale } from './helpers/auth-fixtures'
import { registerSession } from './helpers/session'

const THEME_STORAGE_KEY = 'skillhub-theme'

interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T
}

interface CreatedCollection {
  id: number
}

type ContrastResult = {
  ratio: number
  minRatio: number
  textColor: string
  backgroundColor: string
}

async function parseEnvelope<T>(response: APIResponse): Promise<T> {
  const body = await response.json() as ApiEnvelope<T>
  expect(response.ok(), `request failed: ${response.status()} ${body.msg}`).toBeTruthy()
  expect(body.code, body.msg).toBe(0)
  return body.data
}

async function createCollection(page: Page, testInfo: TestInfo): Promise<CreatedCollection> {
  const suffix = `${testInfo.parallelIndex}-${Date.now().toString(36)}`
  return parseEnvelope<CreatedCollection>(
    await page.context().request.post('/api/web/collections', {
      data: {
        title: `A11y ${suffix}`,
        slug: `a11y-${suffix}`.slice(0, 60),
        description: 'Accessibility gate collection',
        visibility: 'PUBLIC',
      },
    }),
  )
}

async function createCollectionViaUi(page: Page, testInfo: TestInfo): Promise<CreatedCollection> {
  const suffix = `${testInfo.parallelIndex}-${Date.now().toString(36)}`
  const title = `A11y ${suffix}`
  const slug = `a11y-${suffix}`.slice(0, 60)

  await page.goto('/dashboard/collections/new', { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('collection-new-form')).toBeVisible()
  await page.getByTestId('collection-new-title-input').fill(title)
  await page.getByTestId('collection-new-slug-input').fill(slug)
  await page.getByTestId('collection-new-description-input').fill('Accessibility gate collection')
  await page.getByTestId('collection-new-visibility-trigger').click()
  await page.getByTestId('collection-new-visibility-public').click()
  await page.getByTestId('collection-new-submit').click()

  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  const collectionId = page.url().split('/dashboard/collections/')[1]
  if (!collectionId) {
    throw new Error('Collection ID is missing in URL after UI create flow.')
  }

  return parseEnvelope<CreatedCollection>(
    await page.context().request.get(`/api/web/collections/${encodeURIComponent(collectionId)}`),
  )
}

async function createCollectionForAccessibility(page: Page, testInfo: TestInfo): Promise<CreatedCollection> {
  try {
    return await createCollection(page, testInfo)
  } catch {
    return createCollectionViaUi(page, testInfo)
  }
}

async function removeCollection(page: Page, id: number): Promise<void> {
  await page.context().request.delete(`/api/web/collections/${encodeURIComponent(String(id))}`)
}

async function gotoWithTheme(page: Page, route: string, theme: 'light' | 'dark'): Promise<void> {
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ key, value }) => {
    window.localStorage.setItem(key, value)
  }, { key: THEME_STORAGE_KEY, value: theme })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('data-theme-mode', theme)
}

async function focusElementWithKeyboard(page: Page, selector: string, maxTabs = 40): Promise<void> {
  const target = page.locator(selector).first()
  await expect(target).toBeVisible()
  await page.evaluate(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) {
      active.blur()
    }
  })
  for (let step = 0; step < maxTabs; step += 1) {
    await page.keyboard.press('Tab')
    const isFocused = await target.evaluate((node) => node === document.activeElement)
    if (isFocused) {
      return
    }
  }
  throw new Error(`Failed to focus selector '${selector}' via Tab within ${maxTabs} steps.`)
}

async function getContrast(page: Page, textSelector: string, backgroundSelector: string): Promise<ContrastResult> {
  await expect(page.locator(textSelector).first()).toBeVisible()
  await expect(page.locator(backgroundSelector).first()).toBeVisible()

  const contrast = await page.evaluate(({ textSelectorArg, backgroundSelectorArg }) => {
    const parseHex = (input: string): [number, number, number, number] | null => {
      const hex = input.trim().replace('#', '')
      if (![3, 4, 6, 8].includes(hex.length) || !/^[\da-f]+$/i.test(hex)) {
        return null
      }
      const expanded = hex.length <= 4
        ? hex.split('').map((char) => char + char).join('')
        : hex
      const hasAlpha = expanded.length === 8
      const r = Number.parseInt(expanded.slice(0, 2), 16)
      const g = Number.parseInt(expanded.slice(2, 4), 16)
      const b = Number.parseInt(expanded.slice(4, 6), 16)
      const a = hasAlpha ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1
      if ([r, g, b, a].some((value) => Number.isNaN(value))) {
        return null
      }
      return [r, g, b, a]
    }

    const parseCssColor = (input: string): [number, number, number, number] | null => {
      const hex = parseHex(input)
      if (hex) {
        return hex
      }
      const rgbMatch = input.match(/rgba?\(([^)]+)\)/i)
      if (!rgbMatch) {
        return null
      }
      const parts = rgbMatch[1]
        .replaceAll('/', ' ')
        .replaceAll(',', ' ')
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
      if (parts.length < 3) {
        return null
      }
      const parseChannel = (value: string): number =>
        value.endsWith('%')
          ? (Number.parseFloat(value) / 100) * 255
          : Number.parseFloat(value)
      const parseAlpha = (value: string): number =>
        value.endsWith('%')
          ? Number.parseFloat(value) / 100
          : Number.parseFloat(value)

      const r = parseChannel(parts[0])
      const g = parseChannel(parts[1])
      const b = parseChannel(parts[2])
      const a = parts[3] ? parseAlpha(parts[3]) : 1
      if ([r, g, b, a].some((value) => Number.isNaN(value))) {
        return null
      }
      return [r, g, b, a]
    }
    const resolveColor = (raw: string): [number, number, number, number] | null => {
      const parsed = parseCssColor(raw)
      if (parsed) {
        return parsed
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        context.fillStyle = '#000000'
        context.fillStyle = raw
        const normalized = context.fillStyle
        const fromCanvas = parseCssColor(normalized)
        if (fromCanvas) {
          return fromCanvas
        }
      }

      const probe = document.createElement('span')
      probe.style.color = raw
      probe.style.display = 'none'
      document.body.appendChild(probe)
      const normalized = window.getComputedStyle(probe).color
      probe.remove()
      return parseCssColor(normalized)
    }

    const relativeLuminance = (r: number, g: number, b: number): number => {
      const toLinear = (channel: number): number => {
        const normalized = channel / 255
        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4
      }
      const lr = toLinear(r)
      const lg = toLinear(g)
      const lb = toLinear(b)
      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
    }

    const textNode = document.querySelector(textSelectorArg)
    const backgroundNode = document.querySelector(backgroundSelectorArg)
    if (!textNode || !backgroundNode) {
      return null
    }

    const textStyle = window.getComputedStyle(textNode)
    const textColorRaw = textStyle.color
    const textColor = resolveColor(textColorRaw)
    if (!textColor) {
      return null
    }

    let candidate: Element | null = backgroundNode
    let backgroundColorRaw = 'rgb(255, 255, 255)'
    let backgroundColor: [number, number, number, number] | null = null
    while (candidate) {
      const computed = window.getComputedStyle(candidate)
      const resolved = resolveColor(computed.backgroundColor)
      if (resolved && resolved[3] > 0) {
        backgroundColorRaw = computed.backgroundColor
        backgroundColor = resolved
        break
      }
      candidate = candidate.parentElement
    }

    if (!backgroundColor) {
      backgroundColor = resolveColor(backgroundColorRaw)
    }
    if (!backgroundColor) {
      return null
    }

    const textLum = relativeLuminance(textColor[0], textColor[1], textColor[2])
    const bgLum = relativeLuminance(backgroundColor[0], backgroundColor[1], backgroundColor[2])
    const ratio = (Math.max(textLum, bgLum) + 0.05) / (Math.min(textLum, bgLum) + 0.05)

    const fontSize = Number.parseFloat(textStyle.fontSize || '0')
    const fontWeight = Number.parseInt(textStyle.fontWeight || '400', 10)
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700)
    const minRatio = isLargeText ? 3.0 : 4.5

    return {
      ratio,
      minRatio,
      textColor: textColorRaw,
      backgroundColor: backgroundColorRaw,
    }
  }, {
    textSelectorArg: textSelector,
    backgroundSelectorArg: backgroundSelector,
  })

  if (!contrast) {
    throw new Error(`Contrast probe failed for selectors text='${textSelector}' background='${backgroundSelector}'`)
  }

  return contrast
}

async function expectVisibleFocusIndicator(page: Page): Promise<void> {
  const hasVisibleFocus = await page.evaluate(() => {
    const activeElement = document.activeElement
    if (!(activeElement instanceof HTMLElement) || activeElement === document.body) {
      return false
    }
    const style = window.getComputedStyle(activeElement)
    const outlineWidth = Number.parseFloat(style.outlineWidth || '0')
    const hasOutline = style.outlineStyle !== 'none'
      && outlineWidth > 0
      && style.outlineColor !== 'rgba(0, 0, 0, 0)'
    const hasRingShadow = style.boxShadow !== 'none'
    const className = typeof activeElement.className === 'string' ? activeElement.className : ''
    const hasFocusUtility = className.includes('focus:')
    const hasFocusVisibleUtility = className.includes('focus-visible:')
    const isFocusVisible = activeElement.matches(':focus-visible')
    return hasOutline || hasRingShadow || (isFocusVisible && (hasFocusUtility || hasFocusVisibleUtility))
  })
  expect(hasVisibleFocus).toBeTruthy()
}

test.describe('Theme accessibility gate', () => {
  test('contrast checks satisfy WCAG AA on critical screens in light and dark themes', async ({ page }, testInfo) => {
    await setEnglishLocale(page)

    const loginPairs = [
      { textSelector: '#username', backgroundSelector: '.glass-strong' },
    ]
    for (const theme of ['light', 'dark'] as const) {
      await gotoWithTheme(page, '/login', theme)
      for (const pair of loginPairs) {
        const contrast = await getContrast(page, pair.textSelector, pair.backgroundSelector)
        expect(
          contrast.ratio,
          `login(${theme}) ratio=${contrast.ratio.toFixed(2)} text=${contrast.textColor} bg=${contrast.backgroundColor}`,
        ).toBeGreaterThanOrEqual(contrast.minRatio)
      }
    }

    await registerSession(page, testInfo)
    const collection = await createCollectionForAccessibility(page, testInfo)

    try {
      const routePairs = [
        { route: '/', name: 'landing', textSelector: 'main h2', backgroundSelector: 'main' },
        { route: '/dashboard', name: 'dashboard', textSelector: 'h1', backgroundSelector: 'main' },
        {
          route: `/dashboard/collections/${collection.id}`,
          name: 'collection detail',
          textSelector: '[data-testid="collection-detail-page"] h2',
          backgroundSelector: '[data-testid="collection-detail-page"]',
        },
        { route: '/dashboard/notifications', name: 'notifications', textSelector: 'h1', backgroundSelector: 'main' },
      ] as const

      for (const theme of ['light', 'dark'] as const) {
        for (const pair of routePairs) {
          await gotoWithTheme(page, pair.route, theme)
          const contrast = await getContrast(page, pair.textSelector, pair.backgroundSelector)
          expect(
            contrast.ratio,
            `${pair.name}(${theme}) ratio=${contrast.ratio.toFixed(2)} text=${contrast.textColor} bg=${contrast.backgroundColor}`,
          ).toBeGreaterThanOrEqual(contrast.minRatio)
        }
      }
    } finally {
      await removeCollection(page, collection.id)
    }
  })

  test('keyboard traversal covers Tab/Shift+Tab/Enter/Space/Escape without trap on critical controls', async ({ page }, testInfo) => {
    await setEnglishLocale(page)
    await registerSession(page, testInfo)
    const collection = await createCollectionForAccessibility(page, testInfo)

    try {
      await gotoWithTheme(page, '/dashboard/collections/' + collection.id, 'light')

      await focusElementWithKeyboard(page, '[data-testid="collection-detail-back-to-list"]')
      await expectVisibleFocusIndicator(page)
      await page.keyboard.press('Tab')
      await expectVisibleFocusIndicator(page)
      await page.keyboard.press('Shift+Tab')
      await expect(page.getByTestId('collection-detail-back-to-list')).toBeFocused()
      await expectVisibleFocusIndicator(page)

      await focusElementWithKeyboard(page, '[data-testid="collection-detail-add-skill-empty"]')
      await expectVisibleFocusIndicator(page)

      await page.keyboard.press('Enter')
      await expect(page.getByTestId('add-collection-skills-dialog')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByTestId('add-collection-skills-dialog')).not.toBeVisible()

      await focusElementWithKeyboard(page, '[data-testid="collection-detail-add-contributor"]')
      await page.keyboard.press('Space')
      await expect(page.getByTestId('collection-detail-contributor-dialog')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByTestId('collection-detail-contributor-dialog')).not.toBeVisible()
    } finally {
      await removeCollection(page, collection.id)
    }
  })

  test('focus indicator is visible for keyboard path controls in both themes', async ({ page }, testInfo) => {
    await setEnglishLocale(page)
    await registerSession(page, testInfo)
    const collection = await createCollectionForAccessibility(page, testInfo)

    try {
      const focusTargets = [
        { route: '/', selector: 'main a[href="/dashboard/publish"]' },
        { route: '/dashboard', selector: 'main a[href="/dashboard/collections"]' },
        { route: '/dashboard/notifications', selector: 'main button:has-text("Back to Dashboard")' },
        { route: `/dashboard/collections/${collection.id}`, selector: '[data-testid="collection-detail-back-to-list"]' },
        { route: '/login', selector: '#username' },
      ] as const

      for (const theme of ['light', 'dark'] as const) {
        for (const target of focusTargets) {
          await gotoWithTheme(page, target.route, theme)
          await focusElementWithKeyboard(page, target.selector)
          await expectVisibleFocusIndicator(page)
        }
      }
    } finally {
      await removeCollection(page, collection.id)
    }
  })
})
