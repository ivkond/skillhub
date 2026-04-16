---
phase: 4
reviewers: [codex, opencode]
reviewed_at: 2026-04-16T12:16:00Z
plans_reviewed: [04-01-PLAN.md, 04-02-PLAN.md, 04-03-PLAN.md]
---

# Cross-AI Plan Review - Phase 4

## Codex Review

Codex review timed out after waiting for CLI completion in this session. No structured output was returned.

---

## OpenCode Review

### Summary
Plans are structured well around QA-01 to QA-03 and follow existing project patterns, but acceptance criteria are not yet explicit enough for confident sign-off.

### Strengths
- Clear three-part decomposition: backend auth matrix, E2E journey, docs pass.
- Good reuse intent for existing integration tests and Playwright setup.
- Right focus on high-risk authorization and visibility behavior.

### Concerns
- **HIGH:** E2E data seeding/fixture strategy is underspecified, risking flaky CI.
- **MEDIUM:** Authorization plan says "representative routes" without a concrete route-by-role list.
- **MEDIUM:** Verification relies heavily on status checks; payload non-leak assertions need to be explicit.
- **MEDIUM:** `INT-03` lifecycle behavior (skills becoming unavailable) is still active in requirements but not clearly covered by phase plans.
- **LOW:** Documentation verification should include link/build validation, not just keyword checks.

### Suggestions
- Define an explicit endpoint/role matrix for QA-01 coverage evidence.
- Add deterministic fixture/seeding and cleanup expectations for QA-02.
- Require response-body assertions for non-leak guarantees.
- Clarify whether `INT-03` is in phase 4 scope; if yes, add a targeted validation task.
- Add docs build/link verification and OpenAPI presence checks where applicable.

### Risk Assessment
**Overall risk: MEDIUM.**  
Plans are directionally correct, but execution risk remains until coverage and verification gates are made measurable.

---

## Consensus Summary

### Agreed Strengths
- Phase structure is pragmatic and aligned with milestone goals.
- Existing project tooling and test infrastructure are reused.

### Agreed Concerns
- Coverage criteria are too implicit and need measurable definitions.
- E2E reliability depends on clearer fixture/seed/cleanup strategy.
- Security verification should include payload-level non-leak checks.

### Divergent Views
- Only OpenCode returned full findings; Codex provided no review due timeout.
