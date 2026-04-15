# Phase 2: Application & API — Research

**Phase:** 2 — Application & API  
**Date:** 2026-04-15  
**Question answered:** What do we need to know to plan HTTP exposure of skill collections well?

## Summary

Phase 1 delivered `SkillCollectionDomainService`, `SkillCollectionMembershipService`, `SkillCollectionContributorService`, JPA, and `SkillReadableForActorAdapter` (infra bridge to `VisibilityChecker`). Phase 2 should add **portal-style REST** under the same dual-prefix convention as namespaces (`@RequestMapping({"/api/v1", "/api/web"})`), **DTOs + application services** that translate `PlatformPrincipal` / request attributes into `actingUserId` + `adminEquivalent` flags expected by domain services, **`RouteSecurityPolicyRegistry` + `ApiTokenPolicy` rows** for every new path/method, **visibility-safe payloads** for **VIS-03** (filter skill members per viewer), and **INT-03** reconciliation (choose one strategy: lazy prune on read, explicit service method called from list/detail, or `@Scheduled` job — document trade-offs). **ADM-01** should reuse `AuditRequestContext` / patterns from `NamespaceController` and admin controllers where mutations occur.

## Stack & conventions (evidence)

| Area | Pattern | Primary paths |
|------|---------|---------------|
| Controllers | `@RestController`, extend `BaseApiController`, `ApiResponseFactory` in ctor | `controller/portal/NamespaceController.java` |
| Security catalog | Static lists in `RouteSecurityPolicyRegistry` — session (`RouteAuthorizationPolicy`) + API tokens (`ApiTokenPolicy`) | `skillhub-auth/.../RouteSecurityPolicyRegistry.java` |
| Web session user | `@RequestAttribute("userId")`, optional admin via `PlatformPrincipal` / platform roles (mirror namespace flows) | Namespace portal controllers |
| Domain boundary | Domain services already enforce ROL-07 via `SkillCollectionAuthorizationPolicy` | `SkillCollectionAuthorizationPolicy.java` |
| Skill readability port | `SkillReadableForActorAdapter` implements `SkillReadableForActorPort` | `skillhub-infra/.../SkillReadableForActorAdapter.java` |

## API surface (recommended shape)

- **Authenticated “my collections”**: `GET /api/web/me/collections` (and `/api/v1/me/collections` if parity required) — list collections where actor is owner or contributor; enforce **VIS-01** (omit private collections for strangers).
- **CRUD**: `POST /api/web/collections`, `GET/PATCH/DELETE /api/web/collections/{id}` — map to `SkillCollectionDomainService` methods; contributors get **403 or domain error** on metadata/visibility/delete (already thrown as `DomainBadRequestException` / map to HTTP per existing global handler).
- **Membership**: `POST/DELETE /api/web/collections/{id}/skills`, `PUT /api/web/collections/{id}/skills/order` — delegate to `SkillCollectionMembershipService`.
- **Contributors**: `GET/POST/DELETE /api/web/collections/{id}/contributors` — delegate to `SkillCollectionContributorService`.
- **Public read** (VIS-02/03): `GET /api/web/collections/public/{ownerKey}/{slug}` or agreed path — return **metadata** for public collections to anonymous users; **member list** must filter each skill through visibility port / DTO projection so private skill fields never appear.

Exact path strings must be chosen in PLAN.md tasks to stay consistent with Phase 3 routing (**D-06** owner-scoped slug); internal numeric `id` routes are acceptable for authenticated management APIs if documented.

## Security & ASVS L1 notes

- **Broken access control**: Rely on domain checks + controller passing correct `actingUserId`; integration tests must cover **contributor denied** on `UPDATE_METADATA`, `SET_VISIBILITY`, `DELETE_COLLECTION`, `ADD_REMOVE_CONTRIBUTOR`.
- **Sensitive data exposure**: Public collection skill list = **DTO list** built only from skills the viewer can read; never return full `Skill` entities to anonymous callers.
- **API tokens**: If collection write endpoints should reject bearer tokens until scopes exist, use `ApiTokenPolicy.unsupported` default behavior — new paths must appear in **both** policy lists with explicit decisions (`authenticated` vs `permitAll` vs `require` scope).

## INT-03 (stale membership) options

1. **Prune on read**: When loading members for a collection, remove rows whose `skillId` fails `skillReadableForActorPort` for a synthetic “system” or for **last known owner** — risky; prefer explicit policy.
2. **Explicit reconcile method**: `SkillCollectionMembershipService.reconcileInvisibleSkills(Long collectionId)` called from scheduled job or after skill visibility mutation events — clearer ownership.
3. **Periodic `@Scheduled` job** in `skillhub-app`: scans members in batches — operational complexity, good for “eventual” guarantee.

Recommendation for planning: pick **one** and encode in **02-03-PLAN.md** with concrete entry points (class names left to executor but behavior fixed).

## Dependencies & risks

- **Error mapping**: Confirm how `DomainBadRequestException` maps to HTTP status (400 vs 403) for authorization vs validation — align contributor denials with **403** where appropriate for REST semantics.
- **Pagination**: List endpoints should mirror `Pageable` + `PageResponse` like namespaces if large.
- **i18n message codes**: Reuse `ApiResponse` message keys; add `messages.properties` entries for any new user-facing errors.

## Validation Architecture

Phase verification is **JUnit 5 + Spring Boot** integration tests in `skillhub-app` (same module as controllers), using patterns from `NamespacePortal*AppServiceTest` / `MockMvc` or `@SpringBootTest` with security context helpers.

| Dimension | Approach |
|-----------|----------|
| Fast feedback | `./mvnw -q -pl skillhub-app -Dtest=SkillCollection*Test test` (or narrowed IT class) after each task |
| Full gate | `make test-backend` from repo root before phase complete |
| Auth matrix | Dedicated test class: owner / contributor / stranger (anonymous) / admin — table-driven `@ParameterizedTest` |
| VIS-03 | Assert JSON for public collection does **not** contain blocked skill ids or private fields |
| Registry drift | Unit test `RouteSecurityPolicyRegistryTest` extended or sibling test asserting new patterns are registered |

Nyquist sampling: run targeted module tests after each task commit; full `make test-backend` after each wave.

## RESEARCH COMPLETE

Research artifacts sufficient for planner/checker: stack, file anchors, security model, INT-03 fork, and validation architecture documented above.
