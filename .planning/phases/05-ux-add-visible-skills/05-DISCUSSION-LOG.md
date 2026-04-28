# Phase 5: ux-add-visible-skills - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `05-CONTEXT.md`.

**Date:** 2026-04-16T09:00:00+03:00
**Phase:** 05-ux-add-visible-skills
**Areas discussed:** Точка входа Add Skill, Формат выбора skills, Правила отображения кандидатов

---

## Точка входа Add Skill

| Option | Description | Selected |
|--------|-------------|----------|
| `Add skill` рядом с `Skills` | Главный видимый вход на detail-странице | ✓ |
| Sticky/FAB `Add skill` | Постоянно видимая плавающая кнопка | |
| Secondary action only | Через overflow/menu, без явной primary-кнопки | |

**User's choice:** `Add skill` рядом с заголовком `Skills`.

| Option | Description | Selected |
|--------|-------------|----------|
| Унифицировать empty-state CTA | Пустая коллекция открывает тот же Add-flow | ✓ |
| Оставить переход в `/dashboard/skills` | Раздельный поток добавления | |
| Показать оба CTA | Add-flow + переход в skills | |

**User's choice:** унифицировать empty-state CTA с Add-flow.

| Option | Description | Selected |
|--------|-------------|----------|
| Owner + Contributor + Admin | Показывать действие всем ролям с правом добавления | ✓ |
| Только Owner + Admin | Contributor не видит add-действие | |
| Показывать всем с disabled | Виден всем, но может быть заблокирован | |

**User's choice:** показывать `Add skill` для owner/contributor/admin.

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state в add-flow | Ясная причина + следующий шаг | ✓ |
| Toast/error без flow | Только сообщение об ошибке на detail | |
| Скрывать кнопку заранее | Не показывать Add при отсутствии кандидатов | |

**User's choice:** empty state внутри add-flow.

---

## Формат выбора skills

| Option | Description | Selected |
|--------|-------------|----------|
| Inline modal | Открытие picker в модальном окне на detail | ✓ |
| Dedicated route | Отдельная страница добавления | |
| Reuse `/search` mode | Специальный selection-mode в Search | |

**User's choice:** inline modal.

| Option | Description | Selected |
|--------|-------------|----------|
| Full discovery controls | Search + filters + sort + pagination | ✓ |
| Search only | Только строка поиска + простой список | |
| No search | Ограниченный статический список | |

**User's choice:** полный discovery-набор как в SearchPage.

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-select + `Add selected (N)` | Массовое добавление за один submit | ✓ |
| Single-add + close | Добавить один skill и закрыть | |
| Single-add + keep open | Добавить один, оставить picker открытым | |

**User's choice:** multi-select + `Add selected (N)`.

---

## Правила отображения кандидатов

| Option | Description | Selected |
|--------|-------------|----------|
| Только addable skills | Показывать только навыки, доступные к добавлению сейчас | ✓ |
| Все visible + disabled | Показ всех видимых с disabled-гейтингом | |
| Только My Skills | Ограничить источник личными навыками | |

**User's choice:** показывать только addable skills.

| Option | Description | Selected |
|--------|-------------|----------|
| Скрывать already-added | Не показывать уже добавленные | |
| Disabled + badge | Показать, но disabled с меткой `Already in collection` | ✓ |
| Показать как обычные | Разрешить выбрать и полагаться на серверный reject | |

**User's choice:** disabled + badge `Already in collection`.

| Option | Description | Selected |
|--------|-------------|----------|
| Rich compact card | `displayName + namespace + summary + status/visibility` | ✓ |
| Minimal card | Только `displayName + namespace` | |
| Rich metrics card | Плюс `downloadCount/stars` | |

**User's choice:** rich compact card; `summary` должно быть ограничено по длине.

---

## the agent's Discretion

- Точный лимит/truncation policy для `summary`.
- Визуальный стиль disabled-плашки и вспомогательных подсказок.
- Конкретная организация action-footer в modal.

## Deferred Ideas

None.
