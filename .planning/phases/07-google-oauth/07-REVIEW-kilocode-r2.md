
> code · openai/gpt-5

Начинаю ревью: сначала прочитаю все указанные файлы артефактов фазы 07 и глобальные требования, затем сопоставлю с замечаниями из 07-REVIEWS.md для проверки закрытия и выявления остаточных рисков.
✱ Glob ".planning/phases/07-google-oauth/*" 13 matches
→ Read .planning\phases\07-google-oauth\07-CONTEXT.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-VALIDATION.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-RESEARCH.md [offset=1, limit=2000]
Начинаю повторную проверку: считываю артефакты фазы 07 и общий реестр требований для анализа закрытия замечаний и остаточных рисков.
→ Read .planning\REQUIREMENTS.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-02-PLAN.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-01-PLAN.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-REVIEWS.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-03-PLAN.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-REVIEW-opencode-r2.md [offset=1, limit=2000]
→ Read .planning\phases\07-google-oauth\07-REVIEW-kilocode-r2.md [offset=1, limit=2000]
✱ Glob "document/**" 100 matches
→ Read document\package.json [offset=1, limit=400]
Summary
Провёл повторное ревью артефактов Фазы 07 после remediation. Все четыре re-check targets закрыты на уровне планов/валидации и глобальной трассировки: edge-cases привязки аккаунтов формализованы в тестах (Plan 01), консистентность контракта `google` ↔ `oauth-google` закреплена тестами и runtime-guard’ом (Plan 02), Nyquist transition rule оформлен с machine-checkable evidence (VALIDATION), OAUTH/SEC добавлены в глобальный реестр требований и трассировку (REQUIREMENTS). Остаточные риски низкие и сводятся к уточняющим деталям исполнения тестов и единообразию формулировок.

Resolved Since Round 1
- Account-linking / identity safety edge-cases: Plan 01 фиксирует сценарии pending → PENDING_APPROVAL, disabled → ACCESS_DENIED, conflict linking → безопасный отказ, email_verified=false → отсутствие verified-статуса; плюс privacy/logging guardrail (не логировать full OAuth attrs на info/warn) — 07-01-PLAN.md:56–72, 76–111, 142–171.
- Provider contract consistency: Жёсткий контракт `google` (backend registrationId) ↔ `oauth-google` (UI method id) ↔ `/oauth2/authorization/google`, anti-drift тесты и runtime guard — 07-02-PLAN.md:57–78, 82–112, 114–141.
- Validation closure gate: Nyquist transition rule с required evidence (backend/web/docs), Evidence Registry и правилами flip’а — 07-VALIDATION.md:64–106, 96–101, 110–119.
- Requirements traceability (OAUTH/SEC): Глобальный реестр пополнен секциями OAUTH-01..06 и SEC-01..03 и таблицей трассировки для Phase 7 — .planning/REQUIREMENTS.md:80–96, 141–149. Консолидация отражена и в 07-REVIEWS.md → Remediation Applied — 07-REVIEWS.md:82–90.

Remaining Concerns
- MEDIUM — Уточнить ожидаемые assert-значения для регрессионных кейсов в Plan 01, чтобы исключить двусмысленность в execution (outcome enums, эффекты bind/refuse) — 07-01-PLAN.md:94–105.
- LOW — Единообразие формулировок в глобальном требовании: OAUTH-05 говорит “публикуют Google”, лучше зафиксировать “метод `oauth-google` (backend id `google`)” — .planning/REQUIREMENTS.md:88.
- LOW — Evidence команду в Gate Registry сделать более precise (фильтр по test method), чтобы уменьшить флейк от нерелевантных тестов — 07-VALIDATION.md:96–101.

Actionable Suggestions
- Для Plan 01 Acceptance Criteria добавить точные утверждения:
  - pending: result.outcome == PENDING_APPROVAL; disabled: result.outcome == ACCESS_DENIED.
  - conflict linking: result.outcome == IDENTITY_CONFLICT; отсутствие привязки к другому subject (проверка через IdentityBindingService/репозиторий).
  - email_verified=false: claims.emailVerified == false, bind не повышает доверие к email.
- В .planning/REQUIREMENTS.md:88 уточнить формулировку: “`/api/v1/auth/providers` и `/api/v1/auth/methods` публикуют метод `oauth-google` (backend provider id: `google`)…”.
- В 07-VALIDATION.md Gate Evidence Registry сузить команды:
  - EVID-07-BACKEND: добавить фильтр, напр. `-Dtest=AuthControllerTest#testGoogleProviderCatalog`.
  - EVID-07-WEB: оставить как есть, но явно перечислить тест-файлы, уже сделано.
- В Plan 02 сохранить guard без утечек PII: убедиться, что `console.error` логирует только код `oauth_google_contract_drift` и обезличенный provider id (это implied, но стоит кратко отметить при реализации).

Risk Assessment
LOW. Причины: все 4 ключевых замечания Round 1 закрыты в артефактах; контракт провайдера закреплён тестами и runtime-guard’ом; Nyquist gate формализован с проверяемыми доказательствами; глобальная трассировка требований обновлена. Оставшиеся риски локальны к деталям тестовых assert-ов и унификации формулировок и не увеличивают поверхность регрессий.

