## Summary
Повторный re-review показывает, что remediation был не формальным: все четыре target-области действительно затронуты, а два замечания Round 1 закрыты на governance-level. `Validation closure gate` теперь формализован и больше не позволяет premature flip, а `OAUTH/SEC` traceability добавлен в глобальный registry. Но `account-linking / identity safety` и `provider contract consistency` остаются закрыты лишь частично: нужные сценарии и anti-drift controls уже прописаны, однако часть критичных semantics все еще не нормализована в canonical docs, а evidence в `07-VALIDATION.md` пока остается `pending`.

## Resolved Since Round 1
1. `Account-linking / identity safety` частично закрыт: в `07-01-PLAN.md` добавлены явные сценарии `pending`, `disabled`, `conflict linking`, `email_verified=false`, а также `privacy/logging guardrail` в `Task 1`, `Task 3` и `success_criteria`.

2. `Provider contract consistency` частично закрыт: в `07-02-PLAN.md` появился явный contract `google` backend registrationId -> `oauth-google` UI method id -> `/oauth2/authorization/google`, плюс anti-drift tests и runtime guard в `provider_contract`, `Task 1`, `Task 2`.

3. `Validation closure gate` закрыт: `07-VALIDATION.md` теперь содержит `Nyquist Transition Rule`, `Machine-Checkable Gate`, `Gate Evidence Registry`, а `nyquist_compliant` корректно оставлен `false` до появления green evidence и reviewer sign-off.

4. `Requirements traceability for OAUTH/SEC` закрыт: в `REQUIREMENTS.md` добавлены разделы `OAuth provider integration (OAUTH)`, `Security invariants (SEC)` и отдельная traceability-таблица для Phase 7.

## Remaining Concerns
- **HIGH**: Не до конца зафиксирована authoritative account-linking semantics для hardest case: что именно происходит, если Google login приходит с email, уже существующим у local/GitHub/Gitee identity. В `07-01-PLAN.md` (`Task 1`, `success_criteria`) есть требование про `conflict linking` и safe refusal, но в `07-CONTEXT.md` (`OAUTH-03`) это не поднято до четкого phase contract уровня.

- **MEDIUM**: Closure по identity safety пока declarative, а не evidence-backed. В `07-VALIDATION.md` (`Per-Task Verification Map`, `Gate Evidence Registry`) все релевантные evidence все еще `pending`, при этом `07-REVIEWS.md` (`Remediation Applied`) уже формулирует это как закрытый пункт.

- **MEDIUM**: Contract `google` vs `oauth-google` нормализован только в `07-02-PLAN.md`, но не полностью в canonical docs. `07-CONTEXT.md` (`OAUTH-04`) и `REQUIREMENTS.md` (`OAUTH-04`, `OAUTH-05`) по-прежнему говорят о “Google” более общо и не фиксируют явно distinction между backend provider id и UI method id.

- **MEDIUM**: Есть traceability mismatch по `OAUTH-06`. В `07-02-PLAN.md` (frontmatter `requirements`) он уже указан, а в `REQUIREMENTS.md` (`Post-v1.0 / vNext Traceability`) `OAUTH-06` маппится только на Plan 03. Это создает governance drift между phase plan и global registry.

- **LOW**: `Machine-checkable gate` формализован хорошо, но не полностью синхронизирован с более широкой verification story. В `07-03-PLAN.md` (`Task 1`) есть `e2e smoke`, а в `07-VALIDATION.md` (`Machine-Checkable Gate`) он не входит в required evidence, поэтому closure rule уже strong, но не максимально complete.

## Actionable Suggestions
- Поднять explicit decision для `conflict linking` из `07-01-PLAN.md` в canonical уровень: добавить в `07-CONTEXT.md` и `REQUIREMENTS.md`, что same-email cross-provider collision либо `reject`, либо `require authenticated linking flow`, без implicit auto-bind.

- В `07-VALIDATION.md` добавить отдельные evidence rows или explicit mapping для `conflict linking`, `email_verified=false` и `privacy/logging guardrail`, чтобы claim “closed” в `07-REVIEWS.md` был подтверждаем не только plan text, но и validation artifact.

- Нормализовать contract wording в `07-CONTEXT.md` и `REQUIREMENTS.md`: явно прописать, что backend publishes provider `google`, а UI consumes method `oauth-google`, чтобы invariant не жил только в `07-02-PLAN.md`.

- Исправить traceability drift по `OAUTH-06`: либо убрать его из frontmatter `07-02-PLAN.md`, либо обновить `REQUIREMENTS.md`, если часть `OAUTH-06` действительно покрывается Plan 02.

- Решить, должен ли `e2e auth-entry smoke` быть mandatory release evidence. Если да, добавить его в `Nyquist Transition Rule`; если нет, явно пометить его как supplemental, чтобы rule не выглядел неполным.

## Risk Assessment
**MEDIUM**. Governance и documentation quality заметно улучшились, и Round 1 concerns больше не выглядят “пропущенными”. Но для auth-related phase остаются два существенных residual risks: не полностью зафиксированная `identity binding` semantics и отсутствие recorded evidence в validation artifacts. То есть planning corpus стал существенно сильнее, но пока еще не дает полного основания считать security-sensitive closure окончательно доказанным.
