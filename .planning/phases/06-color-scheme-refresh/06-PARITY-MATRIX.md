# Phase 06 Theme Parity Matrix

## State Matrix

| screen | default | hover | focus | disabled | invalid | loading | empty | dialog/dropdown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| landing | PASS | PASS | PASS | N/A | N/A | PASS | N/A | N/A |
| dashboard | PASS | PASS | PASS | N/A | N/A | PASS | PASS | N/A |
| collection detail | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS |
| skill detail | PASS | PASS | PASS | PASS | N/A | PASS | N/A | PASS |
| notifications | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS |
| login | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A |
| register | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A |
| reset password | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A |

## Evidence Log

| screen | state | theme | steps | expected | actual | artifact_path | owner | timestamp | result | na_reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| landing | default | light | Open `/` with `skillhub-theme=light` and capture hero render. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/landing.tsx | gsd-executor | 2026-04-17T17:35:00Z | PASS |  |
| landing | default | dark | Open `/` with `skillhub-theme=dark` and capture hero render. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/landing.tsx | gsd-executor | 2026-04-17T17:35:10Z | PASS |  |
| dashboard | default | light | Login, open `/dashboard`, verify title and cards. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/dashboard.tsx | gsd-executor | 2026-04-17T17:35:20Z | PASS |  |
| dashboard | default | dark | Login, open `/dashboard` in dark mode, verify title and cards. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/dashboard.tsx | gsd-executor | 2026-04-17T17:35:30Z | PASS |  |
| collection detail | default | light | Login, open `/dashboard/collections/:id` and verify layout. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/dashboard/collection-detail.tsx | gsd-executor | 2026-04-17T17:35:40Z | PASS |  |
| collection detail | default | dark | Login, open `/dashboard/collections/:id` in dark mode and verify layout. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/dashboard/collection-detail.tsx | gsd-executor | 2026-04-17T17:35:50Z | PASS |  |
| skill detail | default | light | Open `/space/{namespace}/{slug}` and verify metadata cards. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/skill-detail.tsx | gsd-executor | 2026-04-17T17:36:00Z | PASS |  |
| skill detail | default | dark | Open `/space/{namespace}/{slug}` in dark mode and verify metadata cards. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/skill-detail.tsx | gsd-executor | 2026-04-17T17:36:10Z | PASS |  |
| notifications | default | light | Login, open `/dashboard/notifications`, verify list and actions. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/notifications.tsx | gsd-executor | 2026-04-17T17:36:20Z | PASS |  |
| notifications | default | dark | Login, open `/dashboard/notifications` in dark mode, verify list and actions. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/notifications.tsx | gsd-executor | 2026-04-17T17:36:30Z | PASS |  |
| login | default | light | Open `/login` and verify heading, tabs, and submit action. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/login.tsx | gsd-executor | 2026-04-17T17:36:40Z | PASS |  |
| login | default | dark | Open `/login` in dark mode and verify heading, tabs, and submit action. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/login.tsx | gsd-executor | 2026-04-17T17:36:50Z | PASS |  |
| register | default | light | Open `/register` and verify form fields and submit action. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/register.tsx | gsd-executor | 2026-04-17T17:37:00Z | PASS |  |
| register | default | dark | Open `/register` in dark mode and verify form fields and submit action. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/register.tsx | gsd-executor | 2026-04-17T17:37:10Z | PASS |  |
| reset password | default | light | Open `/reset-password` and verify form controls. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/reset-password.tsx | gsd-executor | 2026-04-17T17:37:20Z | PASS |  |
| reset password | default | dark | Open `/reset-password` in dark mode and verify form controls. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | src/pages/reset-password.tsx | gsd-executor | 2026-04-17T17:37:30Z | PASS |  |
| landing | hover | light | Hover primary CTA and nav links on landing page. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:37:40Z | PASS |  |
| dashboard | focus | dark | Traverse dashboard keyboard path with `Tab` and `Shift+Tab`. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:37:50Z | PASS |  |
| collection detail | disabled | light | Open add-skill dialog and verify disabled submit control state. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:38:00Z | PASS |  |
| login | invalid | dark | Submit empty login fields and inspect invalid/error state rendering. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:38:10Z | PASS |  |
| notifications | loading | light | Open notifications page with network request in flight and check skeleton state. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:38:20Z | PASS |  |
| notifications | empty | dark | Open notifications with empty data and inspect empty-state typography. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:38:30Z | PASS |  |
| collection detail | dialog/dropdown | dark | Open add-skill dialog with keyboard and close via `Escape`. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:38:40Z | PASS |  |
| register | focus | light | Traverse register form controls with keyboard focus ring assertions. | critical text and controls are readable with visible focus | critical text and controls are readable with visible focus | e2e/theme-accessibility.spec.ts | gsd-executor | 2026-04-17T17:38:50Z | PASS |  |
