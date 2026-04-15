---
description: Architecture and setup for Live Tail real-time streaming
---

# Live Tail Architecture

The Live Tail feature streams logs and traces over a **native WebSocket** to **`GET /api/v1/ws/live`** (authenticated with the same session cookies as `/api`).

## Protocol (JSON)

**Client → server (first message):**

```json
{ "op": "subscribe:logs" | "subscribe:spans", "payload": { ... } }
```

`payload` includes **`teamId`** and filters; it matches the previous `SubscribeLogsPayload` / `SubscribeSpansPayload` shapes on the backend.

**Server → client (repeated):**

```json
{ "event": "log" | "span" | "heartbeat" | "subscribeError" | "done", "data": { ... } }
```

Event names match the former Socket.IO emit names for minimal UI churn.

## Frontend

- **`useSocketStream`** (`@shared/hooks/useSocketStream.ts`): Opens the WebSocket, sends the subscribe message, and maps `event` + `data` into the same hook result shape as before.
- **`useLiveTailStream`**: Passes `subscribe:logs` / `subscribe:spans` and `teamId` in `params`.

## Backend

- **`internal/modules/livetail/handler.go`**: Upgrades the connection, validates the user may access `payload.teamId`, then runs **`search.RunLogsLiveTail`** or **`livetail.RunSpansLiveTail`** (see `internal/modules/logs/search/livetail_run.go`, `internal/modules/traces/livetail/livetail_run.go`).

## Dev proxy

Vite proxies **`/api`** with **`ws: true`** so `/api/v1/ws/live` reaches the backend during `yarn dev`.

## Troubleshooting

- **401 on upgrade**: Session missing or expired; ensure cookies are sent (same-site / HTTPS).
- **subscribeError forbidden team**: `teamId` is not in the user’s allowed teams.
- **No rows**: Filters may exclude traffic; confirm polling windows and ClickHouse data.
