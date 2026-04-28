# Phase 1: Domain & persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-15  
**Phase:** 1-Domain & persistence  
**Areas discussed:** Gray-area selection (delegated), Aggregate & tables, Share ID & slugs, Membership ordering, Visibility hook depth

---

## Gray-area selection

| Option | Description | Selected |
| ------ | ----------- | -------- |
| Aggregate & tables | DB shape, cascades, JPA boundaries | ✓ (via delegation) |
| Share ID & slugs (COL-07) | URL-facing identity strategy | ✓ (via delegation) |
| Membership ordering | Persisted ordering model | ✓ (via delegation) |
| Visibility hook depth | Port vs stub for add-skill validation | ✓ (via delegation) |

**User's choice:** Delegated — “you decide on this questions” (interpreted as: builder selects all four areas and locks recommended defaults).  
**Notes:** No multi-select IDs returned; treated as full coverage + discretion per `/gsd-discuss-phase` philosophy.

---

## Aggregate & tables

| Option | Description | Selected |
| ------ | ----------- | -------- |
| A | Single wide table for collection + denormalized skills | |
| B | Collection root + membership table + contributor table with cascades | ✓ |

**User's choice:** Builder default **B** — matches SUMMARY aggregate sketch and normalized integrity.

---

## Share ID & slugs (COL-07)

| Option | Description | Selected |
| ------ | ----------- | -------- |
| A | Opaque UUID-only public identifier | |
| B | Surrogate bigint PK + per-owner unique slug for shareable URLs | ✓ |
| C | Global slug without owner scope | |

**User's choice:** Builder default **B** — avoids cross-owner slug collisions, keeps internal FKs simple.

---

## Membership ordering

| Option | Description | Selected |
| ------ | ----------- | -------- |
| A | Implicit order by insertion only | |
| B | Integer `sort_order` with batch reorder | ✓ |
| C | Linked-list predecessor pointers | |

**User's choice:** Builder default **B** — straightforward for contributors/owners reordering per ROL-06.

---

## Visibility hook depth

| Option | Description | Selected |
| ------ | ----------- | -------- |
| A | Domain calls visibility engine directly (risk: module coupling) | |
| B | Domain port + mock in unit tests; real adapter in Phase 2 | ✓ |
| C | Stub always-true in Phase 1 | |

**User's choice:** Builder default **B** — honors PROJECT.md “do not fork visibility logic” while keeping Phase 1 testable.

---

## Claude's Discretion

- Table/column naming details, optimistic locking mechanism, exact port interface name—left to planning/implementation within constraints documented in `01-CONTEXT.md`.

## Deferred Ideas

- INT-03 execution timing deferred to Phase 2 per requirements mapping (noted in CONTEXT).
