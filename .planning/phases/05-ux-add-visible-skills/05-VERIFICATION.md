---
phase: 05-ux-add-visible-skills
verified: 2026-04-16T23:42:30Z
status: passed
score: 10/10 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 9/10
  gaps_closed:
    - "Regression suite keeps contributor/owner/public add-flow behavior safe after rollout (including QA-02 contributor add/remove coverage)."
  gaps_remaining: []
  regressions: []
---

# Phase 05: UX Add Visible Skills Verification Report

**Phase Goal:** Обновить UX потока добавления навыков в коллекцию так, чтобы owner/contributor/admin могли за один проход добавлять любые видимые им skills через inline-modal picker с full discovery controls и multi-select commit.
**Verified:** 2026-04-16T23:42:30Z
**Status:** passed
**Re-verification:** Yes — after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Add-flow data source returns visible skills with search/filter/sort/pagination controls. | ✓ VERIFIED | `useCollectionAddCandidates` uses stable `add-candidates` query key and `/api/web/skills` fetch path (`web/src/shared/hooks/use-collection-queries.ts:191`, `:200`), dialog renders search/filter/sort/pagination controls (`web/src/features/collection/add-collection-skills-dialog.tsx:45`, `:223`, `:319`). |
| 2 | Batch add action preserves server-side authorization and duplicate rejection by reusing single-add API. | ✓ VERIFIED | Batch mutation loops over `collectionApi.addSkill`, classifies duplicates into `alreadyInCollectionIds`, and tracks failures (`web/src/shared/hooks/use-collection-queries.ts:222`, `:226`, `:229`). |
| 3 | Collection detail cache is invalidated after successful add. | ✓ VERIFIED | On success (`addedIds.length > 0`), invalidates `['collections','mine']` and `['collections', id]` (`web/src/shared/hooks/use-collection-queries.ts:239-240`). |
| 4 | Collection detail exposes prominent Add skill entry for owner/contributor/admin-equivalent actors. | ✓ VERIFIED | `canManageSkills` includes owner/contributor/admin-equivalent and renders add trigger in header and empty-state entry (`web/src/pages/dashboard/collection-detail.tsx:34`, `:38`, `:138`, `:153`). |
| 5 | Picker is inline modal with multi-select commit `Add selected (N)`. | ✓ VERIFIED | Inline dialog uses selection state and localized CTA `collections.addSelected` with count (`web/src/features/collection/add-collection-skills-dialog.tsx:319`). |
| 6 | Already-added candidates are visible, non-selectable, and labeled. | ✓ VERIFIED | Candidate rows compute disabled state via `alreadyInCollection` and render `collections.alreadyInCollection` badge/text (`web/src/features/collection/add-collection-skills-dialog.tsx:270`, `:285`, `:288`). |
| 7 | Empty addable-candidate state renders explicit guidance and CTA. | ✓ VERIFIED | Modal shows `add-collection-skills-empty-state` with localized title/description/CTA (`web/src/features/collection/add-collection-skills-dialog.tsx:223`). |
| 8 | Primary E2E flow adds skills through Add Skill modal, not API membership shortcut. | ✓ VERIFIED | E2E drives UI path: open modal, select row, click `Add selected (1)` (`web/e2e/collections-flow.spec.ts:111`, `:116`); no direct collection-skill POST call in spec. |
| 9 | Contributor/owner/public behavior remains visibility-safe after rollout. | ✓ VERIFIED | Spec now performs contributor add + remove assertions (`Contributor added` / `Contributor removed`) after public-page visibility checks (`web/e2e/collections-flow.spec.ts:121`, `:135`, `:140`). |
| 10 | Regression suite protects duplicate-add and partial-outcome behavior. | ✓ VERIFIED | Hook and dialog tests assert `addedIds/alreadyInCollectionIds/failedIds` and partial selection handling (`web/src/shared/hooks/use-collection-queries.test.ts:262`, `:290-292`; `web/src/features/collection/add-collection-skills-dialog.test.tsx:241`, `:278-280`). |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `web/src/shared/hooks/use-collection-queries.ts` | Candidate + batch-add hooks | ✓ VERIFIED | Exists, substantive, and wired into dialog/tests. |
| `web/src/shared/hooks/use-collection-queries.test.ts` | Hook-level regression contract | ✓ VERIFIED | Exists and passes with duplicate/partial assertions. |
| `web/src/features/collection/add-collection-skills-dialog.tsx` | Inline modal picker UX | ✓ VERIFIED | Exists, substantive UI behavior, wired into detail page. |
| `web/src/pages/dashboard/collection-detail.tsx` | Role-gated entry points | ✓ VERIFIED | Header + empty-state add triggers are wired. |
| `web/src/i18n/locales/en.json` | EN add-flow copy keys | ✓ VERIFIED | Required keys exist (`addSkillAction`, `alreadyInCollection`, `addSelected`, empty-state keys). |
| `web/src/i18n/locales/zh.json` | ZH add-flow copy keys | ✓ VERIFIED | Required keys exist for same keyset as EN. |
| `web/e2e/collections-flow.spec.ts` | E2E coverage for real modal flow + contributor management checks | ✓ VERIFIED | Includes create -> modal add -> public view -> contributor add/remove scenario. |
| `web/src/features/collection/add-collection-skills-dialog.test.tsx` | Component regressions for partial outcomes | ✓ VERIFIED | Includes partial-selection + duplicate-disabled scenario. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `web/src/shared/hooks/use-collection-add-candidates.ts` | `web/src/shared/hooks/use-collection-queries.ts` | Candidate mapper integration | WIRED | Mapper import + usage (`use-collection-queries.ts:6`, `:200`). |
| `web/src/shared/hooks/use-collection-queries.ts` | `web/src/api/client.ts` | `useBulkAddCollectionSkills` uses `collectionApi.addSkill` per selected skill | WIRED | Per-skill API call in hook (`use-collection-queries.ts:222`), endpoint impl in client (`api/client.ts:797-804`). |
| `web/src/shared/hooks/use-collection-queries.test.ts` | `web/src/shared/hooks/use-collection-queries.ts` | Hook contract assertions (classification + invalidation) | WIRED | Tests import and assert batch result/invalidation behavior (`use-collection-queries.test.ts:262`, `:290-292`). |
| `web/src/pages/dashboard/collection-detail.tsx` | `web/src/features/collection/add-collection-skills-dialog.tsx` | Header/empty-state trigger opens modal | WIRED | Dialog imported and mounted in both entry points (`collection-detail.tsx:136-154`). |
| `web/src/features/collection/add-collection-skills-dialog.tsx` | `web/src/shared/hooks/use-collection-queries.ts` | Modal consumes candidate query + bulk mutation hooks | WIRED | Hook imports and invocations (`add-collection-skills-dialog.tsx:7`, `:45`, `:54`). |
| `web/src/features/collection/add-collection-skills-dialog.tsx` | `web/src/i18n/locales/en.json` | Dialog copy resolved via `collections.*` locale keys | WIRED | Key usage in component (`add-collection-skills-dialog.tsx:270`, `:319`) and key presence in locale (`en.json:371-378`). |
| `web/src/features/collection/add-collection-skills-dialog.tsx` | `web/e2e/collections-flow.spec.ts` | E2E drives modal `Add selected` path | WIRED | Spec uses dialog selectors and `Add selected (1)` CTA (`collections-flow.spec.ts:111`, `:116`). |
| `web/src/pages/public/public-collection-page.tsx` | `web/e2e/collections-flow.spec.ts` | Public visibility assertions after add-flow mutation | WIRED | Public route assertion via generated share URL and skill link checks (`collections-flow.spec.ts:121-124`). |
| `web/src/shared/hooks/use-collection-queries.test.ts` | `web/src/features/collection/add-collection-skills-dialog.test.tsx` | Shared duplicate/partial contract across hook + UI layers | WIRED | Both suites assert `addedIds/alreadyInCollectionIds/failedIds` handling (`use-collection-queries.test.ts:290-292`, `add-collection-skills-dialog.test.tsx:278-280`). |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `web/src/features/collection/add-collection-skills-dialog.tsx` | `candidatesQuery.data.items` | `useCollectionAddCandidates` -> `fetchJson(buildSkillSearchUrl(...))` -> `/api/web/skills` | Yes | ✓ FLOWING |
| `web/src/features/collection/add-collection-skills-dialog.tsx` | `selectedSkillIds` payload | `useBulkAddCollectionSkills` -> `collectionApi.addSkill` per id | Yes | ✓ FLOWING |
| `web/src/pages/dashboard/collection-detail.tsx` | `data.members` / `memberSkillIds` | `useCollectionDetail` -> `collectionApi.getById` | Yes | ✓ FLOWING |
| `web/src/pages/public/public-collection-page.tsx` | `collection.members` | `usePublicCollection` plus authenticated refetch (`useCollectionDetail`) with 403/404-safe handling | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Hook + dialog regressions | `cd web && pnpm run test -- src/shared/hooks/use-collection-queries.test.ts src/features/collection/add-collection-skills-dialog.test.tsx` | `2 files passed, 14 tests passed` | ✓ PASS |
| Type safety | `cd web && pnpm run typecheck` | `tsc --noEmit` exit 0 | ✓ PASS |
| E2E flow incl. contributor add/remove | `cd web && pnpm run test:e2e -- e2e/collections-flow.spec.ts` | retry #1 failed by timeout on `Cancel` click; retry #2 passed (`1 passed`) | ✓ PASS (flaky warning) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `COL-04` | 05-01/02/03 | Owner can add only readable skills (server-validated) | ✓ SATISFIED | Client flow uses server endpoint `collectionApi.addSkill`, no local bypass (`use-collection-queries.ts:222`, `api/client.ts:797-804`). |
| `ROL-04` | 05-01/02/03 | Contributor can add skill under same validation | ✓ SATISFIED | Contributor is included in `canManageSkills` gate and uses same batch add path (`collection-detail.tsx:34`, `:38`). |
| `INT-01` | 05-01/02/03 | Server rejects unreadable adds with clear error | ✓ SATISFIED | Batch logic handles server errors deterministically via `failedIds` and duplicate key classification (`use-collection-queries.ts:226-229`). |
| `VIS-03` | 05-01/02/03 | Public member list shows only viewer-visible skills | ✓ SATISFIED | Public page enforces 403/404-safe response handling and renders only returned members (`public-collection-page.tsx:21-24`, `:95`). |
| `WEB-03` | 05-01/02 | Collection detail shows ordered skills with links | ✓ SATISFIED | `CollectionSkillRows` sorts by `sortOrder` and renders link to `/space/$namespace/$slug` (`collection-skill-rows.tsx:49`, `:56`, `:101`). |
| `QA-02` | 05-03 | E2E covers create -> add skill -> public view -> contributor add/remove | ✓ SATISFIED | `collections-flow.spec.ts` executes full sequence including contributor add/remove assertions (`collections-flow.spec.ts:58`, `:111`, `:121`, `:135`, `:140`); commit `f82e68e6` restores this coverage. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `web/e2e/collections-flow.spec.ts` | 117 | Intermittent timeout on `Cancel` click after submit (element detach) observed in first rerun | ⚠️ Warning | Flaky risk in CI; does not block phase goal because rerun passed and coverage is present |

### Human Verification Required

None.

### Gaps Summary

Предыдущий gap по `QA-02` закрыт: в `collections-flow.spec.ts` теперь есть фактические шаги и проверки contributor add/remove, а не только упоминание в названии теста.  
Фаза достигла цели, must_haves подтверждены, регрессий относительно ранее закрытых пунктов не обнаружено.

---

_Verified: 2026-04-16T23:42:30Z_  
_Verifier: Claude (gsd-verifier)_
