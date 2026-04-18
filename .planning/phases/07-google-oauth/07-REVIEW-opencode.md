# Cross-Agent Review — Phase 07 (Google OAuth)

## Summary

Фаза 07 представляет собой хорошо структурированное расширение существующего OAuth pipeline с добавлением Google как first-party provider. Планирование следует архитектурным принципам проекта: extractor-based extensibility, data-driven UI, отсутствие security bypasses. Три плана охватывают backend integration → web UX → verification/docs с корректными зависимостями. Основные риски связаны с traceability требований OAuth и неполной security regression для edge cases (pending/disabled).

## Strengths

- **Clean architectural fit**: Использование `OAuthClaimsExtractor` интерфейса вместо параллельного auth pipeline — соответствует существующему design.
- **Security-first approach**: SEC-01..SEC-03 явно запрещают bypass-ветки в SecurityConfig, reuse существующих sanitize/policy цепочки.
- **TDD explicit**: Все три плана начинают с task type="test" с проваливающимися кейсами, verification commands привязаны к каждой задаче.
- **Dependencies correct**: Plan 02 depends_on=[01] (web зависит от backend provider exposure), Plan 03 depends_on=[01,02].
- **Risk register present**: 07-RESEARCH.md содержит mitigations для HIGH-risk scenarios (wrong claims mapping, open redirect regression).

## Concerns

| Severity | Файл | Проблема |
|----------|------|----------|
| **MEDIUM** | `07-VALIDATION.md:71` | Frontmatter содержит `nyquist_compliant: false` — валидация не завершена до начала execution. Sign-off checklist требует ручной правки `nyquist_compliant: true` после выполнения, но нет механизма enforcement. |
| **MEDIUM** | `07-01-PLAN.md:56-57` | Threat model определяет T-07-01-01 (wrong mapping → account binding) и T-07-01-02 (bypass sanitize/policy), но **нет явного теста** для edge case: Google OAuth callback для pending/disabled account должен fallback на `/pending-approval` или `/access-denied` без leakage данных. |
| **MEDIUM** | `07-02-PLAN.md:144` | i18n update описан как "provider-agnostic copy", но нет explicit test что `loginButton.loginWith` действительно использует i18n ключи для Google, а не fallback на hardcoded строку. |
| **LOW** | `07-RESEARCH.md:47` | Ops docs "incomplete" — Gap Summary указывает на отсутствие Google config guidance, но 07-03-PLAN.md не включает отдельную task на создание ops-ориентированного markdown с troubleshooting steps (только design + deployment docs). |
| **LOW** | `07-CONTEXT.md:59-65` | Deferred items (account linking UI, provider-specific avatar) корректно вынесены, но **нет governance** — как принимается решение о возврате к этим deferred items? |

## Suggestions

1. **Add pending/disabled security regression test** — В 07-01-PLAN.md Task 3 добавить assertion что Google callback для `user.status=PENDING` возвращает redirect на `/pending-approval`, не泄露вая details. Либо явно задокументировать что существующий AccessPolicy handling покрывает Google path без дополнительных тестов (с reference на существующий integration test).

2. **Enforce validation completion** — Перед execution phase, 07-VALIDATION.md должен иметь `nyquist_compliant: true` со ссылкой на evidence (wave 0 verification прошла). Consider добавить auto-check в verification command: `rtk proxy node gsd-tools.cjs verify --phase 7 --strict`.

3. **Add explicit i18n test для provider copy** — В 07-02-PLAN.md Task 3 acceptance_criteria добавить: "mock methods с google provider -> login button CTA text НЕ содержит 'GitHub'".

4. **Separate ops troubleshooting doc** — В 07-03-PLAN.md Task 2 добавить третий файл: `docs/20-troubleshooting.md` (или секция в `09-deployment.md`) с: "Google OAuth не работает — checklist: (1) client-id matches Google Cloud Console, (2) redirect-uri matches, (3) scope includes email, (4) credentials не expired".

## Risk Assessment

**Overall risk: LOW**

Обоснование:
- Архитектурное решение (extractor pattern) уже proven для GitHub — Google добавляется по аналогии без изменения security model.
- TDD workflow с явными failing tests до implementation снижает риск regression.
- SEC invariants явно зафиксированы в CONTEXT и threat model.
- Dependencies между планами корректны: web не может рендерить provider до backend его не экспонирует.
- Security concerns (MEDIUM level) относятся к edge cases, которые покрываются existing policy gates — риск что Google bypass эти gates явно mitigрован в threat model и verified через integration tests.

Риск scope creep минимальный: deferred items корректно identified, phase boundary явно описан в 07-CONTEXT.md.
