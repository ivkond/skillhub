---
phase: 07-google-oauth
plan: "06"
evidence_id: EVID-07-CALLBACK
status: awaiting_manual_execution
oauth_registration: google
updated: 2026-04-18
---

# Phase 07 Callback Evidence

Manual callback evidence packet for the live Google OAuth smoke required by phase 07 closeout.

## Evidence Record Schema

### executed_at

ISO-8601 timestamp of the live callback verification run.

### executor

Human or service account that executed the live callback verification.

### environment

Concrete host/base URL used for the verification run.

### oauth_registration

Fixed value: `google`.

### safe_return_to_case

Must record:

- input URL/query
- observed redirect target
- observed login result after redirect

### malicious_return_to_case

Must record:

- input URL/query containing the malicious `returnTo`
- observed redirect target after sanitization
- sanitization result proving no external redirect occurred

### session_result

Must record:

- authenticated principal identifier or username
- session evidence (cookie name, session id fragment, or equivalent runtime proof)

### screenshots_or_logs

Must contain concrete paths or artifact identifiers for screenshots, HAR, browser logs, or server logs captured during the run.

### reviewer_signoff

Must record:

- status: `approved` or `rejected`
- reviewer identifier
- approval timestamp in ISO-8601 format

## Completion Checklist

- [ ] `executed_at` is present with a real ISO timestamp
- [ ] `executor` is recorded
- [ ] `environment` is recorded
- [ ] safe `returnTo` input and observed redirect target are both recorded
- [ ] malicious `returnTo` input and sanitized redirect target are both recorded
- [ ] `session_result` identifies the authenticated principal
- [ ] `screenshots_or_logs` points to concrete artifacts
- [ ] reviewer sign-off is `approved`
