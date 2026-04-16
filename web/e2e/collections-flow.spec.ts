import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { setEnglishLocale } from './helpers/auth-fixtures'
import { registerSession, createFreshSession } from './helpers/session'
import { E2eTestDataBuilder } from './helpers/test-data-builder'

interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T
}

interface CreatedCollection {
  id: number
  ownerId: string
  slug: string
}

async function parseEnvelope<T>(response: Awaited<ReturnType<APIRequestContext['fetch']>>): Promise<T> {
  const body = await response.json() as ApiEnvelope<T>
  expect(response.ok(), `request failed: ${response.status()} ${body.msg}`).toBeTruthy()
  expect(body.code, body.msg).toBe(0)
  return body.data
}

async function newSecondarySession(browser: Browser, page: Page) {
  const context = await browser.newContext()
  const secondaryPage = await context.newPage()
  await setEnglishLocale(secondaryPage)
  await createFreshSession(secondaryPage)
  const me = await parseEnvelope<{ userId: string }>(
    await secondaryPage.context().request.get('/api/v1/auth/me'),
  )
  const candidateUserId = me.userId
  expect(candidateUserId).toBeTruthy()

  return {
    context,
    candidateUserId: candidateUserId!,
  }
}

test.describe('Collections happy-path flow (Real API)', () => {
  test('create collection, add skill, open public page, add and remove contributor', async ({ page, browser }, testInfo) => {
    await setEnglishLocale(page)
    await registerSession(page, testInfo)

    const builder = new E2eTestDataBuilder(page, testInfo)
    await builder.init()

    const cleanupStack: Array<() => Promise<void>> = []
    let secondaryContext: BrowserContext | null = null

    try {
      const namespace = await builder.ensureWritableNamespace()
      const seededSkillName = `collections-flow-skill-${Date.now().toString(36)}`
      const seededSkill = await builder.publishSkill(namespace.slug, { name: seededSkillName })

      const collectionTitle = `Flow Collection ${Date.now().toString(36)}`
      const collectionSlug = `flow-${Date.now().toString(36)}`

      await page.goto('/dashboard/collections/new')
      await expect(page.getByRole('heading', { name: 'Create collection' })).toBeVisible()
      await page.locator('#collection-title').fill(collectionTitle)
      await page.locator('#collection-slug').fill(collectionSlug)
      await page.locator('#collection-description').fill('Playwright happy-path collection flow')

      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Public', exact: true }).click()
      await page.getByRole('button', { name: 'Create', exact: true }).click()

      await expect(page.getByRole('heading', { name: collectionTitle, exact: true })).toBeVisible()
      expect(page.url()).toContain('/dashboard/collections/')
      const collectionId = page.url().split('/dashboard/collections/')[1]
      expect(collectionId).toBeTruthy()

      const collection = await parseEnvelope<CreatedCollection>(
        await page.context().request.get(`/api/web/collections/${encodeURIComponent(collectionId!)}`),
      )

      cleanupStack.push(async () => {
        await page.context().request.delete(`/api/web/collections/${encodeURIComponent(String(collection.id))}`)
      })

      await parseEnvelope(
        await page.context().request.post(`/api/web/collections/${encodeURIComponent(String(collection.id))}/skills`, {
          data: { skillId: seededSkill.skillId },
        }),
      )

      await page.reload()
      await expect(page.getByRole('link', { name: seededSkillName, exact: true }).first()).toBeVisible()

      const shareUrl = `${page.url().split('/dashboard/collections/')[0]}/u/${encodeURIComponent(collection.ownerId)}/c/${encodeURIComponent(collection.slug)}`
      await page.goto(shareUrl)
      await expect(page.getByRole('heading', { name: collectionTitle, exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: seededSkillName, exact: true }).first()).toBeVisible()

      const secondary = await newSecondarySession(browser, page)
      secondaryContext = secondary.context

      await page.goto(`/dashboard/collections/${collection.id}`)
      await page.getByRole('button', { name: 'Add contributor', exact: true }).click()
      await page.locator('#collection-contributor-user-id').fill(secondary.candidateUserId)
      await page.getByRole('button', { name: 'Add contributor', exact: true }).click()
      await expect(page.getByText('Contributor added')).toBeVisible()
      await expect(page.getByText(secondary.candidateUserId)).toBeVisible()

      await page.getByRole('button', { name: 'Remove', exact: true }).first().click()
      await page.getByRole('button', { name: 'Remove', exact: true }).nth(1).click()
      await expect(page.getByText('Contributor removed')).toBeVisible()
      await expect(page.getByText(secondary.candidateUserId)).not.toBeVisible()
    } finally {
      for (let index = cleanupStack.length - 1; index >= 0; index -= 1) {
        try {
          await cleanupStack[index]()
        } catch {
          // Best-effort cleanup in shared E2E environments.
        }
      }
      await builder.cleanup()
      if (secondaryContext) {
        await secondaryContext.close()
      }
    }
  })
})
