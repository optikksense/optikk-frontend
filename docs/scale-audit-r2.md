# Datadog-Scale Audit — Round 2

Re-audit after the marketing rewrite, orphan purge, and dep cleanup
landed. Targets the real blockers for Datadog-scale traffic
(10k+ rows, 100+ series, 8-hour sessions, 50-event/s streams,
30-panel dashboards).

## What this PR fixes

| # | File                                                                       | Problem                                                                                                                     | Fix                                                                 |
| - | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1 | `src/features/traces/hooks/useTracesExplorer.ts`                           | `Math.max(...traces.map(t => t.duration_ms))` — spreads 10k+ items into function args; risks engine arg-length limits.      | Single-pass `for` reducer.                                          |
| 2 | `src/shared/hooks/useSocketStream.ts`                                      | Malformed frames silently dropped; operators can't see the stream is sick.                                                  | Increment `droppedCount` on parse failure (already surfaced in UI). |
| 3 | `src/features/log/hooks/useLogsHubData.ts`, `TracesPage/constants.ts`      | Live-tail ring buffer = **20** rows — overflows in 0.4 s at 50 events/s. Virtualisation already handles render cost.        | Raise to **250** with inline comment explaining the budget.         |
| 4 | `src/features/explorer-core/components/ExplorerResultsTable.tsx`           | `onPageChange` / `onPageSizeChange` inline closures + inline pagination object churn reference identity every render.       | Stabilise via `useCallback` + `useMemo`.                            |
| 5 | `src/features/explorer-core/components/ExplorerResultsTable.tsx`           | A single bad row / render throw collapses the whole page — no feature-local boundary.                                       | Wrap the table body in `FeatureErrorBoundary`.                      |

## What this PR explicitly does **not** touch (verified clean)

- `refetchOnMount: true` — this is **correct**. It respects
  `staleTime: 5_000`, so a remount under 5 s reuses cache. We
  removed the old `"always"` in round 1.
- `useAutoRefresh` timer handling — already visibility-gated with
  proper start/stop guards in round 1.
- `useSocketStream` single-pass ordered insert — already O(n)
  capped; no further gain without changing the data structure.
- `paramsKey` JSON.stringify in `useSocketStream` — `useMemo`-guarded
  on `params` identity. Callers pass inline objects so it recomputes
  per render, but the produced string is stable, so the effect
  correctly does not re-run. CPU cost is negligible for the payload
  sizes in use.
- Query cache "body in queryKey" — React Query deep-hashes keys;
  `gcTime: 300_000` cleans stale entries. No unbounded growth.

## Known remaining risks (not in scope for this PR)

- **`UPlotChart` shape-compatibility check** is O(series × length)
  per refresh. Below 50 series it's irrelevant; above 100 it will
  dominate. Already capped at 100 in `MetricsExplorerChart`; if we
  let more through, revisit.
- **Dashboard `useComponentDataFetcher` waterfalls** — individual
  panel queries issue in parallel via `useQueries`, but their
  dedup key is a JSON string of the full params object. Different
  key orderings from two panels would miss dedup. Low likelihood
  in practice (panels are built from the same config), but worth
  revisiting if dashboards start generating params dynamically.
- **`SimpleTable` virtualisation on paginated mode** — still only
  live-tail mode auto-virtualises. Paginated pages at pageSize ≥
  500 remain un-virtualised; this is a separate design-scope item
  tracked in `docs/perf-scale-followups.md`.
- **Profiler-driven `.map` hoisting** — still waiting on real
  profiler data from a preview deploy; tracked in the same doc.

## Validation

- `yarn type-check` — no new errors (CI gate).
- `yarn ci:marketing-assets` — still SVG-only.
- `yarn build` — no new budget violations.
- Smoke test in preview: live tail on Logs + Traces for 60 s at
  peak, confirm:
  - Ring buffer now holds ~250 rows (was 20).
  - Pagination on Traces + Logs doesn't jitter the explorer table.
  - Any malformed WS frame now increments the "N dropped" badge in
    the explorer chrome.
  - A deliberately thrown render error in an explorer row surfaces
    the feature-local error card instead of nuking the page.
