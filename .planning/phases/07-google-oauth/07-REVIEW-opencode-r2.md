# Cross-Agent Re-Review — Phase 07 (Google OAuth), Round 2

## Summary

Все ключевые замечания Round 1 закрыты: account-linking edge-cases формализованы в Plan 01, provider contract зафиксирован с runtime guard в Plan 02, Nyquist transition gate формализован в Plan 03, и requirements traceability расширена в глобальном REQUIREMENTS.md. Остаточные риски — минимальные и связаны с деталями реализации, которые будут проверены на этапе execution.

---

## Resolved Since Round 1

| Concern | Remediation | Status |
|---------|-------------|--------|
| **Account-linking / identity safety** | Plan 01 Task 1 добавляет явные regression tests: pending → PENDING_APPROVAL, disabled → ACCESS_DENIED, conflict linking → safe refusal, email_verified=false → no verified status. Task 3 фиксирует privacy guardrail (info/warn не логируют full OAuth attrs). | ✅ Закрыто |
| **Provider contract consistency** | Plan 02 `<provider_contract>` явно определяет `google` ↔ `oauth-google` ↔ `/oauth2/authorization/google`. Task 1 добавляет anti-drift test. Task 2 добавляет runtime guard с console.error при drift. | ✅ Закрыто |
| **Validation closure gate** | 07-VALIDATION.md содержит `Nyquist transition rule` с machine-checkable gate: 3 evidence IDs (EVID-07-BACKEND, EVID-07-WEB, EVID-07-DOCS), reviewer sign-off, explicit flip conditions. | ✅ Закрыто |
| **Requirements traceability** | REQUIREMENTS.md дополнен секцией "Post-v1.0 / vNext Requirements (Phase 7 — Google OAuth)" с OAUTH-01..06 и SEC-01..03, плюс traceability table. | ✅ Закрыто |

---

## Remaining Concerns

| ID | Severity | Description | Ref |
|----|----------|-------------|-----|
| R-07-01 | **MEDIUM** | Plan 01 Task 1 описывает regression tests для pending/disabled/conflict, но не указывает конкретные assertion messages. Execution phase должна concretize тестовые assert-ы. | 07-01-PLAN.md:94-97 |
| R-07-02 | **LOW** | Provider contract в Plan 02 использует `oauth-google` как UI method id, но в requirements (REQUIREMENTS.md:88) используется формулировка "публикуют Google". Оба корректны, но для единообразия предпочтительнее явно указать `oauth-google` в REQUIREMENTS.md. | REQUIREMENTS.md:88 |
| R-07-03 | **LOW** | Nyquist gate в 07-VALIDATION.md ссылается на `AuthControllerTest`, но в Evidence Registry не указан конкретный test method — только class name. Это приемлемо, но менее precise. | 07-VALIDATION.md:97-98 |

---

## Actionable Suggestions

1. **R-07-01 (MEDIUM)**: При реализации Task 1 в Plan 01 добавить конкретные assertions:
   ```java
   // pending account → PENDING_APPROVAL outcome
   assertThat(result.getOutcome()).isEqualTo(AuthenticationOutcome.PENDING_APPROVAL);
   
   // conflict linking → safe rejection without account binding
   assertThat(result.getOutcome()).isEqualTo(AuthenticationOutcome.IDENTITY_CONFLICT);
   assertThat(identityBindingService.findByEmail(any())).isEmpty();
   ```

2. **R-07-02 (LOW)**: Обновить REQUIREMENTS.md:88:
   - Текущее: "`/api/v1/auth/providers` и `/api/v1/auth/methods` публикуют Google..."
   - Предложенное: "...публикуют метод `oauth-google` (backend provider id: `google`)..."

3. **R-07-03 (LOW)**: В Gate Evidence Registry добавить более конкретный test filter:
   - Изменить `EVID-07-BACKEND` command с `AuthControllerTest` на `AuthControllerTest#testGoogleProviderCatalog`.

---

## Risk Assessment

**Overall Risk: LOW**

Обоснование:
- Все 4 ключевых concerns Round 1 закрыты с явными artifacts.
- Планы используют существующий extractor-based pipeline без bypass-веток — минимальный regression surface.
- Provider contract зафиксирован с runtime guard — исключает silent drift.
- Nyquist transition rule формализован с machine-checkable evidence — clear closure criteria.
- Requirements traceability расширена и верифицируема.

R-07-01 (MEDIUM) — единственный риск со значимостью, но он управляем через конкретизацию assertions в execution phase.
