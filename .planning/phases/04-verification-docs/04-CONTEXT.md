# Phase 4: Verification & docs - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver confidence for skill collections by finishing verification and documentation only: complete `QA-01..QA-03` with representative backend tests, stable E2E coverage, and concise docs updates linked into the existing documentation tree.

</domain>

<decisions>
## Implementation Decisions

### QA-01 backend authorization matrix
- **D-01:** Prioritize representative high-risk routes across owner/contributor/stranger/admin instead of exhaustive permutation testing of every endpoint.
- **D-02:** Keep matrix coverage focused on mutations and sensitive reads where role errors or visibility leaks are most likely.

### QA-02 E2E scope
- **D-03:** Ship one full happy-path E2E journey (`create collection -> add skill -> share/open public -> contributor add/remove`) as the primary acceptance flow.
- **D-04:** Add at least one visibility/permission guard E2E case to prove non-leak behavior for restricted access paths.

### Local + CI execution strategy
- **D-05:** Reuse existing Playwright infrastructure and fixtures/seeding patterns already used in `web/e2e`.
- **D-06:** Wire new specs into the current E2E workflow so CI validates the same core scenarios as local runs.

### QA-03 documentation scope
- **D-07:** Add concise developer-facing documentation for collection endpoints and test execution guidance.
- **D-08:** Link new docs into the current docs tree instead of creating standalone orphan files.

### Cross-review follow-up (from `04-REVIEWS.md`, `/gsd-plan-phase 4 --reviews`)
- **D-09 (INT-03):** Implementation lives in Phase 2; Phase 4 must still ship **named regression evidence** for **INT-03** (skill no longer readable → collection membership handled per product rules). Minimum: one **domain or integration** test with an explicit scenario name and assertions; E2E for the same transition is optional and may be **documented as out of scope** in `04-02-SUMMARY.md` if the Playwright environment cannot flip skill visibility deterministically.
- **D-10 (Auth matrix):** `04-01-SUMMARY.md` must include a **route × role × expected HTTP/outcome** table (or equivalent bullet matrix) so “representative routes” is auditable after merge.
- **D-11 (E2E clarity):** `04-02-SUMMARY.md` must state **which users/skills/fixtures** each spec assumes, define the **guard** in one sentence (actor + resource + expected forbidden/hidden), and note **anti-flake** choices (waits, seeds, selectors) aligned with existing `web/e2e` patterns.
- **D-12 (Docs beyond `rg`):** After content edits, run **`npm run build`** in `document/` (or the repo’s canonical docs build) so broken links fail the wave; keep **English mirror** section headings for the collections area aligned with the primary `authenticated.md` (same `##` structure for the new block).

### `SkillCollectionControllerIT` scope (clarification)
- **D-13:** Default **reference-only** for 04-01; extend it only if parity or coverage gaps remain after `SkillCollectionSecurityIT` / domain updates.

### Claude's Discretion
- Exact test file naming and scenario decomposition, as long as decisions above and `QA-01..QA-03` are met.
- Exact docs location between developer API docs and user-facing docs, as long as links are discoverable from current navigation.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone contracts
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, and planned slices (`04-01`, `04-02`, `04-03`).
- `.planning/REQUIREMENTS.md` — `QA-01..QA-03` requirements and role/visibility constraints carried from earlier phases.
- `.planning/PROJECT.md` — v1 scope boundaries and non-goals to avoid verification drift.

### Prior phase decisions
- `.planning/phases/03-web-ui/03-CONTEXT.md` — web behavior to verify, including public/private handling and contributor UX expectations.
- `.planning/phases/01-domain-persistence/01-CONTEXT.md` — foundational domain and visibility assumptions that tests should preserve.

### Existing verification/doc tooling
- `web/playwright.config.ts` — canonical Playwright setup.
- `web/e2e/dashboard-routes.spec.ts` — E2E style and conventions for authenticated routing tests.
- `web/e2e/public-pages.spec.ts` — public visibility test patterns.
- `server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java` — current security integration baseline for collection APIs.
- `.github/workflows/pr-e2e.yml` — CI E2E workflow integration point.
- `document/docs/04-developer/api/authenticated.md` — likely doc target for developer-facing API updates.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing Playwright setup in `web/playwright.config.ts` and active `web/e2e/*.spec.ts` patterns for auth/session fixtures.
- Existing backend security integration tests for collections in `SkillCollectionSecurityIT`.

### Established Patterns
- E2E tests are organized by feature route/behavior under `web/e2e`.
- Docs follow Docusaurus structure under `document/docs` and mirrored English i18n pages.

### Integration Points
- Phase 4 tests should validate behavior delivered in Phase 2 API and Phase 3 web routes.
- Docs updates should be linked from the current developer API documentation tree.

</code_context>

<specifics>
## Specific Ideas

- Use pragmatic defaults: representative matrix coverage, one core E2E flow plus one guard case, and concise documentation updates.
- Prioritize confidence and maintainability over exhaustive test explosion.

</specifics>

<deferred>
## Deferred Ideas

None — discussion remained within Phase 4 scope.

</deferred>

---

*Phase: 04-verification-docs*
*Context gathered: 2026-04-16*
