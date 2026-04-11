# Telemetry contracts (Optik)

Cross-repo conventions for URLs, correlation fields, and planned alert shapes. Backend and frontend should stay aligned with this document.

## Log explorer URL state

The log hub (`/logs`) syncs structured chips to the **`filters`** query parameter:

- **Encoding:** semicolon-separated segments, each `field:operator:urlEncodedValue`.
- **Example:** `trace_id:equals:abc123` → `filters=trace_id%3Aequals%3Aabc123` (full string uses `encodeURIComponent` per value segment).
- **Time range:** `from` and `to` are Unix timestamps in **milliseconds**, consistent with `useTimeRangeURL`.

Deep links from traces, infrastructure, and other surfaces must use **`filters`** (not legacy `query=trace_id:...`) so the hub parses chips correctly.

**Implementation:** `encodeStructuredFiltersParam` / `decodeStructuredFiltersParam` in `src/shared/hooks/useURLFilters.ts`, and `buildLogsHubHref` in `src/shared/observability/deepLinks.ts`.

## Shareable views (URL vs JSON)

Long explorer URLs (many `filters` chips) can exceed practical limits. **Logs** and **Infrastructure** headers offer:

- **Copy link** — copies the current URL when under ~2000 characters; otherwise copies a **JSON snapshot** (`shareableView.ts`) that includes `path`, `query`, and the persisted **global time range** so a colleague can restore context manually.
- **Export JSON** — always copies that snapshot (for tickets or runbooks).

## Trace ↔ log correlation

- **Field:** `trace_id` on log records and span rows.
- **Log filter:** structured field `trace_id`, operator `equals`, value = hex trace id.
- **Trace detail route:** `/traces/$traceId` (`ROUTES.traceDetail`).

## RUM as logs (v1)

RUM events are ingested as **OTLP logs** (no separate RUM table). Recommended attributes (in addition to standard `service.name`, `severity`, body):

| Attribute        | Purpose                          |
|-----------------|----------------------------------|
| `optik.rum`     | Marker: `"true"` or `"1"` for UI presets |
| `event.name`    | RUM event name                   |
| `error.type`    | Optional JS error classification |

The logs hub includes a **RUM stream** quick action (filter `optik.rum` equals `true`) and a structured field for the same attribute.

## CI / deployment markers

CI and deployment signals should use OTLP logs or spans with stable attributes so the UI can link builds to logs without new tables:

- Suggested: `optik.ci.pipeline`, `optik.ci.run_id`, `optik.deployment.id`, `git.commit.sha`.
- Surfaces (e.g. service/deploy views) link to `/logs` with structured filters on these keys when present. The deployment compare drawer reminds operators to use these attributes when pipelines emit them.

## Synthetic checks: `http_check` alert rule

**Condition type:** `http_check`. **TargetRef JSON** (stored in the existing rule row):

| Field | Type | Notes |
|-------|------|--------|
| `url` | string | Required. `http` or `https`. |
| `method` | string | Optional. `GET` or `HEAD` (default `GET`). |
| `expect_status` | number | Optional. Default `200`. |
| `timeout_ms` | number | Optional. Default `10000`, max `60000`. |
| `follow_redirects` | bool | Optional. Default `false`. Each redirect target is re-checked for SSRF. |
| `expect_body_substring` | string | Optional. When set, response body must contain this substring (first 2 MiB only). |

**Evaluation:** Produces window `short` with value `0` on success and `1` on failure. Use operator **`gt`** with **critical threshold `0.5`** (defaults are set in the rule builder when switching to HTTP check). **NoData** when the URL is invalid, DNS fails, or the host resolves to blocked addresses.

**Safety:** Hostnames are resolved and **private, loopback, link-local, and metadata-style IPv4** destinations are blocked. No request `headers` or `body` in v1 (GET/HEAD only).

**Backend:** `optikk-backend` `internal/modules/alerting/evaluators/http_check.go`.

## Related code

- Frontend deep links: `src/shared/observability/deepLinks.ts`
- Shareable snapshots: `src/shared/observability/shareableView.ts`
- Log URL filter config: `src/features/log/utils/logUtils.ts` (`LOGS_URL_FILTER_CONFIG`, `LOGS_STRUCTURED_FILTER_FIELDS`)
- Infrastructure fleet pods API: `GET /v1/infrastructure/fleet/pods` (span-derived, root spans)
- HTTP check evaluator: `optikk-backend/internal/modules/alerting/evaluators/http_check.go`
