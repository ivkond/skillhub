---
phase: 3
reviewers:
  - qwen
  - agent-peer
reviewed_at: 2026-04-15T21:50:00+00:00
plans_reviewed:
  - .planning/phases/03-web-ui/03-01-PLAN.md
  - .planning/phases/03-web-ui/03-02-PLAN.md
  - .planning/phases/03-web-ui/03-03-PLAN.md
---

# Cross-AI Plan Review — Phase 3 (Web UI)

## Gemini Review

Not invoked (CLI availability not confirmed for this run).

---

## Claude Review

Not invoked (same model family as the orchestrating session; skipped for independence per GSD `review.md` guidance).

---

## Codex Review

**Could not be completed as a plan review.**

`codex exec --skip-git-repo-check -` was fed the full cross-AI prompt on stdin. The Codex session treated the request as implementation work: it explored repository files (e.g. `AddNamespaceMemberDialog`) and emitted tool-style output instead of a structured markdown plan assessment. No usable review artifact was produced.

**Recommendation for future runs:** constrain Codex with an explicit non-code role (e.g. system preamble: “You are a document reviewer only; do not use read_file or propose patches; output sections 1–5 in markdown”) or use a dedicated `codex exec` profile / model config for doc-only tasks.

---

## OpenCode Review

**Could not be completed.**

`opencode run` with attached plan files was started with review-only instructions; after several minutes the process had not written stdout content to the terminal capture (possible hang, auth, or provider stall). Re-run locally if an OpenCode review is required for parity with Phase 2.

---

## Qwen Review

Invoked via **`qwen` CLI** (`--channel CI`, stdin = full 03-01/02/03 plans + instructions; system prompt: no tools, markdown-only).

### Summary

Plans 01–03 deliver Phase 3 Web UI in a logical three-wave split: (01) authenticated routing + list/create/edit scaffolding, (02) backend D-09 aggregate + D-11 contributor reorder merge, (03) detail page, contributor management, share, and public route. The split is coherent, dependencies are correctly ordered (02 before 03), and the threat models are well-reasoned. However, there are notable gaps around route registration mechanics, the D-11 backend merge complexity, public-page dual-fetch race conditions, and missing verification steps for critical UI behaviors.

### Strengths

- **Good plan decomposition**: 01 → 02 → 03 ordering is correct; 02 (backend) gates 03's detail UX properly, preventing UI from coding against missing contracts.
- **Pattern mirroring is explicit**: Heavy reliance on `use-namespace-queries.ts` and `AddNamespaceMemberDialog` as templates reduces surface area for novel bugs. Plans correctly cite exact file paths and existing patterns.
- **Threat models are solid**: CSRF, information disclosure, and access control risks are identified with concrete mitigations (e.g., D-08 generic not-found, D-09 non-leaking count).
- **OpenAPI regeneration contingency**: Task 1 in 01 correctly handles the case where Spring Boot isn't running by documenting manual typings and flagging regeneration in SUMMARY.
- **Verification commands are explicit**: Each task has `rg`-based acceptance criteria and automated `vitest`/`typecheck`/`mvnw test` gates.
- **D-11 resolved decision correctly placed in 02**: The research open question about partial reorder is resolved and assigned to the backend plan where it belongs.

### Concerns

- **HIGH:** **D-11 merge logic complexity under-specified**: "Merge ordering (stable relative order for hidden ids)" is a non-trivial algorithm. Plan 02 does not specify the merge strategy (e.g., preserve hidden positions, interleave visible order, or append). Without a concrete algorithm, implementation risk is high and could produce inconsistent reorder results.
- **HIGH:** **Public page dual-fetch has no race/cancellation strategy**: Plan 03 Task 2 describes sequential `GET /api/web/public/...` then `GET /api/web/collections/{id}` when session exists. If the authenticated fetch is slower, the page may flash the public payload then switch, or if the user navigates away mid-flight, state could update on unmounted components. No abort signal, cancel token, or React Query `refetchOnMount`/`staleTime` tuning is mentioned.
- **HIGH:** **Router registration pattern mismatch**: Plan 01 Task 3 says to register `dashboard/collections`, `dashboard/collections/new`, `dashboard/collections/$collectionId/edit` as siblings. The existing `router.tsx` uses a **flat structure** — every `dashboard/*` route is a direct child of `rootRoute`, not nested children of `dashboardRoute`. Plans must follow this flat pattern (e.g., `path: 'dashboard/collections'`, not a child route) to avoid TanStack Router nesting bugs.
- **MEDIUM:** **No `beforeLoad` caching / data prefetch for list page**: `CollectionsListPage` will call `useMyCollections`, but plan 01 does not specify whether `beforeLoad` should prefetch data (existing TanStack patterns in this repo may or may not use `loader`). If `loader` isn't used, pages will flash loading state — acceptable but should be explicit.
- **MEDIUM:** **`useCollectionDetail` invalidation scope missing**: Plan 01 Task 2 lists invalidation of `['collections','mine']` and `['collections', id]` on mutations, but does not mention invalidating `['collections']` (generic prefix) which may be used elsewhere (e.g., dashboard preview card). Missing invalidation could cause stale cards after create.
- **MEDIUM:** Plan 03 Task 1 acceptance criteria uses regex `dashboard/collections/\$collectionId` — tighten patterns to avoid false positives.
- **MEDIUM:** **No explicit handling of `ApiError` field-level validation messages**: Plan 01 Task 3 says "handle `ApiError` field messages in-place" but does not specify how (inline form field errors, toast, banner).
- **MEDIUM:** **D-09 aggregate field name not finalized**: Plan 02 uses `additionalMembersHiddenFromActorCount` as a candidate name but says "name TBD". This delays frontend typing and requires coordination between 02 and 03. Should be locked before 03 starts.
- **MEDIUM:** Plan 03 Task 2 references `getCurrentUser|useSession|auth` without committing to actual auth hook — should use the exact hook name from the repo (e.g. `useAuth`) to avoid drift.
- **LOW:** **No Playwright/E2E scenario mentioned** for Phase 3 success criteria; deferral to Phase 4 is noted but a single smoke scenario would de-risk 03-03.
- **LOW:** **`collectionApi` public GET not in 01**: Public endpoint could be scaffolded in 01 alongside other methods for cohesion.
- **LOW:** **i18n namespace not specified** — clarify flat vs nested keys in `en.json`/`zh.json`.

### Suggestions

1. **Specify the D-11 merge algorithm explicitly** in 02-PLAN Task 1 (pseudo-code or decision table).
2. **Lock the D-09 field name** before 03 starts; document JSON camelCase in 02-PLAN.
3. **Add abort/cancellation to public page dual-fetch** in 03-PLAN Task 2 (React Query `signal`, `setQueryData`, unmount safety).
4. **Clarify router registration style** in 01-PLAN Task 3 (flat sibling routes under `rootRoute` per existing `dashboard/*` pattern).
5. **Add `collectionApi.getPublicBySlug`** (or equivalent) in 01 Task 1.
6. **Specify form validation error pattern** in 01-PLAN Task 3 (map `ApiError.details` like existing flows).
7. **Use exact auth hook name** in 03 acceptance criteria.
8. **Add a single E2E smoke scenario** to 03-03 (anonymous public → sign-in → owner reorder).
9. **Tighten `rg` patterns** or assert route `id` properties instead of path-only strings.

### Risk Assessment

**MEDIUM** — The plan split is well-structured and most risks are mitigated by explicit pattern mirroring and threat models. D-11 merge complexity and public dual-fetch races are genuine implementation risks. Router registration style mismatch could cause debugging churn if missed. D-09 field name ambiguity is a coordination risk between 02 and 03. With suggested clarifications, risk drops toward **LOW**.

---

## Agent peer review (adversarial plan pass)

### Summary

The three waves move from **client foundation** (OpenAPI, hooks, routes, CRUD UI, i18n) through **server hardening** (aggregate counts, safe partial reorder, tests) to **rich detail and public sharing** (skills, reorder UI, contributors, dual-mode public page). The sequence is mostly sensible—API contract and client scaffolding before public routes—but **03-03’s dual-fetch and enrichment story depends on 03-02’s security guarantees and stable response shapes**, and **OpenAPI drift** can silently desync 03-01 from the backend. **D-08 (“generic not found”)** is not explicitly owned by any single plan wave, leaving a **consistency gap** between public and authenticated error surfaces and possible **ID/slug enumeration** behavior.

### Strengths

- **Clear wave boundaries**: separating server-only reorder/count logic (03-02) from UI (03-01/03-03) reduces thrash and keeps security fixes testable without the full React surface.
- **Explicit security test intent** on 03-02 (IT + domain) for partial merge and “hidden member count never on public” aligns with the stated research risks.
- **Public vs authenticated GET** on the same URL in 03-03 matches real product needs (share links, progressive enhancement) if caching, auth, and error semantics are nailed down.
- **Router + i18n + tests called out in 03-01** reduces the chance of shipping untranslated strings and broken deep links.
- **Contributor section “mirroring namespace members”** suggests reuse of patterns and components, which can improve consistency and cut duplicate accessibility/i18n work.

### Concerns

- **HIGH:** **D-08 is unassigned** across the three plans. If public and authenticated endpoints return different 404 vs 403 behavior, or leak existence via timing/body differences, **03-03’s share flow becomes an enumeration oracle**. Without a single decision and tests, waves may implement incompatible handlers.
- **HIGH:** **Partial reorder merge “must not leak hidden ids”** is subtle: merging client order with server truth can **reveal cardinality or ordering hints** via response payloads, **ETags**, or **reordered positions** unless responses are carefully scrubbed and **integration tests cover contributor vs non-contributor** and **mixed visible/hidden** memberships.
- **MEDIUM:** **Dual-fetch for logged-in public viewers** (research): two round-trips on one page **worsens LCP**, complicates **loading/error states**, and risks **flicker or inconsistent snapshots** if the second response changes shape. **Cache invalidation** after mutations may double-hit the same endpoints.
- **MEDIUM:** **OpenAPI may be stale**: regenerating in 03-01 without a **contract lock** (generated artifacts committed + CI diff check, or server-first publish step) can ship **client types that lie about nullability, fields, and error models**, causing production runtime errors only on edge paths (public vs authed).
- **MEDIUM:** **N skill-by-id enrichment** in 03-03: without **batching**, **deduplication**, **parallel limits**, or **server-side aggregate `skills[]`**, the detail page can devolve into **waterfall requests** and **poor mobile performance**; error partials (some skills 404/forbidden) need UX and i18n.
- **MEDIUM:** **Test gaps**: 03-01 lists hooks/router tests but **03-03’s public/authenticated matrix**, **reorder UI**, **share actions**, and **VIS** may lack **e2e or contract tests**; **03-02 ITs** may not assert **OpenAPI-documented** behavior if the spec lags.
- **MEDIUM:** **i18n scope creep**: list/create/edit + dashboard + user menu + contributors + share strings across **public and authed** contexts multiply **plural/gender/casing** edge cases; **403 vs “not found” copy** must not contradict D-08.
- **LOW:** **Routing collisions**: `/u/$ownerKey/c/$collectionSlug` vs dashboard routes under `/collections` can duplicate logic; **canonical URLs**, **redirects**, and **SEO/meta** for public pages need a single source of truth.
- **LOW:** **Dependency order**: if **03-01 ships UI** that assumes **03-02 response fields** (e.g., hidden count only for contributors), feature flags or **version skew** between deploys can cause **undefined field** bugs unless optional chaining and API versioning are explicit.

### Suggestions

- **Own D-08 in writing**: pick **uniform 404** vs **403** policy per resource class, document **response body shape**, and add **cross-cutting tests** that run against both **public and authed** routes (including **non-member contributor** and **logged-out owner** cases).
- **Define the partial-reorder contract**: specify **idempotency**, **conflict behavior** (optimistic version, **412/409**), **maximum payload**, and **exact server merge rules** with **property-based or table-driven tests** for hidden members.
- **Collapse dual-fetch where possible**: prefer **one endpoint** with documented **viewer-specific fields**, or **a single BFF query**; if two calls remain, specify **dedupe**, **React Query** policy, and **loading UI** to avoid layout shift.
- **Batch skill enrichment**: add **`GET /skills?ids=`** or embed **skill summaries** in collection detail responses; cap **concurrency** and define **partial failure** rendering.
- **OpenAPI hygiene**: make **regen deterministic**, fail CI on drift, and **sequence merges** so server changes land before client regen PRs (or use **pinned spec artifact**).
- **i18n checklist**: **error codes** mapped to messages, **aria labels** for reorder/share, and **RTL** checks if supported elsewhere in the app.
- **Performance budgets**: set **max requests** and **p95 latency** targets for collection detail (public and authed) before VIS sign-off.

### Risk Assessment

**HIGH** — The combination of **public share URLs with authenticated upgrades**, **partial reorder merges that must hide membership details**, and **unowned D-08 error semantics** creates a **high-impact security and correctness surface**: small mistakes become **information leaks** or **broken authorizations**, while **OpenAPI drift** and **N+1 skill fetches** make **03-03** likely to ship **subtle production bugs** that unit tests on isolated pieces will miss. The plan is **directionally strong** but **needs explicit cross-wave contracts and tests** (especially **public vs authed parity** and **merge invariants**) to bring risk down to medium.

---

## Consensus Summary

**Qwen** and **agent peer** both flag **D-11 merge under-specification**, **dual-fetch / public-page correctness**, and **contract coordination** (OpenAPI, DTO field names) as the main execution risks. **Agent peer** emphasizes **D-08** ownership and **information disclosure** more strongly (**overall HIGH** until tests lock semantics); **Qwen** rates **overall MEDIUM** with concrete engineering gaps (router flatness, cancellation, invalidation, form errors).

### Agreed strengths (with research / plans)

- Wave **03-02** correctly front-loads **D-09** and **D-11** before **03-03** consumes those contracts in the UI.
- Plans reference **namespace-members** patterns and **RouteSecurityPolicyRegistry**, matching repo conventions.
- Threat-model sections in each plan surface ASVS-style thinking.
- Explicit **rg/vitest/mvn** verification hooks in each plan.

### Agreed concerns (prioritize for `/gsd-plan-phase 3 --reviews`)

1. **D-08 and error parity** — Assign generic Not Found behavior and tests across public + authenticated flows (**HIGH**, agent-peer; aligns with product **D-08**).
2. **Partial reorder merge semantics** — Specify merge algorithm, idempotency, and non-leak guarantees; add tests (**HIGH**, both reviewers).
3. **Dual-fetch UX and consistency** — Loading, flicker, cancellation, React Query policy (**MEDIUM/HIGH**, both).
4. **Skill enrichment performance** — N+1 / batching / server expansion (**MEDIUM**, agent-peer).
5. **OpenAPI / contract drift** — Regen discipline and field-name lock for D-09 before 03 (**MEDIUM**, both).
6. **Router + invalidation + form-error patterns** — Flat `dashboard/*` registration, query key invalidation scope, `ApiError` mapping (**MEDIUM**, Qwen).

### Divergent views

- **Overall risk level:** **Agent peer: HIGH** (security surface of public URL + partial reorder + D-08) vs **Qwen: MEDIUM** (implementation detail and coordination). Treat **HIGH** for security-sensitive items (**D-08**, merge leak surface) and **MEDIUM** for engineering polish.
- **Codex vs plan intent:** The automated Codex session diverged into code exploration; shows **tooling risk** for doc-only review, not a product disagreement.

---

## Next steps

- Incorporate feedback when re-planning or tightening tasks: **`/gsd-plan-phase 3 --reviews`**
- Optionally re-run **`/gsd-review --phase 3 --all`** after fixing Codex/OpenCode invocation (doc-only prompts, timeouts) for true multi-vendor consensus.
