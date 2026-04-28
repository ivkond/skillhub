---
phase: 07
slug: google-oauth
status: in_progress
nyquist_compliant: false
wave_1_complete: true
wave_2_complete: false
created: 2026-04-17
updated: 2026-04-18
---

# Phase 07 - Validation Strategy

Per-phase validation contract for Google OAuth rollout.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | JUnit 5 + Spring Boot Test + Vitest + Playwright |
| Backend quick command | `cd server && .\\mvnw.cmd -pl skillhub-auth -Dtest=GoogleClaimsExtractorTest,OAuthLoginFlowServiceTest test` |
| Backend full gate command | `cd server && .\\mvnw.cmd -pl skillhub-auth,skillhub-app -Dtest=GoogleClaimsExtractorTest,OAuthLoginFlowServiceTest,AuthControllerTest test` |
| Web quick command | `cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx` |
| Web gate command | `cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx && pnpm run typecheck` |
| E2E command | `cd web && pnpm run test:e2e -- e2e/auth-entry.spec.ts` |
| Docs command | `cd document && npm run build` |

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Command | Status |
|---------|------|------|-------------|---------|--------|
| 07-01-01 | 01 | 1 | OAUTH-01, OAUTH-02 | `cd server && .\\mvnw.cmd -pl skillhub-auth -Dtest=GoogleClaimsExtractorTest test` | green |
| 07-01-02 | 01 | 1 | SEC-01, SEC-02 | `cd server && .\\mvnw.cmd -pl skillhub-auth -Dtest=OAuthLoginFlowServiceTest test` | green |
| 07-02-01 | 02 | 1 | OAUTH-05, QA-02 | `cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx` | green |
| 07-03-01 | 03 | 2 | OAUTH-04, QA-01 | `cd server && .\\mvnw.cmd -pl skillhub-app -Dtest=AuthControllerTest test` | blocked (unrelated compile errors) |
| 07-03-01 | 03 | 2 | OAUTH-06, QA-02 | `cd web && pnpm run test:e2e -- e2e/auth-entry.spec.ts` | green |

## Manual Verification

| Behavior | Requirement | Instructions |
|----------|-------------|--------------|
| Real Google callback smoke | OAUTH-06 | Configure Google OAuth credentials, execute `/oauth2/authorization/google`, verify successful redirect and active session. |

## Nyquist Transition Rule

`nyquist_compliant` can switch from `false` to `true` only in a dedicated verification commit after all required evidence is green and reviewer sign-off is approved.

### Machine-checkable gate

```yaml
nyquist_transition_gate:
  phase: 07
  transition: false->true
  required_evidence:
    - id: EVID-07-BACKEND
      command: cd server && .\\mvnw.cmd -pl skillhub-auth,skillhub-app -Dtest=GoogleClaimsExtractorTest,OAuthLoginFlowServiceTest,AuthControllerTest test
      status: green
    - id: EVID-07-WEB
      command: cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx && pnpm run typecheck
      status: green
    - id: EVID-07-DOCS
      command: cd document && npm run build
      status: green
  reviewer_signoff:
    required: true
    role: phase-07-reviewer
    value: approved
```

### Gate Evidence Registry

| Evidence ID | Status | Executor | Executed At | Notes |
|-------------|--------|----------|-------------|-------|
| EVID-07-BACKEND | red | executor | 2026-04-18 | Command failed in unrelated `skillhub-app` test-compile symbols outside phase-07 scope. |
| EVID-07-WEB | red | executor | 2026-04-18 | Target tests passed, but `pnpm run typecheck` failed in unrelated files (`language-switcher.test.ts`, `theme-code-surface-token.test.ts`). |
| EVID-07-DOCS | green | executor | 2026-04-18 | `cd document && npm run build` passed for `zh-CN` and `en`. |

## Release Gate Checklist

- [ ] Backend verification gate is green
- [ ] Web verification gate is green
- [x] Docs build gate is green
- [ ] Reviewer sign-off is approved
- [ ] `nyquist_compliant` switched to `true` in dedicated closeout commit

## Execution Log

- `cd server && .\\mvnw.cmd -pl skillhub-auth,skillhub-app -Dtest=GoogleClaimsExtractorTest,OAuthLoginFlowServiceTest,AuthControllerTest test` -> failed due unrelated `skillhub-app` test compile errors.
- `cd server && .\\mvnw.cmd -pl skillhub-app -Dtest=AuthControllerTest test` -> failed for the same unrelated compile errors.
- `cd web && pnpm run test -- src/features/auth/login-button.test.ts src/pages/login.test.tsx` -> passed.
- `cd web && pnpm run typecheck` -> failed due unrelated existing issues.
- `cd web && pnpm run test:e2e -- e2e/auth-entry.spec.ts` -> passed (`2/2`).
- `cd document && npm run build` -> passed.
