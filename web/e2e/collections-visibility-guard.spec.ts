import { expect, test, type APIResponse } from '@playwright/test'
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

async function parseEnvelope<T>(response: APIResponse): Promise<T> {
  const body = await response.json() as ApiEnvelope<T>
  expect(response.ok(), `request failed: ${response.status()} ${body.msg}`).toBeTruthy()
  expect(body.code, body.msg).toBe(0)
  return body.data
}

test.describe('Collections visibility guard (Real API)', () => {
  test('private collection page does not leak skill details to unauthorized users', async ({ page, browser }, testInfo) => {
    await setEnglishLocale(page)
    await registerSession(page, testInfo)

    const builder = new E2eTestDataBuilder(page, testInfo)
    await builder.init()

    let collectionId: number | null = null
    const namespace = await builder.ensureWritableNamespace()
    const skillName = `private-guard-skill-${Date.now().toString(36)}`
    const seededSkill = await builder.publishSkill(namespace.slug, { name: skillName })

    try {
      const collectionSlug = `private-guard-${Date.now().toString(36)}`
      const created = await parseEnvelope<CreatedCollection>(
        await page.context().request.post('/api/web/collections', {
          data: {
            title: 'Private guard collection',
            description: 'Visibility guard checks',
            slug: collectionSlug,
            visibility: 'PRIVATE',
          },
        }),
      )
      collectionId = created.id

      await parseEnvelope(
        await page.context().request.post(`/api/web/collections/${encodeURIComponent(String(created.id))}/skills`, {
          data: { skillId: seededSkill.skillId },
        }),
      )

      const publicRoute = `/u/${encodeURIComponent(created.ownerId)}/c/${encodeURIComponent(created.slug)}`

      const outsiderContext = await browser.newContext()
      const outsiderPage = await outsiderContext.newPage()
      await setEnglishLocale(outsiderPage)
      await createFreshSession(outsiderPage, testInfo)

      await outsiderPage.goto(publicRoute)
      await expect(outsiderPage.getByRole('heading', { name: 'Collection not found' })).toBeVisible()
      await expect(outsiderPage.getByText(skillName, { exact: true })).not.toBeVisible()
      await expect(outsiderPage.getByText(seededSkill.slug, { exact: false })).not.toBeVisible()

      await outsiderContext.close()
    } finally {
      if (collectionId != null) {
        try {
          await page.context().request.delete(`/api/web/collections/${encodeURIComponent(String(collectionId))}`)
        } catch {
          // Best-effort cleanup in shared E2E environments.
        }
      }
      await builder.cleanup()
    }
  })
})
