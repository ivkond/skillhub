# Phase 07 Peer Review (kilocode)

## Summary
Артефакты фазы 07 демонстрируют аккуратное встраивание Google OAuth в существующий OAuth2 pipeline через новый extractor без изменений control flow и SecurityConfig, с продуманной верификацией: failing-first тесты, целевые quick-команды, угрозмодель под open redirect и claims mapping, а также опора на backend-driven UI. Основные риски — неполная формализация требований OAUTH-* вне общего реестра, возможное расхождение идентификаторов провайдера между backend и web, пробелы в тестах по семантике account linking, и предпосылки о наличии e2e-инфраструктуры.

## Strengths
- Четкая граница фазы и инварианты безопасности (reuse sanitize/consume, единая точка policy gates) [.planning/phases/07-google-oauth/07-CONTEXT.md:21–25].
- Архитектурное согласование с текущим extensibility контрактом (`OAuthClaimsExtractor` + map lookup by `registrationId`) [.planning/phases/07-google-oauth/07-RESEARCH.md:20–25].
- Планирование TDD: сначала failing tests, затем реализация extractor и регрессии по returnTo [.planning/phases/07-google-oauth/07-01-PLAN.md:69–98; 100–128; 130–157].
- Реалистичные verification-команды и sampling policy; покрытие backend/web и docs build [.planning/phases/07-google-oauth/07-VALIDATION.md:20–25; 30–34].
- Угрожаемые векторы и митигирующие шаги формализованы, включая open redirect и неправильный claims mapping [.planning/phases/07-google-oauth/07-RESEARCH.md:71–77].
- UI остается data-driven, redirect только через `provider.actionUrl` без hardcode путей [.planning/phases/07-google-oauth/07-02-PLAN.md:63–66; 110–121].

## Concerns
- [MEDIUM] Трассировка требований: идентификаторы OAUTH-01..OAUTH-06 и SEC-01..03 зафиксированы в контексте, но отсутствуют в глобальном `.planning/REQUIREMENTS.md`, что создает gap в общей трассируемости UAT/DoD [.planning/phases/07-google-oauth/07-CONTEXT.md:16–33; .planning/REQUIREMENTS.md].
- [MEDIUM] Несогласованность идентификаторов провайдера между backend и web: в контексте — `google` (registrationId), в веб-тестах/логике — `oauth-google` как `provider.id`; риск расхождения контракта API и условной логики UI [.planning/phases/07-google-oauth/07-CONTEXT.md:17,27; .planning/phases/07-google-oauth/07-02-PLAN.md:29–33,84–92,111–121].
- [HIGH] Недостаточное покрытие сценариев account linking: нет явных тестов на конфликт email (например, verified email уже привязан к другому subject/provider) и на запрет auto-link без строгих условий; возможны ошибки привязки аккаунтов/перехват сессии [.planning/phases/07-google-oauth/07-01-PLAN.md:53–66,82–88].
- [MEDIUM] Предположение о наличии e2e-инфраструктуры (`web/e2e/auth-entry.spec.ts`, `pnpm run test:e2e`) без подтверждения ее существования в репозитории; риск нереализуемого verify шага [.planning/phases/07-google-oauth/07-03-PLAN.md:14–15,94–97].
- [MEDIUM] Privacy/logging: предлагается сохранять полный `attrs` map в `OAuthClaims`; не оговорены правила редактирования логов и исключения секретов/PII в логировании и persistence [.planning/phases/07-google-oauth/07-01-PLAN.md:111–117].
- [LOW] Хрупкость проверок `returnTo`: сравнение целиком сформированного authorization URL может зависеть от порядка query-параметров Spring; тесты стоит делать order-insensitive [.planning/phases/07-google-oauth/07-01-PLAN.md:145–152; .planning/phases/07-google-oauth/07-03-PLAN.md:84–93].
- [LOW] Документация маппит внутренние env-ключи (`oauth2-google-client-id`, `oauth2-google-client-secret`) к Spring properties; требуется подтвердить фактическую wiring-схему в `application.yml`/ops, иначе возникнет дрейф документации [.planning/phases/07-google-oauth/07-03-PLAN.md:114–124].
- [LOW] Нет негативного UI-теста на отсутствие Google-входа при отсутствии backend-конфигурации; можно упустить регрессию, когда фронт «рекламирует» провайдера без server support [.planning/phases/07-google-oauth/07-02-PLAN.md:83–93].

## Suggestions
- Добавить раздел OAuth-требований в `.planning/REQUIREMENTS.md` или завести `.planning/REQUIREMENTS-AUTH.md` и связать OAUTH-01..06, SEC-01..03 с Phase 7 в таблице traceability.
- Унифицировать идентификаторы: оставить `registrationId = google` на backend и в UI не полагаться на `oauth-google` как id. Если требуется ветвление визуала — привязать к `provider.registrationId === "google"` или к `provider.kind === "OAUTH" && provider.vendor === "google"`.
- Расширить тесты `OAuthLoginFlowServiceTest`:
  1) verified email совпадает с существующим пользователем другого провайдера — поведение link/deny определено и проверено;
  2) unverified email — запрет auto-link;
  3) отсутствует `sub` — бросается ожидаемый `OAuth2AuthenticationException` с согласованным error code, совместимым с текущим handler.
- Валидировать предпосылки e2e: если `playwright`/`test:e2e` отсутствуют, конвертировать smoke в интеграционные web-тесты (Vitest + jsdom) или добавить минимальную e2e-инфраструктуру в отдельной подфазе.
- Зафиксировать privacy-инварианты: запрет логгирования полного `attrs` в INFO/WARN; маскирование email/идентификаторов в логах; отсутствие сохранения access_token/id_token в базе/журналах.
- Сделать проверки `returnTo` устойчивыми: парсить query-строку и валидировать наличие/значение `returnTo` c URL-encoding, без зависимости от порядка параметров.
- В документации явно сопоставить окруженческие переменные с `spring.security.oauth2.client.registration.google.*`, добавить пример `application.yaml` и `.env`.
- Добавить негативный UI-тест: при пустой конфигурации Google провайдер не отображается на вкладке OAuth.

## Risk Assessment
`MEDIUM` — архитектурно план консервативен и согласован с текущим OAuth pipeline, TDD и verification продуманы. Ключевой риск связан с account linking и потенциальной рассинхронизацией идентификаторов провайдера между слоями; вторичные риски — предположения о наличии e2e-инфраструктуры и privacy/logging детали.

## Run Diagnostics
- Mode: non-interactive (`kilocode run --auto`)
- Model: `kilo/openai/gpt-5`
- Prompt source: `.planning/tmp/07-cross-ai-review-prompt.md`
- Execution note: первоначальный запуск падал на default model (`openai-compatible/moonshotai/Kimi-K2.5` not found); перезапуск с явной моделью завершился успешно.
