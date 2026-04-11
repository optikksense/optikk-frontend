# LLM hub — parity roadmap

## Phase 1 (shipped)

- `/llm/*` hub shell, Overview, Generations, Traces (trace IDs from current page).
- `POST /v1/ai/explorer/query` for generations + facets + trend.
- Legacy `/ai` → `/llm/overview`.

## Phase 2 (shipped — sessions)

- `POST /v1/ai/explorer/sessions/query` — aggregates spans by session key (`gen_ai.session.id` → `gen_ai.conversation.id` → `session.id`).
- Sessions tab: table, filters, pagination, link to Generations with `?session=`.
- Generations: `session` URL param + query filter; facet for **Prompt template** (`gen_ai.prompt.template.name`).

## Phase 3 (shipped — scores)

- **Backend:** `llm_scores` table; `POST /v1/ai/llm/scores`, `POST /v1/ai/llm/scores/batch`, `GET /v1/ai/llm/scores` (time range + optional name/trace filters, pagination).
- **UI:** Scores tab — list in range, filters, record score (trace id required; optional span id, source).

## Phase 4 (shipped — prompts registry + telemetry)

- **Backend:** `llm_prompts` — `GET/POST /v1/ai/llm/prompts`, `PATCH/DELETE /v1/ai/llm/prompts/:id`.
- **UI:** Prompts tab — registry CRUD plus existing telemetry facet list with deep link to Generations.

## Phase 5 (shipped — datasets)

- **Backend:** `llm_datasets` — `POST /v1/ai/llm/datasets`, `GET /v1/ai/llm/datasets`, `GET /v1/ai/llm/datasets/:id` (JSON payload).
- **UI:** Datasets tab — list + download JSON; Generations **Save as dataset** (current page rows without `estimated_cost`, query snapshot, time bounds).

## Phase 6 (shipped — settings)

- **Backend:** `teams.pricing_overrides_json` — `GET/PATCH /v1/ai/llm/settings` (same JSON shape: `pricing_overrides` in API body maps to that column).
- **UI:** Settings tab loads server overrides, merges with legacy browser overrides for display, saves to API and mirrors to `localStorage`. Explorer cost estimates prefer server overrides when present (`useLlmExplorer` + `LlmCostContext`).

## Trace lens (shipped — v1)

- **Traces** tab under LLM hub: unique trace IDs from the **current Generations page** (same query + time range); links to trace detail and to main Traces explorer filtered by trace or by `@gen_ai.system:*`.
- **Generations:** row **Open** opens trace detail without opening the drawer; drawer still has **View full trace** and **Related logs**.

## Ops

- Apply new MySQL DDL from `optikk-backend/db/mysql.sql` (or equivalent migration) before hub APIs work in each environment. Add `teams.pricing_overrides_json` and migrate from `llm_team_settings` if upgrading (see comments in `mysql.sql`).
