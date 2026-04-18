## Summary
После remediation артефакты Phase 07 стали заметно сильнее именно как planning/governance package: все четыре target area теперь явно отражены в документах, и два ключевых замечания прошлого раунда фактически закрыты без оговорок на уровне документации: `provider contract consistency` и global `requirements traceability`. При этом полное закрытие identity-safety и validation closure я бы не считал завершенным: их gaps уже хорошо локализованы и сужены, но часть semantics все еще живет только в task-level plan, а `Nyquist` gate пока можно пройти без части strongest evidence.

## Resolved Since Round 1
- **1. Account-linking / identity safety edge-cases**  
  Существенно улучшено. В `07-01-PLAN.md` (`<threat_model>`, `Task 1`, `Task 3`, `<success_criteria>`) теперь явно зафиксированы `pending`, `disabled`, `conflict linking`, `email_verified=false`, а также `privacy/logging guardrail`. Это закрывает прошлое замечание про implicit coverage.

- **2. Provider contract consistency**  
  По сути закрыто. В `07-02-PLAN.md` (`<provider_contract>`, `Task 1`, `Task 2`, `<success_criteria>`) контракт теперь сформулирован явно: backend `registrationId=google` -> UI `id=oauth-google` -> `actionUrl=/oauth2/authorization/google`, плюс есть `anti-drift test` и `runtime guard`.

- **3. Validation closure gate**  
  Базовая governance-проблема закрыта. В `07-VALIDATION.md` (`## Nyquist Transition Rule`, `### Machine-Checkable Gate`, `### Gate Evidence Registry`) и `07-03-PLAN.md` (`Task 3`) появился формальный `false -> true` rule, `reviewer_signoff`, ownership и evidence registry. Важно, что `nyquist_compliant` корректно оставлен `false`.

- **4. Requirements traceability for OAUTH/SEC**  
  Закрыто. В `.planning/REQUIREMENTS.md` добавлены `OAUTH-01..06`, `SEC-01..03` и отдельная таблица `Post-v1.0 / vNext Traceability (Phase 7)`. Это снимает round-1 замечание про phase-local requirements без глобальной регистрации.

## Remaining Concerns
- **MEDIUM** — `account-linking conflict` и `unverified email` все еще не дотянуты до canonical rule level.  
  Ссылка: `07-01-PLAN.md` (`Task 1`, acceptance criteria), `07-CONTEXT.md` (`OAUTH-03`), `.planning/REQUIREMENTS.md` (`OAUTH-03`).  
  Проблема не в том, что кейсы забыты, а в том, что точная policy semantics остается в основном на уровне plan task wording: `safe refusal` для same-email cross-provider conflict и допустимое поведение при `email_verified=false` не подняты в canonical requirements/context как однозначные invariant rules.

- **HIGH** — `validation closure gate` формализован, но набор mandatory evidence все еще уже, чем реальный release confidence.  
  Ссылка: `07-VALIDATION.md` (`### Machine-Checkable Gate`, `## Manual-Only Verifications`), `07-03-PLAN.md` (`Task 1`, `Task 3`).  
  Сейчас flip в `nyquist_compliant: true` требует backend/web/docs evidence, но не требует ни manual Google callback smoke, ни `web/e2e/auth-entry.spec.ts`, хотя оба артефакта в phase narrative подаются как важные verification steps. То есть phase можно формально закрыть без strongest end-to-end proof.

- **LOW** — `provider contract` жестко нормализован только в Plan 02, но не так же явно в canonical docs.  
  Ссылка: `07-02-PLAN.md` (`<provider_contract>`), `07-CONTEXT.md` (`OAUTH-04`, `OAUTH-05`), `.planning/REQUIREMENTS.md` (`OAUTH-04`, `OAUTH-05`).  
  Для исполнения этого достаточно, но для future reviewers остается легкий governance drift: canonical docs говорят “publish/render Google”, а не явно “backend provider id `google`, UI method id `oauth-google`”.

- **LOW** — traceability уже есть, но ownership `OAUTH-06` слегка плавает между артефактами.  
  Ссылка: `07-02-PLAN.md` (frontmatter `requirements`), `.planning/REQUIREMENTS.md` (`Post-v1.0 / vNext Traceability (Phase 7)`).  
  В `07-02-PLAN.md` `OAUTH-06` включен в plan requirements, а в global traceability он привязан только к `Plan 03`. Это не ломает phase, но создает маленький audit ambiguity.

## Actionable Suggestions
- В `07-CONTEXT.md` и `.planning/REQUIREMENTS.md` усилить `OAUTH-03` отдельной фразой уровня invariant: same-email cross-provider collision не ведет к auto-link; expected outcome = `safe refusal` / explicit manual resolution path.
- В тех же canonical docs явно зафиксировать policy для `email_verified=false`: можно ли делать `create`, можно ли делать `bind`, или разрешен только degraded path без linking.
- В `07-VALIDATION.md` добавить в `required_evidence` либо:
  1. `auth-entry.spec.ts`, либо  
  2. отдельный mandatory manual evidence row для real Google callback smoke,  
  чтобы `Nyquist` flip был действительно evidence-complete.
- В `.planning/REQUIREMENTS.md` уточнить wording `OAUTH-04/OAUTH-05`: backend publishes provider `google`, UI consumes method `oauth-google`.
- Синхронизировать ownership `OAUTH-06` между `07-02-PLAN.md` и global traceability table, чтобы future review не спорил, кто именно несет closure.

## Risk Assessment
**MEDIUM**.  
По сравнению с Round 1 remediation реальная и качественная: ключевые planning gaps закрыты, `provider contract` и `requirements registry` выглядят достаточно зрелыми. Остаточный риск сосредоточен в двух местах: `identity safety` еще не полностью canonicalized вне task-level plan, а `validation gate` пока допускает formal closure без strongest end-to-end evidence для live Google OAuth behavior.
