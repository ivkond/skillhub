---
status: passed
phase: 03-web-ui
updated: 2026-04-16
---

# Phase 3 verification: Web UI (collections)

## Goal (from roadmap)

Users manage and share collections through the web app; public collection page respects VIS rules.

## Must-haves checked

| Criterion | Evidence |
|-----------|----------|
| Owner/contributor detail at `/dashboard/collections/$collectionId` with ordered skills, links to `/space/$namespace/$slug`, reorder | `web/src/app/router.tsx` route `dashboard/collections/$collectionId`; `collection-detail.tsx`, `collection-skill-rows.tsx` |
| D-09 / hidden aggregate hint without listing hidden skills | `collection-detail.tsx` uses `additionalMembersHiddenFromActorCount` with `hiddenMembersHint` i18n |
| Contributor vs owner controls | `collection-detail.tsx` — `canManageContributors`, `canReorderSkills`, edit link owner/admin |
| Contributor management (WEB-05) | `AddCollectionContributorDialog`, `useAddCollectionContributor` / remove + ConfirmDialog |
| Share affordances | `collection-share-actions.tsx` — copy public URL |
| Public `/u/$ownerKey/c/$collectionSlug` | `router.tsx` + `public-collection-page.tsx` |
| VIS-03 logged-in refetch | `usePublicCollection` then `useCollectionDetail` when session + id |
| D-08 generic not found | `public-collection-page.tsx` maps 403/404 to not-found UI |
| Skill enrichment visible ids only | `CollectionSkillRows` + `useSkillById` → `GET .../skills/id/{skillId}` |
| Reorder uses plan 02 contract | `useReorderCollectionSkills` → `collectionApi.reorderSkills` |

## Automated checks run

- `pnpm exec vitest run src/app/router.test.ts src/shared/hooks/use-collection-queries.test.ts src/shared/hooks/use-skill-by-id.test.ts` (web) — pass
- `pnpm run typecheck` (web) — pass
- `mvnw -pl skillhub-app -am test` with `SkillControllerTest` filter — pass

## Suggested manual smoke (non-blocking)

- Anonymous: public URL for a public collection shows only API-filtered skills.
- Signed-in viewer on public URL: optional richer payload after refetch when allowed.
- Private collection as stranger: generic not found.

## Gaps

None identified from automated verification.
