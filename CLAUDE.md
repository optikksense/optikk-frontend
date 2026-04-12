# Optik Frontend — Claude Code Instructions

## Before any task

1. Read **`CODEBASE_INDEX.md`** (repo root) — full map of domains, routes, shared layers, LLD patterns, hooks reference, type system, and cross-repo references.
2. Read **`.cursor/rules/optik-frontend.mdc`** — hot paths, feature module pattern, dashboard panel registration, query patterns, state management, ESLint rules, theming.
3. Read **`.cursor/rules/engineering-workflow.mdc`** — plan before code, two approaches with pros/cons, approval gate.
4. **Do not modify files** until the user approves the plan (except trivial one-line fixes).

## After every iteration

After completing any task — no matter how small — review and update the following if anything changed:

1. **`CODEBASE_INDEX.md`** — new features, routes, hooks, types, dashboard panels, cross-repo contracts
2. **`.cursor/rules/optik-frontend.mdc`** — new patterns, conventions, hot paths, or LLD details
3. **`.agent/SKILL.md`** — keep aligned with cursor rules
4. **This file (`CLAUDE.md`)** — new quick-reference paths or principles

This is **mandatory**, not optional. The documentation must always reflect the current architecture so the next session (by any AI tool) does not need to scan the full codebase. If nothing changed, skip — but always check.

## Quick reference

- **Stack**: React 19, Vite 8, TypeScript, TanStack Query v5, TanStack Router, Zustand 5, Tailwind 3.4, uPlot 1.6, Zod
- **Entry**: `src/main.tsx` → `src/app/App.tsx` → `src/app/routes/router.tsx`
- **Feature registry**: `src/app/registry/domainRegistry.ts` — 8 domains: overview, saturation, metrics, logs, traces, infrastructure, alerts, settings
- **Route constants**: `src/shared/constants/routes.ts`
- **HTTP client**: `src/shared/api/api/client.ts`
- **Overview hub**: `src/features/overview/pages/OverviewHubPage/OverviewHubPage.tsx` — bespoke `/overview` tabs; APIs via `src/features/overview/api/overviewHubApi.ts` + `metricsOverviewApi`
- **Dashboard primitives**: `src/shared/components/ui/dashboard/` — `ConfigurableDashboard.tsx`, `ConfigurableChartCard.tsx`, `DashboardEntityDrawer.tsx`
- **Panel registry**: `src/shared/components/ui/dashboard/dashboardPanelRegistry.tsx` — 12 built-in + 10 domain panels
- **Built-in panels**: `builtInDashboardPanels.tsx` — request, error-rate, latency, exception-type-line (base-chart); table, bar, gauge, heatmap, pie, stat-cards-grid (specialized); stat-card, stat-summary (self-contained)
- **Charts**: `src/shared/components/ui/charts/` — UPlotChart (use `setData()` for flicker-free refresh), ObservabilityChart, time-series/, distributions/, micro/, specialized/
- **Global store**: `src/app/store/appStore.ts` — `triggerRefresh()` increments `refreshKey`; persisted: timeRange, teamId, theme, timezone, comparisonMode, viewPreferences, recentPages
- **Live tail**: `src/shared/hooks/useSocketStream.ts` (core WebSocket), `src/features/explorer-core/hooks/useLiveTailStream.ts` (wrapper with teamId)
- **Explorer core**: `src/features/explorer-core/` — shared analytics, facets, visualizations for Logs/Traces/Metrics explorers
- **Entities**: `src/shared/entities/` — log, metric, trace, user
- **Theme**: `src/config/themeColors.css` → `tailwind.config.ts`
- **Dev**: `npm run dev` | **CI**: `npm run ci`
- **Navigation utils**: `src/shared/utils/navigation.ts` — `dynamicNavigateOptions(to, search?)` and `dynamicTo(path)` for TanStack Router dynamic-path navigation (replaces scattered `as any` casts)
- **Standard query**: `src/shared/hooks/useStandardQuery.ts` — `useStandardQuery(options)` with `keepPreviousData`, `staleTime: 5s`, `retry: 2`
- **Sibling repo**: `optikk-backend` (see its `CODEBASE_INDEX.md`)

## Domain → dashboard page mapping

| Dashboard page ID | Feature | Hub page component |
|-------------------|---------|-------------------|
| overview | overview | OverviewHubPage |
| service | overview | ServiceHubPage |
| saturation | overview → metrics | SaturationHubPage |
| infrastructure | infrastructure | InfrastructureHubPage — full frontend-owned infra UI + Datadog-style fleet controls + new panels; see `CODEBASE_INDEX.md` § Infrastructure product direction |

## Key patterns

- **Dashboard queries**: stable keys (no `refreshKey`), use `useInvalidateQueriesOnAppRefresh`
- **Explorer queries**: include `refreshKey` in `queryKey`
- **Always**: `placeholderData: keepPreviousData`; loading = `isPending && data === undefined`
- **No cross-feature imports** — ESLint enforced; move shared code to `@shared/`
- **No TS enums** — use `as const` + union types
- **No `as any`** — use `dynamicNavigateOptions` / `dynamicTo` for router casts, `Record<string, unknown>` for data, `unknown as { keys: ... }` for Zod internals
- **API naming**: GET operations use `get*` prefix (not `fetch*`); `fetch*` is reserved for the Fetch API itself
- **Prefer `useStandardQuery`** over raw `useQuery` for consistent defaults
- **Drawer entities**: databaseSystem, deployment, errorGroup, kafkaGroup, kafkaTopic, node, redisInstance, service

## Engineering principles

- **SOLID & DRY**: Factor shared behavior when a pattern appears more than once.
- **Quality**: Leave the code clearer or simpler with every change.
- **No unsolicited tests**: Do not add tests unless explicitly asked.
