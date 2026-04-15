---
phase: 02-application-api
reviewed: 2026-04-15T00:00:00Z
depth: deep
files_reviewed: 25
files_reviewed_list:
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/AddContributorRequest.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/AddSkillToCollectionRequest.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/CollectionSkillReorderRequest.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionContributorResponse.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionCreateRequest.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionMemberResponse.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionResponse.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionUpdateRequest.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/service/SkillCollectionPortalCommandAppService.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/service/SkillCollectionPortalQueryAppService.java
  - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionContributorRepository.java
  - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionContributorService.java
  - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionRepository.java
  - server/skillhub-infra/src/main/java/com/iflytek/skillhub/infra/jpa/SkillCollectionContributorJpaRepository.java
  - server/skillhub-infra/src/main/java/com/iflytek/skillhub/infra/jpa/SkillCollectionJpaRepository.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/controller/portal/PublicSkillCollectionController.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/controller/portal/SkillCollectionController.java
  - server/skillhub-auth/src/main/java/com/iflytek/skillhub/auth/policy/RouteSecurityPolicyRegistry.java
  - server/skillhub-auth/src/test/java/com/iflytek/skillhub/auth/policy/RouteSecurityPolicyRegistryTest.java
  - server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java
  - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionMembershipService.java
  - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionMembershipReconcileTest.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/SkillhubApplication.java
  - server/skillhub-app/src/main/java/com/iflytek/skillhub/schedule/SkillCollectionReconciliationScheduler.java
  - server/skillhub-app/src/main/resources/application.yml
findings:
  critical: 1
  warning: 4
  info: 1
  total: 6
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-15T00:00:00Z  
**Depth:** deep  
**Files Reviewed:** 25  
**Status:** issues_found

## Summary

Deep review covered DTO validation contracts, controller-to-app-service call chains, domain authorization gates, route-policy enforcement, scheduler safety, and relevant tests for authz behavior.

The main regression risk is a global CSRF bypass for all `/api/**` routes, including session-authenticated write endpoints. Additional risks are weak security defaults in config, missing slug format constraints at API boundaries, and an unhandled null edge case in membership reordering when called outside HTTP validation.

## Critical Issues

### CR-01: CSRF effectively disabled for all API routes

**File:** `server/skillhub-auth/src/main/java/com/iflytek/skillhub/auth/policy/RouteSecurityPolicyRegistry.java:152-160`  
**Issue:** `shouldIgnoreCsrf()` returns `true` for any path starting with `/api/`, regardless of auth mechanism. This bypasses CSRF checks for session/cookie-authenticated mutating endpoints such as:
- `POST /api/web/collections`
- `PATCH /api/web/collections/*`
- `DELETE /api/web/collections/*`
- contributor/skill management routes in the same controller surface.

Because the application uses servlet sessions (`spring.session.store-type: redis` in `application.yml`), this opens a CSRF attack path if a browser carries an authenticated session cookie.

**Fix:**
```java
public boolean shouldIgnoreCsrf(String path, String authorizationHeader) {
    // Ignore CSRF only for bearer-token requests (stateless auth), not all API routes.
    return authorizationHeader != null && authorizationHeader.startsWith("Bearer ");
}
```
Also ensure CSRF token enforcement is active for cookie/session web APIs and add integration tests for cross-site POST/PATCH/DELETE rejection without CSRF token.

## Warnings

### WR-01: Predictable default bootstrap admin password in runtime config

**File:** `server/skillhub-app/src/main/resources/application.yml:183`  
**Issue:** `BOOTSTRAP_ADMIN_PASSWORD` defaults to `ChangeMe!2026`. If bootstrap is enabled without explicit override, production/admin compromise risk is high due to known credential.

**Fix:** Remove default and fail fast:
```yaml
password: ${BOOTSTRAP_ADMIN_PASSWORD:}
```
Then validate at startup: when `bootstrap.admin.enabled=true`, require non-empty strong password (or load from secret manager).

### WR-02: Default cookie secret is static and guessable

**File:** `server/skillhub-app/src/main/resources/application.yml:127`  
**Issue:** `anonymous-cookie-secret` defaults to `change-me-in-production`. If not overridden, anonymous rate-limit cookie signatures are forgeable/bypassable.

**Fix:** Remove insecure default and enforce explicit secret in non-dev profiles:
```yaml
anonymous-cookie-secret: ${SKILLHUB_DOWNLOAD_ANON_COOKIE_SECRET:}
```
Add startup validation for production profiles.

### WR-03: Slug contract too permissive (format not constrained)

**Files:**  
- `server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionCreateRequest.java:19-21`  
- `server/skillhub-app/src/main/java/com/iflytek/skillhub/dto/collection/SkillCollectionUpdateRequest.java:14-15`  
- `server/skillhub-app/src/main/java/com/iflytek/skillhub/controller/portal/PublicSkillCollectionController.java:26-31`  
**Issue:** Slug is only length-validated (no character policy), but later used in path-based lookup `/api/web/public/collections/{ownerId}/{slug}`. Inputs with spaces, uppercase, reserved chars, or encoded separators can create unstable routing, normalization mismatch, or inconsistent uniqueness semantics.

**Fix:** Add explicit slug regex and normalization rule at DTO/domain boundary, e.g. lowercase kebab-case:
```java
@Pattern(regexp = "^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$",
         message = "{validation.skillCollection.slug.allowed}")
String slug
```
Also normalize (`trim().toLowerCase(Locale.ROOT)`) before persistence and uniqueness checks.

### WR-04: Reorder service can throw NPE for null element outside controller validation

**File:** `server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionMembershipService.java:93`  
**Issue:** `Set.copyOf(orderedSkillIds)` throws `NullPointerException` if a caller passes a list containing `null`. HTTP route is protected by DTO validation, but service is public and callable from non-HTTP code, causing 500-class failures instead of domain error contract.

**Fix:**
```java
if (orderedSkillIds.stream().anyMatch(Objects::isNull)) {
    throw new DomainBadRequestException("error.skillCollection.order.skillId.notNull");
}
if (!existingIds.equals(new HashSet<>(orderedSkillIds))) {
    throw new DomainBadRequestException("error.skillCollection.reorder.setMismatch");
}
```

## Info

### IN-01: Test coverage gap for visibility update permissions and CSRF behavior

**Files:**  
- `server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java`  
- `server/skillhub-auth/src/test/java/com/iflytek/skillhub/auth/policy/RouteSecurityPolicyRegistryTest.java`  
**Issue:** Current tests cover contributor denial for metadata/delete/contributor-management and route policy registration, but do not assert:
1) contributor denial on `/collections/{id}/visibility`, and  
2) CSRF enforcement behavior for cookie-authenticated mutating `/api/web/collections/**` routes.

**Fix:** Add dedicated integration tests for visibility authorization and CSRF-protected mutating requests without token.

## Open Questions / Assumptions

1. Assumption: `/api/web/**` endpoints are intended to support session-cookie auth for browser clients (not bearer-only). If false, CSRF severity may reduce.  
2. Assumption: Collection slug is intended to be URL-safe and human-readable (kebab-case). If arbitrary Unicode slug is intentional, contract docs + encoding strategy should be explicit.  
3. Question: Are bootstrap admin settings guaranteed disabled in production by deployment policy? If yes, config warnings should still be enforced by startup guards to prevent drift.

---

_Reviewed: 2026-04-15T00:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: deep_
