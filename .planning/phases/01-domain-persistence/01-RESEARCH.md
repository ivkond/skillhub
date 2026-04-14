# Phase 1: Domain & persistence - Research

**Researched:** 2026-04-15  
**Domain:** PostgreSQL + Flyway + Spring Data JPA + `skillhub-domain` services for skill collections  
**Confidence:** HIGH (stack and repo patterns verified from source); MEDIUM (Flyway transitive alignment — see Open Questions)

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

Verbatim from **01-CONTEXT.md** — **## Implementation Decisions** (excluding **### Claude's Discretion**, which follows below):

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

### Deferred Ideas (OUT OF SCOPE)

- **INT-03** reconciliation strategy (job vs periodic vs on-read)—explicitly Phase 2 per requirements traceability; Phase 1 may add nullable columns or hooks only if needed for clean domain API.
- **Unlisted visibility**, namespace-scoped collections, search indexing, token scopes—already deferred in **PROJECT.md** / **REQUIREMENTS.md**.

### Reviewed Todos (not folded)

(None.)

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COL-01 | Owner can create a collection with title, optional description, visibility `public` or `private`. | Root entity + `SkillVisibility`-style enum; Flyway table; create service with limits from REQUIREMENTS (50 collections / owner) [VERIFIED: REQUIREMENTS.md]. |
| COL-02 | Owner can edit title, description, visibility. | Update path on aggregate; contributor denied via ROL-07 policy [VERIFIED: REQUIREMENTS.md]. |
| COL-03 | Owner can delete a collection; removes memberships and collaborators. | `ON DELETE CASCADE` FKs per D-03 [VERIFIED: 01-CONTEXT.md]. |
| COL-04 | Owner can add a skill only if readable by acting user under existing rules. | Port + mock in tests (D-10, D-11); align with `VisibilityChecker` contract in Phase 2 [VERIFIED: 01-CONTEXT.md]. |
| COL-05 | Owner can remove a skill from a collection. | Membership delete by `(collection_id, skill_id)`; authorized for owner/contributor per ROL-05 [VERIFIED: REQUIREMENTS.md]. |
| COL-06 | Owner can reorder skills; ordering persisted. | `sort_order` + batch update in transaction (D-08) [VERIFIED: 01-CONTEXT.md]. |
| COL-07 | Stable share identifier for URLs. | Surrogate `id` + per-owner `slug` (D-05, D-06); no share token v1 (D-07) [VERIFIED: 01-CONTEXT.md]. |
| ROL-01 | Exactly one owner; creator becomes owner. | `owner_id NOT NULL` on collection; no owner row in contributor table (D-02) [VERIFIED: 01-CONTEXT.md]. |
| ROL-02 | Owner grants contributor to registered user. | Contributor table + FK to `user_account(id)`; duplicate contributor guard in service [VERIFIED: REQUIREMENTS + patterns]. |
| ROL-03 | Owner revokes contributor. | Delete contributor row; not CASCADE with collection delete semantics for standalone revoke [VERIFIED: REQUIREMENTS.md]. |
| ROL-04 | Contributor add skill with same validation as COL-04. | Same port as COL-04; policy allows contributor for membership mutations only [VERIFIED: REQUIREMENTS.md]. |
| ROL-05 | Contributor removes skill. | Same membership delete as COL-05 with policy [VERIFIED: REQUIREMENTS.md]. |
| ROL-06 | Contributor reorders skills. | Same reorder service as COL-06 with policy [VERIFIED: REQUIREMENTS.md]. |
| ROL-07 | Contributor cannot metadata/visibility/delete/contributor mgmt. | Explicit policy matrix (D-12); separate service methods or guards [VERIFIED: 01-CONTEXT.md]. |
| ROL-08 | Platform admin owner-equivalent. | `adminOverride` / principal classification at entry (D-12); ADM-01 auditing deferred to Phase 2 [VERIFIED: REQUIREMENTS traceability]. |

</phase_requirements>

## Summary

Phase 1 adds **new relational tables** (collection root, skill membership, contributors) via **Flyway** next migration after **V39** [VERIFIED: `server/skillhub-app/src/main/resources/db/migration/`], **JPA entities** in **`skillhub-domain`** matching existing style (`Skill`, `NamespaceMember` — `String` user ids, `@Enumerated(EnumType.STRING)`, UTC `Instant` timestamps) [VERIFIED: `Skill.java`, `NamespaceMember.java`], and **domain services** tested with **JUnit 5 + Mockito** like `NamespaceMemberServiceTest` [VERIFIED: `skillhub-domain/src/test/...`].

Repositories follow the **port/adapter split**: domain defines `*Repository` interfaces; **`skillhub-infra`** exposes `*JpaRepository` extending `JpaRepository<…>` and the domain interface [VERIFIED: `NamespaceMemberJpaRepository.java`]. Collection work should follow the same split so `skillhub-domain` stays free of `spring-boot-starter-data-jpa` (only Jakarta + spring-data-commons + hibernate-core on domain module) [VERIFIED: `skillhub-domain/pom.xml`, `skillhub-infra/pom.xml`].

**Primary recommendation:** Implement **V40+ Flyway** for three tables with FKs + `UNIQUE(collection_id, skill_id)` + `UNIQUE(owner_id, slug)` + **ON DELETE CASCADE** from collection to children; add entities + repository ports in **domain**, JPA adapters in **infra**, and **collection + membership + collaborator services** with a **mocked “skill readable for actor” port** and an explicit **authorization policy** for owner vs contributor vs admin-equivalent.

## Project Constraints (from .cursor/rules/)

**None — verified.** The repository has no `.cursor/rules/` directory at workspace root [VERIFIED: glob search 2026-04-15].

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Java | 21 | Language runtime | Parent POM `java.version` + CI `java-version: 21` [VERIFIED: `server/pom.xml`, `.github/workflows/pr-tests.yml`, local `java -version` → 21.0.10 Temurin]. |
| Spring Boot | 3.2.3 | DI, JPA auto-config, transaction management | Parent `spring-boot-starter-parent` [VERIFIED: `server/pom.xml`]. |
| Jakarta Persistence / Hibernate | (via Boot 3.2.3) | ORM mapping for domain entities | `skillhub-domain` depends on `jakarta.persistence-api`, `hibernate-core` without separate version property [VERIFIED: `skillhub-domain/pom.xml`]. |
| Spring Data JPA | (via Boot 3.2.3) | `JpaRepository`, query methods | Used in `skillhub-infra` [VERIFIED: `NamespaceMemberJpaRepository.java`]. |
| PostgreSQL JDBC | (via Boot 3.2.3) | Database driver | `postgresql` runtime scope in `skillhub-app` [VERIFIED: `skillhub-app/pom.xml`]. |
| Flyway (`flyway-core`) | **9.22.3** (Spring Boot property `flyway.version`) | Versioned SQL migrations | Evaluated with `./mvnw help:evaluate -Dexpression=flyway.version -pl skillhub-app` [VERIFIED: Maven output 2026-04-15]. |
| Flyway PostgreSQL support | **10.10.0** (`flyway-database-postgresql`) | PostgreSQL-specific Flyway integration | Explicit version in `skillhub-app/pom.xml` [VERIFIED: `skillhub-app/pom.xml`]. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| JUnit Jupiter | (via Boot test BOM) | Unit tests | All new domain service tests [VERIFIED: existing domain tests]. |
| Mockito JUnit Jupiter | (via Boot) | Mock ports / repos | Same pattern as `NamespaceMemberServiceTest` [VERIFIED]. |
| AssertJ | (via Boot) | Fluent assertions | Already on domain test classpath [VERIFIED: `skillhub-domain/pom.xml`]. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate membership table | JSON array of skill ids on collection row | Breaks ordering, uniqueness, FK integrity, and CASCADE story — **rejected** per D-01/D-03/D-04 [VERIFIED: 01-CONTEXT.md]. |
| Global slug uniqueness | Per-owner slug (D-06) | Global uniqueness conflicts with URL scheme `/u/{owner}/c/{slug}` — **rejected** per CONTEXT. |

**Installation:** N/A — Maven multi-module project already configured [VERIFIED: `server/pom.xml`].

**Version verification:**

- Spring Boot / Java: read from `server/pom.xml` and CI [VERIFIED: repo].
- `flyway.version` resolved by Maven: **9.22.3** [VERIFIED: `mvnw help:evaluate` on `skillhub-app` 2026-04-15].

## Architecture Patterns

### Recommended module layout

```
server/skillhub-app/src/main/resources/db/migration/
└── V40__skill_collections.sql          # next after V39 [VERIFIED: migration tree]

server/skillhub-domain/src/main/java/.../collection/
├── SkillCollection.java                # name TBD — entity
├── SkillCollectionMember.java
├── SkillCollectionContributor.java
├── SkillCollectionRepository.java    # port
├── SkillCollectionMemberRepository.java
├── SkillCollectionContributorRepository.java
├── SkillReadableForActorPort.java    # narrow port (D-10)
└── service/
    ├── SkillCollectionService.java
    ├── SkillCollectionMembershipService.java
    └── SkillCollectionAuthorizationPolicy.java  # or equivalent (D-12)

server/skillhub-infra/src/main/java/.../jpa/
├── SkillCollectionJpaRepository.java
└── ...
```

[VERIFIED: module responsibilities from `skillhub-domain`, `skillhub-infra`, `skillhub-app` POMs and existing `NamespaceMember*` layout]

### Pattern 1: Entity mapping aligned to `Skill` / `NamespaceMember`

**What:** `@Entity`, `@Table`, `BIGSERIAL` id, `VARCHAR(128)` user FK columns, string enums, `@PrePersist` / `@PreUpdate` for timestamps.  
**When to use:** All new collection-related entities.  
**Example:**

```java
// Source: [VERIFIED: server/skillhub-domain/.../skill/Skill.java]
@Column(name = "owner_id", nullable = false)
private String ownerId;

@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 20)
private SkillVisibility visibility;
```

### Pattern 2: Domain service + mocked repositories and ports

**What:** `@ExtendWith(MockitoExtension.class)`, `@Mock` repositories and policy ports, `@InjectMocks` service under test.  
**When to use:** Phase 1 unit tests per D-11.  
**Example:**

```java
// Source: [VERIFIED: server/skillhub-domain/src/test/java/.../NamespaceMemberServiceTest.java]
@ExtendWith(MockitoExtension.class)
class NamespaceMemberServiceTest {
    @Mock
    private NamespaceMemberRepository namespaceMemberRepository;
    @InjectMocks
    private NamespaceMemberService namespaceMemberService;
}
```

### Pattern 3: Repository port in domain, JPA adapter in infra

**What:** Domain declares persistence port; infra `interface XJpaRepository extends JpaRepository<Entity, Long>, XRepository`.  
**When to use:** Any new persisted aggregate in this codebase.  
**Example:**

```java
// Source: [VERIFIED: server/skillhub-infra/.../NamespaceMemberJpaRepository.java]
public interface NamespaceMemberJpaRepository
        extends JpaRepository<NamespaceMember, Long>, NamespaceMemberRepository {
    Optional<NamespaceMember> findByNamespaceIdAndUserId(Long namespaceId, String userId);
}
```

### Anti-patterns to avoid

- **Duplicating visibility logic in collection services:** violates D-10; use a port whose implementation in Phase 2 delegates to `VisibilityChecker` / `SkillQueryService` [VERIFIED: 01-CONTEXT.md].
- **Storing owner as a contributor row with a special “OWNER” role:** violates D-02; owner lives only on collection [VERIFIED: 01-CONTEXT.md].
- **Embedding skill list in JSON on collection:** breaks INT-02 / ordering / CASCADE guarantees [ASSUMED: relational normalization — aligns with CONTEXT].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema versioning | Ad-hoc SQL scripts | Flyway migrations in `skillhub-app` | Established project path; CI runs `mvnw test` which loads Spring context with Flyway [VERIFIED: migrations directory + `skillhub-app` deps]. |
| ORM mapping boilerplate | JDBC-only DAOs for entities | JPA as elsewhere | Consistency with `Skill`, `NamespaceMember` [VERIFIED: codebase]. |
| Membership uniqueness | Application-only checks | `UNIQUE (collection_id, skill_id)` | Race-safe under concurrency [VERIFIED: D-04 / INT-02]. |
| Slug rules from scratch | Informal string trim | Reuse or mirror `SlugValidator` / skill slug constraints (length, charset) | `V4__normalize_skill_slugs.sql` documents slug normalization rules for skills (length 2–64, reserved words) — collection slug policy should align per D-06 [VERIFIED: `V4__normalize_skill_slugs.sql`; collision handling per CONTEXT]. |

**Key insight:** The codebase already encodes **user id type**, **enum storage**, **timestamp handling**, and **repository layering**; new collection code should extend those mechanisms rather than inventing parallel persistence patterns [VERIFIED: `Skill.java`, `NamespaceMember*.java`].

## Common Pitfalls

### Pitfall 1: Flyway / PostgreSQL module version skew

**What goes wrong:** Build or runtime failure if `flyway-core` (BOM **9.22.3**) and explicit `flyway-database-postgresql` (**10.10.0**) resolve to an incompatible pair.  
**Why it happens:** Mixed explicit + managed versions in `skillhub-app/pom.xml`.  
**How to avoid:** Run `./mvnw dependency:tree -pl skillhub-app -Dincludes=org.flywaydb` and align versions per Flyway release notes before merging V40+ [VERIFIED: pom shows both; tree not captured in session — MEDIUM confidence on actual resolution].  
**Warning signs:** `NoSuchMethodError` at startup or Flyway plugin registration errors.

### Pitfall 2: Unique constraint violations surfaced as 500s in later phases

**What goes wrong:** Duplicate skill in collection or slug collision throws low-level `DataIntegrityViolationException`.  
**Why it happens:** Service layer does not pre-check or translate constraint failures.  
**How to avoid:** Check before insert and map to `DomainBadRequestException` (existing domain exception style) [VERIFIED: `NamespaceMemberServiceTest` throws `DomainBadRequestException` for duplicates — pattern exists].  
**Warning signs:** Flaky tests under parallel membership adds.

### Pitfall 3: Reorder loses stability under ties

**What goes wrong:** UI shows flickering order when `sort_order` duplicates.  
**Why it happens:** Missing secondary sort key.  
**How to avoid:** Always order `(sort_order ASC, id ASC)` as per D-08 [VERIFIED: 01-CONTEXT.md].

### Pitfall 4: Contributor power drift vs REQUIREMENTS

**What goes wrong:** One code path allows contributor to patch title.  
**Why it happens:** Shared “update collection” method without operation-level policy.  
**How to avoid:** Split service methods or pass explicit `CollectionMutation` enum guarded by `SkillCollectionAuthorizationPolicy` (D-12) [VERIFIED: REQUIREMENTS contributor row].

### Pitfall 5: Stale research doc vs current product rules

**What goes wrong:** Implementing “cannot add private skill” from old notes.  
**Why it happens:** `docs/2026-04-15-skill-collections-research.md` predates locked MVP table in REQUIREMENTS.  
**How to avoid:** Treat **REQUIREMENTS.md** and **01-CONTEXT.md** as authoritative for COL/ROL behavior [VERIFIED: REQUIREMENTS “acting user” rule vs research doc §2].

## Code Examples

### FK and user id column style (SQL sketch)

```sql
-- Source: [VERIFIED: V1__init_schema.sql user_account.id type]
-- Illustrative only — final DDL is planner-owned.
owner_id VARCHAR(128) NOT NULL REFERENCES user_account(id)
```

### Unique membership (DDL intent)

```sql
-- Source: [VERIFIED: D-04 / INT-02 from 01-CONTEXT.md + REQUIREMENTS.md]
UNIQUE (collection_id, skill_id)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A for collections | Relational aggregate + Flyway | Phase 1 (planned) | Greenfield tables after V39 [VERIFIED: roadmap + migration list]. |

**Deprecated/outdated:**

- Using `SkillTag` / labels / stars as collections — explicitly out of scope [VERIFIED: REQUIREMENTS.md Out of Scope; `.planning/research/SUMMARY.md`].

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `mvnw test` runs Flyway against the same embedded/test DB configuration used for other modules, so new migrations are exercised in CI without extra setup. | Validation Architecture | Miss migration errors until integration env. |
| A2 | Contributor table should use `UNIQUE(collection_id, user_id)` to enforce idempotent grants (not explicit in CONTEXT — inferred from ROL-02/ROL-03 patterns). | Architecture | Double rows if not enforced. |

## Open Questions

1. **Exact Flyway artifact alignment (`flyway-core` 9.22.3 vs `flyway-database-postgresql` 10.10.0)**
   - What we know: Managed `flyway.version`=**9.22.3**; explicit postgres module **10.10.0** in POM [VERIFIED: Maven + `skillhub-app/pom.xml`].
   - What's unclear: Whether Maven resolves a compatible set in practice.
   - Recommendation: Confirm with `dependency:tree` before Phase 1 merge; bump BOM or explicit artifact to a single Flyway release line if needed.

2. **Optimistic locking (@Version) placement**
   - What we know: CONTEXT defers to planner.
   - What's unclear: Whether reorder-heavy membership updates need `@Version` on membership rows.
   - Recommendation: Start without `@Version` unless concurrent reorder is modeled; document concurrency expectations.

3. **Configurable caps (100 skills, 50 collections, 20 contributors)**
   - What we know: REQUIREMENTS.md states tunable constants.
   - What's unclear: Whether they live in `application.yml`, hard-coded domain constants, or existing config pattern.
   - Recommendation: Mirror existing governance/limit patterns in codebase during planning (search for similar caps) — not verified in this research session [LOW — needs grep during plan].

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| JDK 21 | Compile / test | ✓ | 21.0.10 (local Temurin) | CI uses Temurin 21 [VERIFIED: local + `pr-tests.yml`]. |
| Maven Wrapper | Backend build/test | ✓ | Apache Maven 3.9.13 (wrapper) | Use `./mvnw` from `server/` [VERIFIED: local]. |
| PostgreSQL | Runtime app / possible tests | ✓ typical dev | not probed | Dev docker compose in Makefile; tests may use H2/Testcontainers — verify in `application-test` configs in plan phase [PARTIAL]. |

**Missing dependencies with no fallback:** None identified for **writing** research and domain code; runtime DB still required for manual migration dry-run outside automated tests [ASSUMED].

**Missing dependencies with fallback:** None.

## Validation Architecture

> Nyquist enabled: `workflow.nyquist_validation` is **true** (default) in `.planning/config.json` [VERIFIED: `.planning/config.json`].

### Test framework

| Property | Value |
|----------|-------|
| Framework | JUnit 5 + Mockito + AssertJ (via Spring Boot test stack / domain module) [VERIFIED: `skillhub-domain/pom.xml`, existing tests]. |
| Config file | No single `pytest.ini` analogue — Maven Surefire defaults; Spring Boot tests in app module use `src/test/resources` where present [PARTIAL — no exhaustive glob in session]. |
| Quick run command | `cd server && ./mvnw -pl skillhub-domain test` [VERIFIED: Makefile pattern `cd server && ./mvnw test` narrowed to module]. |
| Full suite command | `make test-backend` → `cd server && JDK_JAVA_OPTIONS="..." ./mvnw test` [VERIFIED: `Makefile` + `.github/workflows/pr-tests.yml`]. |

### Phase requirements → test map

| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| COL-01 | Create collection | unit | `./mvnw -pl skillhub-domain test` | ❌ Wave 0 — new `*ServiceTest` |
| COL-02 | Update metadata (owner) | unit | same | ❌ Wave 0 |
| COL-03 | Delete cascades memberships/contributors | unit + optional integration | domain unit with mocked repos; optional `@DataJpaTest` in infra if introduced | ❌ Wave 0 |
| COL-04 / INT-01 | Reject add when port says unreadable | unit | `./mvnw -pl skillhub-domain test` | ❌ Wave 0 |
| COL-05 | Remove skill | unit | same | ❌ Wave 0 |
| COL-06 | Reorder stable | unit | same | ❌ Wave 0 |
| COL-07 | Slug uniqueness per owner | unit | same | ❌ Wave 0 |
| ROL-01–08 | Authorization matrix at service entry | unit (table-driven) | same | ❌ Wave 0 |
| Migrations | V40+ applies on empty + upgrade path | integration / CI | `./mvnw -pl skillhub-app -am test` or dedicated migration test if project adds one | ⚠️ verify existing migration tests [PARTIAL] |

### Sampling rate

- **Per task commit:** `./mvnw -pl skillhub-domain test` (fast feedback for pure domain changes).
- **Per wave merge:** `make test-backend` (matches CI).
- **Phase gate:** Full backend suite green before `/gsd-verify-work`.

### Wave 0 gaps

- [ ] New `SkillCollection*ServiceTest` classes covering owner/contributor/admin-equivalent matrix (D-12, ROL-07).
- [ ] Mock implementation of `SkillReadableForActorPort` (name TBD) shared across tests.
- [ ] Confirm whether `skillhub-infra` or `skillhub-app` hosts `@DataJpaTest` for Flyway — **grep during planning** if migration integration tests are required beyond Spring context smoke [PARTIAL].

## Security Domain

> `security_enforcement` enabled; ASVS level **1** per config [VERIFIED: `.planning/config.json`].

### Applicable ASVS categories (L1, collection slice)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | no (Phase 1 domain only; auth at HTTP in Phase 2) | — |
| V3 Session Management | no | — |
| V4 Access Control | yes | Explicit service-level checks for owner vs contributor vs admin-equivalent (D-12, ROL-07) [VERIFIED: CONTEXT]. |
| V5 Input Validation | yes | Validate title/description length, slug charset/length consistent with skill slug rules; reject unknown enum strings [VERIFIED: patterns in `V4__normalize_skill_slugs.sql` + JPA enums]. |
| V6 Cryptography | no | — |

### Known threat patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on collection mutations (future HTTP) | Elevation / Spoofing | Phase 1: always pass `actingUserId` + `adminOverride` into domain services; never trust entity graph alone [VERIFIED: D-12]. |
| Metadata leakage via skill add | Information disclosure | Port enforces “readable by actor” before persisting membership (COL-04 / INT-01) [VERIFIED: REQUIREMENTS.md]. |
| Duplicate / race membership | Tampering | DB uniqueness INT-02 [VERIFIED: REQUIREMENTS.md]. |

## Sources

### Primary (HIGH confidence)

- `C:/projects/github/iflytek/skillhub/.planning/phases/01-domain-persistence/01-CONTEXT.md` — locked architecture decisions D-00..D-12.
- `C:/projects/github/iflytek/skillhub/.planning/REQUIREMENTS.md` — COL-*, ROL-*, limits, MVP decisions.
- `C:/projects/github/iflytek/skillhub/server/pom.xml`, `server/skillhub-app/pom.xml`, `server/skillhub-domain/pom.xml`, `server/skillhub-infra/pom.xml` — versions and module deps.
- `C:/projects/github/iflytek/skillhub/server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/skill/Skill.java` — JPA conventions.
- `C:/projects/github/iflytek/skillhub/server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/namespace/NamespaceMember.java` — membership row pattern.
- `C:/projects/github/iflytek/skillhub/server/skillhub-infra/src/main/java/com/iflytek/skillhub/infra/jpa/NamespaceMemberJpaRepository.java` — repository adapter pattern.
- `C:/projects/github/iflytek/skillhub/server/skillhub-domain/src/test/java/com/iflytek/skillhub/domain/namespace/NamespaceMemberServiceTest.java` — unit test pattern.
- `C:/projects/github/iflytek/skillhub/Makefile` — `test-backend` / `test-backend-app`.
- `C:/projects/github/iflytek/skillhub/.github/workflows/pr-tests.yml` — CI `make test-backend`.
- `C:/projects/github/iflytek/skillhub/server/skillhub-app/src/main/resources/db/migration/V1__init_schema.sql` — `user_account.id` type.
- `C:/projects/github/iflytek/skillhub/server/skillhub-app/src/main/resources/db/migration/V4__normalize_skill_slugs.sql` — slug constraints reference.
- Maven `help:evaluate -Dexpression=flyway.version -pl skillhub-app` — **9.22.3** (2026-04-15 run).

### Secondary (MEDIUM confidence)

- `.planning/research/SUMMARY.md` — aggregate naming sketch and pitfalls.
- `docs/2026-04-15-skill-collections-research.md` — historical reasoning; **superseded** for permission boundaries by REQUIREMENTS/CONTEXT.

### Tertiary (LOW confidence)

- Exact Testcontainers / H2 profile used in `skillhub-app` tests — not inspected file-by-file in this session [flagged in Wave 0 gaps].

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — POMs + Maven property evaluated + CI workflow read.
- Architecture: **HIGH** — multiple exemplar types in repo for entities, repos, services, tests.
- Pitfalls: **MEDIUM** — includes one unresolved dependency alignment check.

**Research date:** 2026-04-15  
**Valid until:** 2026-05-15 (stable stack); re-check Flyway line if upgrading Spring Boot before then.
