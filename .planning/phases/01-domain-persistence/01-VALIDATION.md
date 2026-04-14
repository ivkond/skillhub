---
phase: 01
slug: domain-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Mockito + AssertJ (Spring Boot test BOM via `skillhub-domain`) |
| **Config file** | Maven Surefire defaults (`server/skillhub-domain/pom.xml`) |
| **Quick run command** | `cd server && ./mvnw -pl skillhub-domain test` |
| **Full suite command** | `make test-backend` (runs `cd server && ./mvnw test` with CI JVM flags) |
| **Estimated runtime** | ~2–8 minutes full backend (CI-class); domain-only ~30–90s |

---

## Sampling Rate

- **After every task commit:** `cd server && ./mvnw -pl skillhub-domain test`
- **After every plan wave:** `make test-backend`
- **Before `/gsd-verify-work`:** Full suite green
- **Max feedback latency:** 600 seconds (full backend)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | COL/ROL/INT (schema) | T-01 / — | CASCADE + uniqueness at DB | unit/integration | `make test-backend` | ⬜ Wave 0 | ⬜ pending |
| TBD | 02 | 1 | COL-01..07, ROL-01..08 | T-04 / V4 | Service-level auth matrix; port for skill readability | unit | `./mvnw -pl skillhub-domain test` | ⬜ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] New `SkillCollection*ServiceTest` (or agreed naming) covering owner / contributor / admin-equivalent matrix (D-12, ROL-07)
- [ ] Mock for `SkillReadableForActorPort` (name TBD in plans)
- [ ] Confirm migration coverage strategy (`@DataJpaTest` / Flyway in tests) when planner adds infra tests

*Planner will replace TBD rows after PLAN.md task IDs exist.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Flyway on shared staging DB | COL-03 / migrations | May not be in CI matrix | After V40+ merge, run app or `flyway:migrate` against disposable Postgres and confirm clean migrate from V39 baseline |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 600s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
