---
phase: 07-google-oauth
plan: "05"
status: completed
requirements_completed:
  - QA-02
  - OAUTH-05
summary: "Closed the web verification gap by making shared test helpers type-safe under strict TypeScript checks while preserving the Google OAuth login assertions."
commits: []
files_created: []
files_modified:
  - web/src/shared/components/language-switcher.test.ts
  - web/src/shared/theme/theme-code-surface-token.test.ts
verification:
  - cd web && pnpm run typecheck
  - cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx
---

# Phase 07 Plan 05 Summary

Web verification is green again for the Google OAuth rollout.

## Task outcomes

1. Reproduced the original RED and confirmed two unrelated type failures: `unknown` children in `language-switcher.test.ts` and CSS-source loading in `theme-code-surface-token.test.ts`.
2. Replaced the mocked dropdown `children` types with `ReactNode` so the test doubles satisfy strict `createElement` overloads.
3. Reworked the CSS token test to use a local `ImportMeta.glob(..., { query: '?raw' })` typing contract, keeping the test self-contained and compatible with the project's typecheck profile without adding new global declarations.

## Verification results

- `cd web && pnpm run typecheck` -> passed.
- `cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx` -> passed (`2 files`, `7 tests`).

## Notes

- GitNexus impact for `LanguageSwitcher` was `LOW` with no direct callers/process blast radius.
- The `theme-code-surface-token` test remained in file-local scope; no application code or OAuth UI assertions were weakened.
