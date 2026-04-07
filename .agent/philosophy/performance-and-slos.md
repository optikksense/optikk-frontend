# Performance & SLOs: Frontend

## SLOs (Service Level Objectives)

| Feature | Metric | Target (P95) |
|---------|--------|-------------|
| Traces Explorer | Load to Interactive | < 500ms |
| Logs Live Tail | Latency (Server to UI) | < 1s |
| Metrics Dashboards | Total Panel Render Time | < 800ms |

## Agent Performance Rules

### 1. High-Speed Data Delivery
- **Decision**: Always favor `placeholderData: keepPreviousData` on TanStack Query to prevent loading flashes.
- **Rule**: Use `refreshKey` for periodic background updates for accurate, real-time data without UI flicker.

### 2. Optimized Re-Renders
- **Rule**: Atomic Zustand Selectors are mandatory. Do not select entire store objects.
- **Rule**: Use `React.memo` or `useMemo` for expensive dashboard panel renderers (DbSystems, QueueMetrics).

### 3. High Information Density
- **Principle**: Optimize table and grid layouts for horizontal and vertical density (Datadog style).
- **Rule**: Prefer virtualized lists (`react-virtuoso`, `TanStack Virtual`) for any data display exceeding 100 rows.
