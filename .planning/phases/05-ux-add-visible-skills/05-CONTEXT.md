# Phase 5: ux-add-visible-skills - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the **Add skill** UX on collection detail pages so owner/contributor/admin users can add **any skill visible to the acting user** through a clear, consistent, and high-throughput UI flow. Scope is limited to web UX flow, candidate discovery, and selection behavior. This phase does **not** introduce new permission models or expand collection capabilities beyond existing `COL-04` / `ROL-04` / `INT-01` constraints.

</domain>

<decisions>
## Implementation Decisions

### Entry Points & Access
- **D-01:** Main entry point for non-empty collections is a prominent **`Add skill`** button next to the `Skills` section heading.
- **D-02:** Empty-state CTA is unified with the same **`Add skill`** flow (replace the current `Browse my skills` primary action).
- **D-03:** Show `Add skill` action to **owner, contributor, and admin-equivalent** actors (aligned with `ROL-04`).
- **D-04:** If there are no addable skills, show an **empty state inside the add flow** with explanation and a follow-up CTA (publish/search path), rather than failing silently.

### Picker Interaction Model
- **D-05:** Candidate picker opens as an **inline modal** from collection detail (no dedicated route for v1).
- **D-06:** Picker supports **full discovery controls**: search, filters, sorting, pagination (aligned with existing SearchPage interaction model).
- **D-07:** Selection mode is **multi-select** with an explicit commit action: `Add selected (N)`.

### Candidate Visibility & Rendering Rules
- **D-08:** Candidate list should represent skills the acting user can **add right now** (visibility/addability-safe source).
- **D-09:** Skills already in the current collection remain visible in results but are **disabled** and labeled `Already in collection`.
- **D-10:** Picker cards show `displayName`, `namespace`, `status/visibility`, and `summary` with **length-limited truncation**.

### the agent's Discretion
- Exact summary truncation policy (line clamp/character threshold) and fallback behavior.
- Fine-grained disabled affordances (inline text vs tooltip) as long as no metadata leak is introduced.
- Modal layout details (sticky footer action, keyboard interaction), provided accessibility and clarity stay consistent with existing UI patterns.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone contracts
- `.planning/ROADMAP.md` — Phase 5 scope anchor and dependency chain.
- `.planning/REQUIREMENTS.md` — `COL-04`, `ROL-04`, `INT-01`, `VIS-03` constraints governing addability and visibility safety.
- `.planning/PROJECT.md` — milestone boundaries and v1 non-goals.

### Prior phase decisions
- `.planning/phases/01-domain-persistence/01-CONTEXT.md` — domain invariants and addability enforcement assumptions.
- `.planning/phases/03-web-ui/03-CONTEXT.md` — existing collection UI decisions (`D-13` prominent Add CTA intent, contributor behavior, public filtering).
- `.planning/phases/04-verification-docs/04-CONTEXT.md` — verification baseline and UX contract continuity.
- `.planning/phases/03-web-ui/03-DISCUSSION-LOG.md` — historical rationale for contributor-visible subset behavior.

### Web implementation anchors
- `web/src/pages/dashboard/collection-detail.tsx` — current detail page composition and current empty-state CTA.
- `web/src/features/collection/collection-skill-rows.tsx` — current skills table and action conventions.
- `web/src/shared/hooks/use-collection-queries.ts` — collection mutations (`useAddCollectionSkill`) and invalidation patterns.
- `web/src/shared/hooks/use-skill-queries.ts` — reusable `useSearchSkills` query primitives.
- `web/src/shared/hooks/skill-query-helpers.ts` — search URL construction and filter mapping.
- `web/src/pages/search.tsx` — reference UX for search/filter/sort/pagination behavior.
- `web/src/features/skill/skill-card.tsx` — reusable card display conventions.
- `web/src/app/router.tsx` — route/layout constraints if flow extension requires route wiring.
- `web/src/i18n/locales/en.json` — collection/search localization keys.
- `web/src/i18n/locales/zh.json` — collection/search localization keys.

### Backend contract anchors
- `server/skillhub-app/src/main/java/com/iflytek/skillhub/controller/portal/SkillCollectionController.java` — add/remove/reorder HTTP contracts.
- `server/skillhub-app/src/main/java/com/iflytek/skillhub/service/SkillCollectionPortalCommandAppService.java` — command-layer behavior for collection membership.
- `server/skillhub-domain/src/main/java/com/iflytek/skillhub/domain/collection/SkillCollectionMembershipService.java` — core addability checks, duplicate prevention, and reorder policy.

### Verification anchors
- `web/e2e/collections-flow.spec.ts` — current E2E baseline touching add-skill API behavior and collection detail.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAddCollectionSkill` and existing collection query invalidation logic can be reused for mutation wiring.
- `useSearchSkills` + `buildSkillSearchUrl` already provide search, sort, filter, pagination behavior.
- `SkillCard` and collection page card/table primitives are available for candidate rendering.
- Existing i18n locale files already contain collection and search namespaces to extend.

### Established Patterns
- Dashboard pages use local React Query hooks, toast feedback, and explicit empty-state cards.
- Collection detail currently composes separate feature components (share, rows, contributors), so add-flow fits a new feature component.
- Server remains source-of-truth for permission checks and duplicate rejection (`error.skillCollection.*`).

### Integration Points
- Add-flow attaches to `web/src/pages/dashboard/collection-detail.tsx` as a modal trigger and state owner.
- Candidate query/adaptation layer should bridge search result shape to addability UI flags.
- Mutation completion must refresh `['collections', id]` to reflect newly added members immediately.
- E2E and component tests should be extended where collection add is currently API-seeded.

</code_context>

<specifics>
## Specific Ideas

- User explicitly selected one-pass batch UX definition and locked: modal picker, full discovery controls, multi-select add, disabled already-in-collection rows, and summary truncation.
- `summary` on candidate cards must be shown but length-limited for dense scanning.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 5 UX scope.

</deferred>

---

*Phase: 05-ux-add-visible-skills*
*Context gathered: 2026-04-16*
