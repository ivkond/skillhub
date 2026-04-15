---
status: testing
phase: 01-domain-persistence
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md
started: 2026-04-15T12:00:00Z
updated: 2026-04-15T12:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: [pending]

### 2. Full Maven reactor tests
expected: From `server/`, run `./mvnw test` (full reactor). Build finishes with SUCCESS and no failing tests; output shows the skill collection domain tests ran as part of the suite.
result: [pending]

### 3. Flyway V40 skill collection tables
expected: On a database that has applied migrations through V40, `skill_collection`, `skill_collection_member`, and `skill_collection_contributor` exist with sensible columns and FK relationships (you can confirm via psql, admin UI, or app logs showing migrate success for V40).
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

[none yet]
