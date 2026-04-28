---
phase: 04-verification-docs
plan: "03"
status: completed
requirements_completed:
  - QA-03
summary: "Updated authenticated API and E2E docs to include collection routes, role semantics, and phase-4 Playwright verification commands."
commits: []
files_created: []
files_modified:
  - document/docs/04-developer/api/authenticated.md
  - document/i18n/en/docusaurus-plugin-content-docs/current/04-developer/api/authenticated.md
  - docs/e2e.md
  - document/package.json
verification:
  - rg -n "collections" document/docs/04-developer/api/authenticated.md document/i18n/en/docusaurus-plugin-content-docs/current/04-developer/api/authenticated.md
  - rg -n "collections-flow.spec.ts|collections-visibility-guard.spec.ts" docs/e2e.md
  - cd document && npm install && npm run build
---

# Phase 04 Plan 03 Summary

Completed QA-03 by integrating collection API and verification guidance into existing developer docs and E2E runbook.

## Task outcomes

1. **Authenticated API docs** — Collections routes and role semantics in ZH + EN `authenticated.md`.
2. **E2E runbook** — `docs/e2e.md` lists `collections-flow.spec.ts` and `collections-visibility-guard.spec.ts` with exact `pnpm exec playwright` commands.
3. **Docs build** — `cd document && npm run build` completed successfully after adding an `overrides` pin (`webpack` `5.94.0`) so Docusaurus 3.9.x stays compatible with Webpack’s ProgressPlugin schema (fresh installs were pulling a newer Webpack that rejected the plugin options).

## Verification

- `rg` checks on API docs and `docs/e2e.md` — pass.
- `cd document && npm run build` — **pass** (2026-04-16, orchestrator run).

## OpenAPI

Generated OpenAPI is served from the running Spring app (`/v3/api-docs`); collections routes appear there when the server is up — see developer API doc intro for the usual `openapi-typescript` workflow in `web/package.json`.
