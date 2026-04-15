---
phase: 2
slug: application-api
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 02-01-01 | 01 | 1 | COL/VIS/INT | T-02-01 / — | Authenticated routes require session; public list filtered | IT / MockMvc | `cd server && ./mvnw -q -pl skillhub-app -Dtest=SkillCollection*IT test` | W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | ROL-07 / QA-01 | T-02-02 | Contributor gets 403 on forbidden routes | IT | `./mvnw -q -pl skillhub-app -Dtest=SkillCollectionSecurity* test` | W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | INT-03 / ADM-01 | T-02-03 | Stale rows removed or reconciled; admin actions audited | IT / unit | `./mvnw -q -pl skillhub-app -Dtest=SkillCollectionReconcile* test` | W0 | ⬜ pending |

## Wave 0 Requirements

- [ ] New `SkillCollection*IT` (or agreed name) under `server/skillhub-app/src/test/java/.../collection/` — stubs for REST matrix
- [ ] Reuse existing security test harness (`@AutoConfigureMockMvc`, mock user filters) mirroring namespace ITs

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Session cookie in real browser | VIS-02 | Browser cookie + CSRF | Log in via dev auth, hit public collection URL, confirm network tab shows filtered JSON |

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
