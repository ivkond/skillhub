---
phase: 02-application-api
plan: "02"
subsystem: api-security
tags: [spring-security, authorization, api-token, integration-test]
requires:
  - phase: 02-application-api
    plan: "01"
    provides: collection controllers and app services
provides:
  - Explicit session route policies for collection endpoints
  - Explicit API token policy decision for public collection reads
  - Security regression tests for registry mappings and contributor denials
affects: [auth-policy-catalog, portal-collection-security, qa-authorization]
tech-stack:
  added: []
  patterns:
    - RouteSecurityPolicyRegistry explicit method+pattern catalog
    - SpringBootTest + MockMvc integration security matrix assertions
key-files:
  created:
    - server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java
  modified:
    - server/skillhub-auth/src/main/java/com/iflytek/skillhub/auth/policy/RouteSecurityPolicyRegistry.java
    - server/skillhub-auth/src/test/java/com/iflytek/skillhub/auth/policy/RouteSecurityPolicyRegistryTest.java
key-decisions:
  - "API tokens are read-only for collection endpoints in v1: GET /api/web/public/collections/** allowed, collection writes intentionally unsupported."
  - "Collection route registration uses explicit method-scoped patterns to avoid broad matcher drift and preserve permitAll precedence for public owner/slug reads."
requirements-completed: [ROL-07, QA-01, VIS-01, VIS-02]
duration: 46min
completed: 2026-04-15
---

# Phase 2 Plan 2: Collection Route Security Summary

Collection endpoints are now fully registered in the security route catalog with explicit method-scoped policies, and integration coverage proves contributor-denied owner operations while preserving allowed contributor skill membership actions.

## Performance

- **Duration:** 46 min
- **Tasks:** 4
- **Files modified:** 3

## Accomplishments

- Added explicit `AUTHORIZATION_POLICIES` rows for all `/api/web/me/collections`, `/api/web/collections/...`, and `/api/web/public/collections/*/*` endpoints.
- Added explicit API-token decision comment and read-only allow row for `/api/web/public/collections/**`, leaving collection writes unsupported for tokens per v1 requirements.
- Extended `RouteSecurityPolicyRegistryTest` with route assertions for public collection reads and authenticated collection management routes.
- Added `SkillCollectionSecurityIT` to validate contributor forbidden matrix (metadata update, delete, contributor management) plus allowed contributor add-skill and owner update success.

## Task Commits

1. **Task 1: Extend RouteSecurityPolicyRegistry for collections** - `21e3485b` (feat)
2. **Task 2: RouteSecurityPolicyRegistryTest coverage for new patterns** - `83402139` (test)
3. **Task 3: SkillCollectionSecurityIT contributor forbidden matrix** - `49a58d92` (test)
4. **Task 4: [BLOCKING] make test-backend** - no code changes committed

## Verification Results

- `./mvnw -q -pl skillhub-auth -DskipTests compile` (Task 1): passed
- `./mvnw -q -pl skillhub-auth -Dtest=RouteSecurityPolicyRegistryTest test` (Task 2): passed
- `./mvnw -q -pl skillhub-app -Dtest=SkillCollectionSecurityIT test` (Task 3): passed
- `make test-backend` (Task 4): failed in this Windows shell due Makefile command-form env assignment (`JDK_JAVA_OPTIONS=...`) being interpreted as a command; executed equivalent backend gate `.\mvnw.cmd test` from `server/` and confirmed **BUILD SUCCESS**.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Fallback execution for backend test gate on Windows shell**
- **Found during:** Task 4
- **Issue:** `make test-backend` fails in current shell runtime before Maven starts because inline env assignment syntax in recipe is not accepted.
- **Fix:** Executed equivalent backend gate via `.\mvnw.cmd test` in `server/` to validate full backend tests.
- **Files modified:** None
- **Commit:** None (verification-only deviation)

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- Found file: `.planning/phases/02-application-api/02-02-SUMMARY.md`
- Found commit: `21e3485b`
- Found commit: `83402139`
- Found commit: `49a58d92`
