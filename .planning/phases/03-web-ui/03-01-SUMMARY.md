---
phase: 03-web-ui
plan: "01"
subsystem: web-ui
tags: [react, tanstack-router, react-query, i18n, collections]
requires:
  - phase: 02-application-api
    provides: collection REST endpoints for dashboard CRUD/list
provides:
  - Dashboard routes/pages for collections list/create/edit
  - Typed collection API client + React Query hooks
  - i18n/menu/dashboard entry points for collections UX
affects: [03-02-backend-contract, 03-03-collection-detail]
tech-stack:
  added: []
  patterns:
    - protected routes via `beforeLoad: requireAuth`
    - form error mapping from `ApiError` server messages
key-files:
  created:
    - web/src/pages/dashboard/collections-list.tsx
    - web/src/pages/dashboard/collection-new.tsx
    - web/src/pages/dashboard/collection-edit.tsx
    - web/src/shared/lib/skill-collection-form-errors.ts
  modified:
    - web/src/api/client.ts
    - web/src/api/generated/schema.d.ts
    - web/src/shared/hooks/use-collection-queries.ts
    - web/src/shared/hooks/use-collection-queries.test.ts
    - web/src/app/router.tsx
    - web/src/app/router.test.ts
    - web/src/pages/dashboard.tsx
    - web/src/shared/components/user-menu.tsx
    - web/src/i18n/locales/en.json
    - web/src/i18n/locales/zh.json
requirements-completed: [WEB-01, WEB-02]
completed: 2026-04-15
---

# Phase 3 Plan 1: Web UI Collections Entry Flow

Выполнены маршруты и базовые экраны для «My collections»: список, создание и редактирование, плюс клиентские hooks/API и точки входа из dashboard/menu.

## Task commits

1. `0450ebbb` — `feat(03-01): add collectionApi and sync OpenAPI schema`
2. `db81e5c5` — `feat(03-01): add use-collection-queries and hook tests`
3. `e6c06a9f` — `feat(03-01): add collections dashboard routes and forms`

## GitNexus impact (before final edits/commit)

- `router.tsx` (`web/src/app/router.tsx`) — risk `LOW`, d=1: `cli-auth.tsx`, `providers.tsx`; d=2: `main.tsx`.
- `DashboardPage` — risk `LOW`, direct callers: 0.
- `UserMenu` — risk `LOW`, direct callers: 0.
- `router.test.ts` — risk `LOW`, direct callers: 0.
- Новые symbol’ы (`CollectionsListPage`, `CollectionNewPage`, `CollectionEditPage`, `mapCollectionMutationError`) не найдены в текущем индексе (они появились в незакоммиченных изменениях до обновления индекса).

## Verification

- `cd web && pnpm exec vitest run src/app/router.test.ts src/shared/hooks/use-collection-queries.test.ts` — passed (`2 files`, `6 tests`).
- `cd web && pnpm run typecheck` — passed.

## Deviations and fixes during execution

- Исправлен тест на маршруты: `JSON.stringify(routeTree)` заменён на безопасный обход дерева путей (без circular JSON).
- Устранены TS-ошибки: проектный `Button` не поддерживает `asChild`; заменено на `Link` + `buttonVariants` без изменения UX.

## Self-check

- SUMMARY создан: `.planning/phases/03-web-ui/03-01-SUMMARY.md`
- План 03-01 завершён тремя атомарными task commit’ами.
