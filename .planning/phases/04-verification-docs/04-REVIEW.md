---
phase: 04-verification-docs
reviewed: 2026-04-16T12:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java
  - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionDomainServiceTest.java
  - web/e2e/collections-flow.spec.ts
  - web/e2e/collections-visibility-guard.spec.ts
  - document/docs/04-developer/api/authenticated.md
  - document/i18n/en/docusaurus-plugin-content-docs/current/04-developer/api/authenticated.md
  - docs/e2e.md
  - document/package.json
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues
---

# Phase 04: Code Review Report

**Reviewed:** 2026-04-16T12:00:00Z  
**Depth:** standard  
**Files Reviewed:** 8  
**Status:** issues  

## Executive summary

The Phase 04 scope mixes integration tests, domain unit tests, Playwright E2E, developer API docs, E2E runbook text, and Docusaurus `package.json`. Domain service tests are precise and aligned with authorization rules. `SkillCollectionSecurityIT` deliberately tolerates multiple HTTP statuses and message shapes for “not found” and some denial paths, which matches heterogeneous API behavior but weakens regression signal on whether the product standardizes on **403** vs **404** vs envelope `code`. The authenticated API docs incorrectly document the public collection HTTP path; the implementation and `SkillCollectionSecurityIT` use `/api/web/public/collections/...` and `/api/v1/public/collections/...`. Playwright flows are generally event-driven, but contributor removal uses ordinal **Remove** button clicks that can flake if the UI order changes. `docs/e2e.md` is partially stale (directory tree and spec count vs the current `web/e2e` tree). `document/package.json` pins `webpack` via `overrides`; that is a supply-chain posture choice that should stay documented and periodically reconciled with upstream advisories.

## Critical issues

None.

## Warnings

### WR-001

**Files:** `document/docs/04-developer/api/authenticated.md:115`, `document/i18n/en/docusaurus-plugin-content-docs/current/04-developer/api/authenticated.md:115`  
**Severity:** warning  
**Issue:** The “public / share” collection HTTP route is documented as `GET /api/web/users/{ownerId}/collections/{slug}`. The server registers anonymous access on `/api/web/public/collections/*/*` and `/api/v1/public/collections/*/*` (see `RouteSecurityPolicyRegistry` and `SkillCollectionSecurityIT`), and there is no matching `/api/web/users/{ownerId}/collections/{slug}` controller pattern in the server tree. Integrators following the doc will call a non-existent or wrong path.  
**Recommendation:** Replace the documented line with the real routes, for example:

```http
GET /api/web/public/collections/{ownerId}/{slug}
GET /api/v1/public/collections/{ownerId}/{slug}
```

Keep the note that the browser share URL may remain `/u/{ownerId}/c/{slug}` if that is a separate SPA route, but distinguish SPA URL from backend JSON API paths.

### WR-002

**File:** `web/e2e/collections-flow.spec.ts:108-110`  
**Severity:** warning  
**Issue:** After adding a contributor, the test dismisses the flow by clicking **Remove** twice—`.first()` then `.nth(1)`—without scoping to the contributor row or a test id. If the page renders multiple **Remove** controls in a different order (e.g., skills vs contributors, or future UI changes), the test can click the wrong control or become order-dependent.  
**Recommendation:** Prefer a stable selector: `getByRole('row', { name: secondary.candidateUserId }).getByRole('button', { name: 'Remove' })`, or add `data-testid` on the contributor row actions in the app and target that from the spec.

## Info

### IN-001

**File:** `docs/e2e.md:27-43`, `docs/e2e.md:54-55`  
**Severity:** info  
**Issue:** Section 2’s directory tree omits many existing specs (including `collections-flow.spec.ts` and `collections-visibility-guard.spec.ts`), while section 3 lists them. The narrative also states “23 个 spec”; the repository currently has substantially more `web/e2e/*.spec.ts` files than that figure, so the runbook understates real breadth.  
**Recommendation:** Refresh the tree snippet to match `web/e2e` (or replace it with “see `web/e2e/*.spec.ts`”) and update the count to an automated value or remove the hard-coded number.

### IN-002

**File:** `server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java:559-607`  
**Severity:** info  
**Issue:** Helper assertions intentionally accept alternative status/body combinations (`assertContributorDenied`, `assertNotFoundLike`, `assertDeniedLike`). That reduces brittleness when the API returns either **400** or **404** for not-found-style responses, or **403** vs domain **400** for contributor denial, but it also means a future unintended change (e.g., always returning **403** with a new message) might still satisfy some branches.  
**Recommendation:** If the product contract stabilizes, narrow assertions to the canonical status and message key per endpoint, and keep a single compatibility test if legacy clients still matter.

### IN-003

**File:** `web/e2e/collections-visibility-guard.spec.ts:66`  
**Severity:** info  
**Issue:** The assertion `getByRole('heading', { name: 'Collection not found' })` is English-only. If E2E runs with a non-English locale or copy changes, the test fails for localization rather than for a security regression.  
**Recommendation:** Assert on a `data-testid` for the not-found state, URL pattern, or absence of sensitive identifiers (already partially covered by negative text checks) in a locale-agnostic way.

### IN-004

**File:** `document/package.json:47-49`  
**Severity:** info  
**Issue:** `"overrides": { "webpack": "5.94.0" }` pins a transitive dependency. That can mitigate a known vulnerable range but also diverges from what `@docusaurus/*` was tested against, and it can lag behind upstream security fixes unless someone actively bumps it.  
**Recommendation:** Add a short comment in the repo (e.g., next to overrides in docs or a `document/README` note) stating why the pin exists (CVE id or issue link) and a reminder to re-check on Docusaurus upgrades; run `pnpm audit` after dependency bumps.

---

_Reviewed: 2026-04-16T12:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
