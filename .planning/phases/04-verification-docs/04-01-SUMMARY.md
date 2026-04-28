---
phase: 04-verification-docs
plan: "01"
status: completed
requirements_completed:
  - QA-01
summary: "Expanded backend role-matrix verification for collection security endpoints and domain-level permission invariants."
commits:
  - 935bd35f
  - 87daf609
files_created: []
files_modified:
  - server/skillhub-app/src/test/java/com/iflytek/skillhub/controller/portal/SkillCollectionSecurityIT.java
  - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionDomainServiceTest.java
verification:
  - .\gradlew.bat :server:skillhub-app:test --tests "*SkillCollectionSecurityIT*"
  - .\gradlew.bat :server:skillhub-domain:test --tests "*SkillCollectionDomainServiceTest*"
---

# Phase 04 Plan 01 Summary

Completed QA-01 with representative high-risk permission/visibility verification across integration and domain layers.

## Task outcomes

1. **Security integration matrix** — `SkillCollectionSecurityIT` role-matrix cases for metadata update, contributor management, membership mutation, and private read edges (owner / contributor / stranger / admin).
2. **Domain role invariants** — `SkillCollectionDomainServiceTest` contributor boundaries, admin override, and duplicate/slug invariants.

## Route × role × expected outcome (representative matrix)

Assertions live in `SkillCollectionSecurityIT`; HTTP outcomes use framework-consistent forbidden vs not-found style where applicable.

| Route (method + pattern) | Role | Expected outcome | Test method |
| --- | --- | --- | --- |
| `PATCH /api/web/collections/{id}` | owner | 200, `code` 0 | `roleMatrixMetadataUpdateOwnerAndAdminAllowedOthersDenied` |
| `PATCH /api/web/collections/{id}` | SKILL_ADMIN | 200, `code` 0 | `roleMatrixMetadataUpdateOwnerAndAdminAllowedOthersDenied` |
| `PATCH /api/web/collections/{id}` | contributor | denied (403 or 400 + contributor rule) | `roleMatrixMetadataUpdateOwnerAndAdminAllowedOthersDenied` |
| `PATCH /api/web/collections/{id}` | stranger | denied / not found style | `roleMatrixMetadataUpdateOwnerAndAdminAllowedOthersDenied` |
| `POST/DELETE /api/web/collections/{id}/contributors` | owner / admin vs contributor / stranger | allow vs deny per table in test | `roleMatrixContributorManagementOwnerAndAdminAllowedOthersDenied` |
| `POST/DELETE /api/web/collections/{id}/skills` | owner / contributor / admin vs stranger | allow vs deny | `roleMatrixMembershipMutationOwnerContributorAdminAllowedStrangerDenied` |
| `GET /api/web/collections/{id}` (private collection) | owner / contributor / admin vs stranger | 200 vs not-found envelope | `roleMatrixPrivateReadOwnerContributorAdminAllowedStrangerDenied` |

## INT-03 (membership reconciliation)

- **Canonical regression (named):** `SkillCollectionMembershipReconcileTest.int03ReconcileDeletesMembershipWhenOwnerCannotReadSkill` — when the collection owner can no longer read a member skill, `reconcileInvisibleSkillsForCollection` deletes that membership row.
- **HTTP matrix:** `SkillCollectionSecurityIT` covers authorization and visibility edges; INT-03 lifecycle is asserted at membership service level above.

## Verification

- `.\gradlew.bat :server:skillhub-app:test --tests "*SkillCollectionSecurityIT*"` — pass (per execution).
- `.\gradlew.bat :server:skillhub-domain:test --tests "*SkillCollectionDomainServiceTest*"` — pass (per execution).

## Commits

- `935bd35f` — `feat(04-01): expand collection security role matrix coverage`
- `87daf609` — `test(04-01): harden domain role-bound collection behavior checks`
