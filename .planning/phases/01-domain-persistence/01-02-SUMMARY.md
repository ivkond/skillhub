---
phase: 01-domain-persistence
plan: 02
subsystem: domain
tags: [authorization, skill-collections, junit, mockito]

requires:
  - phase: 01-01
    provides: [schema, entities, repository ports]
provides:
  - SkillReadableForActorPort and infra adapter delegating to VisibilityChecker
  - SkillCollectionAuthorizationPolicy and domain services for CRUD, membership, contributors
  - Unit tests for policy matrix, caps, slug collisions, and port-gated add-skill
affects: [phase-02-application-api]

tech-stack:
  added: []
  patterns: [narrow port for skill readability; explicit adminEquivalent bypass ROL-08]

key-files:
  created:
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillReadableForActorPort.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionLimits.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionAuthorizationPolicy.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionSlugs.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionVisibilities.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionDomainService.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionMembershipService.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionContributorService.java
    - server/skillhub-infra/src/main/java/com/iflytek/skillhub/infra/collection/SkillReadableForActorAdapter.java
    - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionAuthorizationPolicyTest.java
    - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionDomainServiceTest.java
    - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionMembershipServiceTest.java
    - server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/collection/SkillCollectionContributorServiceTest.java
  modified:
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionRepository.java
    - server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionMemberRepository.java
    - server/skillhub-app/src/main/resources/messages.properties
    - server/skillhub-app/src/main/resources/messages_zh.properties

key-decisions:
  - Collection visibility limited to PUBLIC and PRIVATE at domain boundary (NAMESPACE_ONLY rejected).
  - Owner vs contributor classification is derived from persisted owner_id and contributor rows; admin bypass uses explicit boolean from caller (ROL-08 / D-12).

patterns-established:
  - SkillReadableForActorPort is the only gate for add-skill readability (D-10).

requirements-completed: [COL-01, COL-02, COL-03, COL-04, COL-05, COL-06, COL-07, ROL-01, ROL-02, ROL-03, ROL-04, ROL-05, ROL-06, ROL-07, ROL-08]

duration: ""
completed: 2026-04-15
---

# Phase 1 Plan 01-02 Summary

**Domain services for skill collections with authorization matrix, numeric caps, slug validation, and Mockito-backed unit tests; production wiring for the readability port via VisibilityChecker.**

## Accomplishments

- Implemented CRUD and metadata flows on the aggregate root with slug and per-owner collection caps.
- Implemented membership add/remove/reorder with transactional reorder, duplicate prevention, and port-based skill readability checks.
- Implemented contributor grant/revoke with owner-only contributor management and contributor caps.
- Added `SkillReadableForActorAdapter` in `skillhub-infra` so the Spring application context can start with a real port implementation.

## Verification

- `./mvnw test` from `server/` completed successfully (full backend suite).

## Self-Check: PASSED
