# Phase 1: Domain & persistence - Context

**Gathered:** 2026-04-15  
**Status:** Ready for planning

<domain>

## Phase Boundary

Deliver the **durable relational model** and **domain-level APIs** for user-owned skill collections: collection metadata (title, description, visibility), exactly one owner, contributor membership, ordered skill membership with duplicate prevention, and **authorization/visibility hooks** at the domain boundary—**no HTTP controllers or Web UI** (those are Phase 2–3).

</domain>

<decisions>

## Implementation Decisions

### Gray-area selection (user input)

- **D-00:** User delegated gray-area selection and default choices to the implementation agent (“you decide”). All four planned topics below are **in scope** for this context file.

### Aggregate & tables

- **D-01:** Treat **one collection aggregate** in the domain sense: a root entity for collection metadata + owner + visibility, with **separate persisted rows** for (a) skills-in-collection membership and (b) contributors—mirrors the research summary naming intent (`Collection` + membership + collaborator tables); exact Java class names follow existing `Skill`-style naming in `skillhub-domain`.
- **D-02:** **Owner** is stored on the collection row (`owner_id` referencing `user_account.id` as `VARCHAR(128)` like existing entities). **Contributors** live in a dedicated contributor table (user id + collection id + audit timestamps). Enforce **ROL-01** (exactly one owner) at domain service level; DB enforces `owner_id NOT NULL` and contributor rows never hold “owner role” duplicate semantics.
- **D-03:** **ON DELETE CASCADE** from collection to membership and contributor rows so **COL-03** (“delete removes all memberships and collaborator rows”) is guaranteed at the database layer.
- **D-04:** Membership uniqueness: **unique (collection_id, skill_id)** to satisfy **INT-02**.

### Share identifier & URLs (COL-07 groundwork)

- **D-05:** Use **surrogate primary key** (`BIGSERIAL` / `Long`) for internal references and foreign keys.
- **D-06:** Add a **per-owner unique `slug`** (human-readable, same general constraints as existing skill slug style—length, charset—aligned with Flyway patterns) so public URLs can follow **`/u/{ownerKey}/c/{collectionSlug}`** or equivalent in Phase 3 without schema churn. **Collision policy:** reject create/update with a domain validation error on slug clash for that owner.
- **D-07:** Do **not** add a second opaque “share token” column in v1 unless Phase 3 routing requires it; numeric id remains valid internal fallback for APIs if needed.

### Membership ordering

- **D-08:** Persist **`sort_order` (integer)** on membership rows; stable total order by `(sort_order ASC, id ASC)` tie-break. Reorder implemented as **batch updates** of `sort_order` under a domain service transaction (optimistic locking or version column **deferred to planner** if needed).
- **D-09:** Gaps in `sort_order` are allowed; normalize only if maintenance needs arise (not part of Phase 1 scope).

### Visibility & authorization groundwork

- **D-10:** Phase 1 domain services **depend on a narrow port** (interface) such as “can acting user read this skill?” implemented in a later module or test double—**no copy-paste of visibility rules**. The port’s contract matches **COL-04 / ROL-04 / INT-01**: reject add when the acting user cannot read the skill under portal rules.
- **D-11:** **Unit tests** for collection domain services use mocks of that port; integration wiring to real `VisibilityChecker` / `SkillQueryService` is **Phase 2 application-layer** responsibility unless the planner can place adapter in `skillhub-app` without violating module boundaries.
- **D-12:** “Authorization matrix groundwork” = explicit domain methods or small policy helper class(es) that map **actor + operation → allowed/denied** for owner vs contributor vs admin—**admin treated as owner-equivalent at service entry** per **ROL-08** (callers pass `PlatformPrincipal` or boolean `adminOverride` in Phase 2; Phase 1 encodes rules assuming caller has classified the actor).

### Claude's Discretion

- Exact table names (`skill_collection` vs `collection`, join table names) and whether optimistic locking uses `@Version` on collection vs membership—**left to planner/implementation** as long as constraints above hold.
- Placement of enums (`PUBLIC`/`PRIVATE`)—follow `SkillVisibility` string enum pattern already in JPA.

### Folded Todos

(None — `todo match-phase` returned no matches.)

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product & requirements

- `.planning/REQUIREMENTS.md` — **COL-01..COL-07**, **ROL-01..ROL-08** for Phase 1; traceability table maps requirements to phases.
- `.planning/PROJECT.md` — milestone intent, constraints (reuse visibility services, session-first Web later), out-of-scope deferrals.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, plan placeholders **01-01** / **01-02**.

### Research & rationale

- `docs/2026-04-15-skill-collections-research.md` — architecture slice, non-goals (do not overload `SkillTag` / `SkillLabel` / `SkillStar`).
- `.planning/research/SUMMARY.md` — aggregate sketch, pitfalls (public filtering, stale membership).

### Schema / code conventions

- `server/skillhub-app/src/main/resources/db/migration/` — Flyway location; next migration **after V39** per current tree.
- `server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/skill/Skill.java` — reference JPA style (`user_account` string id, enums, timestamps).

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- **Flyway:** additive SQL migrations under `server/skillhub-app/src/main/resources/db/migration/`.
- **JPA entities:** `skillhub-domain` module with `@Entity` / `@Table` aligned to existing tables (`Skill`, `UserAccount`, etc.).

### Established Patterns

- **User ids:** string keys referencing `user_account(id)`.
- **Visibility:** existing `SkillVisibility` and portal services—**must be invoked via port/adapter**, not duplicated logic in collection entities.

### Integration Points

- Future **Phase 2** REST and security registry will call domain/application services defined here.
- **Phase 3** URL routing will consume **owner-scoped slug** decision (**D-06**).

</code_context>

<specifics>

## Specific Ideas

- User requested **delegated defaults** for discuss-phase questions rather than interactive elicitation; decisions above prioritize **schema stability**, **COL-07** shareability, and **non-forked visibility** alignment with **PROJECT.md**.

</specifics>

<deferred>

## Deferred Ideas

- **INT-03** reconciliation strategy (job vs periodic vs on-read)—explicitly Phase 2 per requirements traceability; Phase 1 may add nullable columns or hooks only if needed for clean domain API.
- **Unlisted visibility**, namespace-scoped collections, search indexing, token scopes—already deferred in **PROJECT.md** / **REQUIREMENTS.md**.

### Reviewed Todos (not folded)

(None.)

</deferred>

---

*Phase: 01-domain-persistence*  
*Context gathered: 2026-04-15*
