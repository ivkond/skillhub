import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Browser, Page, TestInfo } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { setEnglishLocale } from './helpers/auth-fixtures'
import { loginWithCredentials, registerSession } from './helpers/session'
import { E2eTestDataBuilder } from './helpers/test-data-builder'

function getAdminCredentials() {
  const username = process.env.E2E_ADMIN_USERNAME ?? process.env.BOOTSTRAP_ADMIN_USERNAME ?? 'admin'
  const password = process.env.E2E_ADMIN_PASSWORD ?? process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'ChangeMe!2026'
  return { username, password }
}

function createCsvFile(content: string): { filePath: string; cleanup: () => void } {
  const tempDir = mkdtempSync(path.join(tmpdir(), 'skillhub-e2e-csv-'))
  const filePath = path.join(tempDir, 'members.csv')
  writeFileSync(filePath, content, 'utf8')
  return {
    filePath,
    cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
  }
}

async function grantNamespaceAdminRole(
  adminBuilder: E2eTestDataBuilder,
  namespaceSlug: string,
  username: string,
) {
  const candidates = await adminBuilder.searchNamespaceMemberCandidates(namespaceSlug, username)
  const matched = candidates.find((candidate) => (
    candidate.userId === username || candidate.displayName === username
  )) ?? candidates[0]

  if (matched) {
    await adminBuilder.addNamespaceMember(namespaceSlug, matched.userId, 'ADMIN')
  }
}

async function openBatchImportDialog(page: Page) {
  const batchButton = page.getByRole('button', { name: 'Batch Import' })
  await expect(batchButton).toBeVisible()
  await batchButton.click()
  await expect(page.getByText('Batch Import Members')).toBeVisible()
}

async function withNamespaceMembersPage(
  page: Page,
  browser: Browser,
  testInfo: TestInfo,
  run: () => Promise<void>,
) {
  const credentials = await registerSession(page, testInfo)
  const builder = new E2eTestDataBuilder(page, testInfo)
  await builder.init()

  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  const adminBuilder = new E2eTestDataBuilder(adminPage, testInfo)

  try {
    await loginWithCredentials(adminPage, getAdminCredentials(), testInfo)
    await adminBuilder.init()

    const namespace = await adminBuilder.createNamespace('e2e-batch')
    await grantNamespaceAdminRole(adminBuilder, namespace.slug, credentials.username)

    await page.goto(`/dashboard/namespaces/${namespace.slug}/members`)
    await expect(page.getByRole('heading', { name: 'Member Management' })).toBeVisible()

    await run()
  } finally {
    await builder.cleanup()
    await adminBuilder.cleanup()
    await adminContext.close()
  }
}

test.describe('Batch Import Members (Real API)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await setEnglishLocale(page)
    await registerSession(page, testInfo)
  })

  test('opens batch import dialog and shows upload step', async ({ page, browser }, testInfo) => {
    await withNamespaceMembersPage(page, browser, testInfo, async () => {
      await openBatchImportDialog(page)
      await expect(page.getByText('Batch Import Members')).toBeVisible()
      await expect(page.getByText('Download CSV template')).toBeVisible()
      await expect(page.getByText('Drag a CSV file here')).toBeVisible()
    })
  })

  test('uploads CSV and shows preview with validation', async ({ page, browser }, testInfo) => {
    const csv = createCsvFile('userId,role\nuser-valid-1,MEMBER\n,ADMIN\nuser-valid-2,BADROLE\n')

    try {
      await withNamespaceMembersPage(page, browser, testInfo, async () => {
        await openBatchImportDialog(page)

        const fileInput = page.locator('input[type="file"][accept=".csv"]')
        await fileInput.setInputFiles(csv.filePath)

        await expect(page.getByText('Preview (3 rows)')).toBeVisible()
        await expect(page.getByText('1 valid, 2 invalid')).toBeVisible()
        await expect(page.getByText('Missing user ID')).toBeVisible()
        await expect(page.getByText('Invalid role')).toBeVisible()
      })
    } finally {
      csv.cleanup()
    }
  })
})
