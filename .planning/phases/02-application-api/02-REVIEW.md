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
  critical: 0
  warning: 0
  info: 0
  total: 0
status: resolved
resolved_at: 2026-04-15T14:44:53+03:00
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-15T00:00:00Z  
**Depth:** deep  
**Files Reviewed:** 25  
**Status:** resolved

## Summary

Deep review covered DTO validation contracts, controller-to-app-service call chains, domain authorization gates, route-policy enforcement, scheduler safety, and relevant tests for authz behavior. All originally reported findings were addressed in follow-up commits and validated by green backend test suite.

Current review status: no remaining critical/warning findings for Phase 02 scope.

## Resolution Update (2026-04-15)

- CSRF ignore behavior now applies only to bearer-token requests in `RouteSecurityPolicyRegistry.shouldIgnoreCsrf(...)`.
- Collection slug constraints were added to create/update DTOs and localized validation messages.
- Membership reorder null-element handling is explicitly guarded in domain service tests and implementation path.
- Security/integration coverage was expanded (`SkillCollectionSecurityIT`) to include contributor/stranger/admin matrix, INT-01/INT-02, VIS-03 filtering, and CSRF-sensitive behavior.
- Scheduler reconciliation now isolates per-collection failures and logs warning without aborting the batch.
- Bootstrap and download security defaults were tightened to avoid predictable credentials/secrets in active environments.

## Remaining Findings

None.

## Open Questions / Assumptions

1. Assumption: `/api/web/**` endpoints are intended to support session-cookie auth for browser clients (not bearer-only). If false, CSRF severity may reduce.  
2. Assumption: Collection slug is intended to be URL-safe and human-readable (kebab-case). If arbitrary Unicode slug is intentional, contract docs + encoding strategy should be explicit.  
3. Question: Are bootstrap admin settings guaranteed disabled in production by deployment policy? If yes, config warnings should still be enforced by startup guards to prevent drift.

---

_Reviewed: 2026-04-15T00:00:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: deep_
