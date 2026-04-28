---
phase: 03-web-ui
plan: "03"
subsystem: web-ui
tags: [react, tanstack-router, react-query, collections, visibility]
requires:
  - phase: 02-application-api
    provides: collection REST, contributor reorder contract, public collection GET, D-09 aggregate
provides:
  - Authenticated collection detail with reorder, D-09 hint, empty CTA, skill enrichment via GET /api/web/skills/id/{id}
  - Contributor management and share actions on detail page
  - Public collection route with dual-fetch when session exists (VIS-03)
affects: [04-verification-docs]
tech-stack:
  added: []
  patterns:
    - public page uses public query then optional authenticated refetch by id
    - skill rows batch id lookup through React Query + collectionApi
key-files:
  created:
    - web/src/pages/dashboard/collection-detail.tsx
    - web/src/pages/public/public-collection-page.tsx
    - web/src/features/collection/collection-skill-rows.tsx
    - web/src/features/collection/add-collection-contributor-dialog.tsx
    - web/src/features/collection/collection-share-actions.tsx
    - web/src/shared/hooks/use-skill-by-id.ts
  modified:
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/skill/service/SkillQueryService.java
    - server/skillhub-app/src/main/java/com/iflytek/skillhub/controller/portal/SkillController.java
    - server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/SkillControllerTest.java
    - web/src/api/client.ts
    - web/src/api/generated/schema.d.ts
    - web/src/app/router.tsx
    - web/src/app/router.test.ts
    - web/src/shared/hooks/use-collection-queries.ts
    - web/src/shared/hooks/use-collection-queries.test.ts
    - web/src/pages/dashboard/collection-new.tsx
    - web/src/pages/dashboard/collections-list.tsx
    - web/src/i18n/locales/en.json
    - web/src/i18n/locales/zh.json
requirements-completed: [WEB-03, WEB-04, WEB-05, VIS-02, VIS-03, ROL-02, ROL-03]
completed: 2026-04-16
---

# Phase 3 Plan 3: Collection detail, contributors, share, public page

**Authenticated collection detail with contributor-safe reorder and skill-by-id enrichment, plus public `/u/.../c/...` with session-aware refetch and full EN/ZH i18n for new strings.**

## Performance

- **Tasks:** 2 (implemented in one integration commit after prior unstaged work)
- **Files touched:** 20 (see frontmatter)

## Task commits

1. `1a68eb62` — `feat(03-03): collection detail, contributors, public page, skill-by-id` (domain `getSkillDetailById`, portal `GET /api/web/skills/id/{skillId}`, router, hooks, pages, dialogs, i18n)

## Verification

- `cd web && pnpm exec vitest run src/app/router.test.ts src/shared/hooks/use-collection-queries.test.ts src/shared/hooks/use-skill-by-id.test.ts` — passed (9 tests).
- `cd web && pnpm run typecheck` — passed.
- `cd server && .\mvnw.cmd -pl skillhub-app -am test "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=com.iflytek.skillhub.controller.portal.SkillControllerTest"` — reactor SUCCESS.

## Deviations

- **i18n:** Plan implied keys in locale files; they were missing for new UI copy — added matching `en.json` / `zh.json` entries under `collections.*`.
- **Commit shape:** One feature commit instead of two task-scoped commits because `collection-detail.tsx` combines task 1 and task 2 concerns in one module.

## Self-check

- SUMMARY: `.planning/phases/03-web-ui/03-03-SUMMARY.md`
- Implementation commit includes server + web + i18n.

## Self-Check: PASSED
