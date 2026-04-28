---
phase: 2
reviewers:
  - opencode
  - qwen
reviewed_at: 2026-04-15T11:23:24.9343170+03:00
plans_reviewed:
  - .planning/phases/02-application-api/02-01-PLAN.md
  - .planning/phases/02-application-api/02-02-PLAN.md
  - .planning/phases/02-application-api/02-03-PLAN.md
---

# Cross-AI Plan Review — Phase 2

## Gemini Review

Review could not be completed.

- Error: account not eligible in current location (`UNSUPPORTED_LOCATION`).

---

## Claude Review

Review could not be completed.

- Error: authentication failure (`401 authentication_error`, invalid credentials).

---

## OpenCode Review

### Summary
The three plans are coherent and sequenced well (02-01 -> 02-02 -> 02-03), with good threat-modeling and domain boundaries, but there are notable gaps in end-to-end security verification and requirement traceability.

### Strengths
- Clear wave dependencies and incremental scope.
- Explicit VIS-03 filtering intent in query service design.
- Proper domain boundary intent (controllers -> app services -> domain).
- Security registry update and dedicated policy tests are planned.
- Contributor-denial matrix and admin audit intent are present.
- Reconciliation path and scheduler are defined.

### Concerns
- **HIGH**: QA-01 matrix incomplete (missing stranger/admin test paths).
- **HIGH**: INT-01 rejection behavior not explicitly verified in acceptance criteria.
- **HIGH**: No direct integration test for VIS-03 on public endpoint filtering.
- **MEDIUM**: `/api/v1` parity decision is ambiguous.
- **MEDIUM**: Reconciliation timing/perf concerns (hourly window, per-member deletes).
- **MEDIUM**: Audit context propagation from controller to app service may be missed.
- **MEDIUM**: API token write-policy decision is not explicitly finalized in tests/docs.
- **LOW**: Cron configuration lacks explicit validation/health confidence.
- **LOW**: INT-02 duplicate-membership enforcement is not explicitly tested.

### Suggestions
- Expand SecurityIT to include stranger and admin scenarios.
- Add dedicated integration test for public endpoint member filtering (VIS-03).
- Add explicit INT-01 assertion in command-service acceptance criteria.
- Prefer batch deletion strategy for reconciliation cleanup.
- Add grep/test acceptance checks for `AuditRequestContext` propagation.
- Resolve and document `/api/v1` parity decision explicitly.
- Document API-token write policy choice inline in registry.

### Risk Assessment
Overall risk: **MEDIUM**.

Primary unresolved risks are potential data leakage via incomplete VIS-03 integration coverage and incomplete authorization matrix verification before phase close.

---

## Qwen Review

### Summary
Plans align well with existing project conventions and layering, but there are medium/high gaps around integration-level requirement proof and a few edge-case risks (anonymous null-safety, scheduling/config, missing matrix cases).

### Strengths
- Strong consistency with existing controller/service/security patterns.
- Correct direction on route registry method-specific matching and contributor restrictions.
- Good separation of authenticated vs public controllers.
- Admin-audit intent is explicit with stable action codes.
- Reconciliation design is operationally bounded (paged scheduler).

### Concerns
- **HIGH**: INT-01 and INT-02 are Phase 2 requirements but lack explicit HTTP/integration verification.
- **HIGH**: Missing anonymous/private and anonymous/public-visibility filtering tests for public endpoint.
- **HIGH**: Potential implementation footgun around scheduling enablement duplication if not verified globally.
- **MEDIUM**: `SkillReadableForActorPort` null actor contract for anonymous viewer is unclear.
- **MEDIUM**: Route pattern intent (`*/*` vs `**`) should be documented to prevent future regressions.
- **MEDIUM**: Scheduler loop can stop on one exception without per-collection error isolation.
- **LOW**: Visibility casing contract in API response is not explicitly documented.

### Suggestions
- Add explicit integration tests for INT-01/INT-02 and VIS-03 (anonymous + mixed visibility).
- Verify and document null-handling contract for visibility port on anonymous viewer.
- Add per-collection try/catch logging in scheduler reconciliation loop.
- Add acceptance checks for audit context propagation from controller to service.
- Clarify API response visibility casing and `/api/v1` parity decision.

### Risk Assessment
Overall risk: **MEDIUM**.

Design is strong, but unverified edge cases around anonymous filtering and missing integration assertions keep risk above LOW.

---

## Consensus Summary

Two independent reviewers (`opencode`, `qwen`) converge on security-verification gaps rather than architecture flaws.

### Agreed Strengths
- Plan decomposition and dependency order are sound.
- Domain-driven layering and route-policy focus are directionally correct.
- Contributor restrictions and admin-audit intent are clearly represented.

### Agreed Concerns
- **VIS-03 proof gap**: missing end-to-end tests for anonymous/public filtering with hidden skills.
- **QA-01 matrix incompleteness**: missing stranger/admin and related edge paths.
- **INT coverage gap**: INT-01/INT-02 are not explicitly proven at integration/API level.
- **Operational edge risk**: reconciliation/scheduler behavior needs stronger failure/latency safeguards.

### Divergent Views
- `opencode` emphasizes reconciliation timing/performance and API token policy documentation.
- `qwen` emphasizes null-safety contract for anonymous viewer and potential scheduling-annotation footgun.
