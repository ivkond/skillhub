---
phase: 04-verification-docs
plan: "02"
status: completed
requirements_completed:
  - QA-02
summary: "Added stable Playwright coverage for a full collections journey and a private-visibility non-leak guard scenario."
commits:
  - d7ee27eb
  - 935bd35f
files_created:
  - web/e2e/collections-flow.spec.ts
  - web/e2e/collections-visibility-guard.spec.ts
files_modified: []
verification:
  - cd web && pnpm exec playwright test e2e/collections-flow.spec.ts --config=playwright.config.ts
  - cd web && pnpm exec playwright test e2e/collections-visibility-guard.spec.ts --config=playwright.config.ts
  - cd web && pnpm exec playwright test e2e/collections-flow.spec.ts e2e/collections-visibility-guard.spec.ts --config=playwright.config.ts
---

# Phase 04 Plan 02 Summary

Implemented QA-02 coverage with one end-to-end collections happy path and one explicit restricted-visibility guard case using the existing Playwright infrastructure.

## Fixture contract

| Fixture / actor | Source | Role in specs |
| --- | --- | --- |
| Primary signed-in user | `registerSession(page, testInfo)` + `E2eTestDataBuilder` | Owner in happy path; API-authenticated owner in guard spec |
| Writable namespace + published skills | `E2eTestDataBuilder.ensureWritableNamespace()`, `publishSkill(...)` | Supplies real skill IDs for collection membership |
| Skill titles | Dynamic `collections-flow-skill-*` / `private-guard-skill-*` prefixes | Avoid collisions; assertions use visible UI/API text where stable |
| Secondary browser user | `createFreshSession` + `newSecondarySession` pattern in flow spec | Contributor invite/remove lifecycle |
| Outsider (no shared session) | Fresh `browser.newContext()` + `createFreshSession` in guard spec | Unauthorized viewer for public collection URL |

## Guard definition (one sentence)

An **outsider** opening the **public** URL for a **private** collection must see **not-found style UI** and must **not** see the **private seeded skill name** in the rendered DOM (`collections-visibility-guard.spec.ts`).

## Anti-flake notes

- Reuse **`setEnglishLocale`** before navigation so UI strings match role-based selectors.
- Prefer **API envelopes** (`code === 0`) for setup steps; use **Playwright `expect` retries** on headings after navigation (same patterns as `public-pages.spec.ts` / dashboard specs).
- **Unique slugs/titles** per run (`Date.now().toString(36)`) to avoid cross-test pollution in shared dev stacks.

## INT-03 (E2E stance)

**E2E not used** for INT-03 in this milestone: Playwright seeds skills via normal publish flow and does not deterministically flip a member skill to “unreadable” mid-test. **Regression proof:** `SkillCollectionMembershipReconcileTest.int03ReconcileDeletesMembershipWhenOwnerCannotReadSkill` (see `04-01-SUMMARY.md`).

## Task outcomes

1. **`web/e2e/collections-flow.spec.ts`** — create collection → add skill → public page → contributor add/remove.
2. **`web/e2e/collections-visibility-guard.spec.ts`** — private collection + outsider + no skill title leak.
3. **CI** — `.github/workflows/pr-e2e.yml` documents explicit `collections-flow` / `collections-visibility-guard` paths (see workflow comments); full suite still runs via `make test-e2e-frontend`.

## Verification results

- `cd web && pnpm exec playwright test e2e/collections-flow.spec.ts --config=playwright.config.ts` — pass.
- `cd web && pnpm exec playwright test e2e/collections-visibility-guard.spec.ts --config=playwright.config.ts` — pass.
- Combined command — pass.

## Commits

- `d7ee27eb` — `feat(04-02): add collections happy-path E2E flow`
- `935bd35f` — `test(04-02): add collections visibility non-leak guard e2e`
