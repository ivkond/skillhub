---
phase: 2
slug: application-api
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Spring Boot 3 (`spring-boot-starter-test`) |
| **Config file** | `server/skillhub-app/pom.xml` (surefire), existing `application*.yml` for tests |
| **Quick run command** | `cd server && ./mvnw -q -pl skillhub-app -Dtest='*SkillCollection*' test` |
| **Full suite command** | `make test-backend` (repo root) |
| **Estimated runtime** | ~120–300 seconds (environment-dependent) |

## Sampling Rate

- **After every task commit:** Run quick command for the touched test class(es)
- **After every plan wave:** Run `make test-backend`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 300 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | COL/VIS/INT | T-02-01 / — | Authenticated routes require session; public list filtered | IT / MockMvc | `cd server && ./mvnw -q -pl skillhub-app -Dtest=SkillCollection*IT test` | ✅ yes | ✅ done |
| 02-02-01 | 02 | 2 | ROL-07 / QA-01 | T-02-02 | Contributor gets 403 (or domain-mapped 400) on forbidden routes | IT | `./mvnw -q -pl skillhub-app -Dtest=SkillCollectionSecurity* test` | ✅ yes | ✅ done |
| 02-03-01 | 03 | 3 | INT-03 / ADM-01 | T-02-03 | Stale rows removed or reconciled; admin actions audited | IT / unit | `./mvnw -q -pl skillhub-app -Dtest=SkillCollectionReconcile* test` | ✅ yes | ✅ done |

## Wave 0 Requirements

- [x] `SkillCollectionSecurityIT` implemented and extended with contributor/stranger/admin matrix, INT-01/INT-02, and VIS-03 scenarios.
- [x] Security harness reused (`@SpringBootTest` + `@AutoConfigureMockMvc` + authenticated principal fixtures), aligned with portal integration style.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Session cookie in real browser | VIS-02 | Browser cookie + CSRF | Log in via dev auth, hit public collection URL, confirm network tab shows filtered JSON |

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 300s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (phase 02 validation complete)
