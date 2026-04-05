# Optik frontend — codebase index

Orientation for **optic-frontend** (React/Vite/TypeScript). Read this file and `.cursor/rules/optik-frontend.mdc` before substantive work in this repository.

## How assistants should use this document

- **Before** any substantive task: read **`CODEBASE_INDEX.md`** (this file) and **`.cursor/rules/optik-frontend.mdc`**. Follow **`.cursor/rules/engineering-workflow.mdc`** for planning and quality bar.
- **Plan before code:** Produce a plan (with options where appropriate) and **do not change code until the user approves** the plan, except for trivial one-line/typo fixes.
- **After** navigation or architecture changes (new domains, routes, registry entries, dashboard contracts): **update this file** and **`.cursor/rules/optik-frontend.mdc`** in the same change when something durable changed.

## Related repository

The HTTP API and dashboard JSON live in the sibling repo **`optikk-backend`** (see that repo’s `CODEBASE_INDEX.md`). This frontend implements explorers, dashboard runtime, and the panel registry against those APIs.

**Hybrid model:** backend-authored dashboards (JSON + default config), frontend-owned explorer routes and feature modules, shared dashboard panel registry and API decode boundary.

---

## Stack and commands

- **Stack:** React 18, Vite 5, TypeScript, TanStack Query, React Router 6, Zod, Tailwind.
- **Dev:** `npm run dev` (see `package.json`).
- **Quality:** `npm run ci` (type-check, lint, build, bundle budgets).

## Entry and app shell

| File | Purpose |
|------|---------|
| `src/main.tsx` | App bootstrap |
| `src/app/App.tsx` | Root router and providers |
| `src/app/routes/appRoutes.tsx` | Route table (includes `/service` → `ServiceHubPage`; legacy `/logs/patterns` and `/logs/transactions` redirect to `ROUTES.logs`) |
| `src/app/routes/BackendDrivenPage.tsx` | Backend-driven dashboard pages |
| `src/app/layout/MainLayout.tsx` | Shell layout |

**Service dashboard:** `ROUTES.service` → `src/features/overview/pages/ServiceHubPage` — passes `serviceName` from the query string (`?serviceName=`) into `DashboardPage` as `pathParams` for panel `params` interpolation (`{serviceName}`).

## Path aliases (Vite)

Defined in `vite.config.ts`. Common imports:

- `@/` → `src/`
- `@features/` → `src/features/`
- `@shared/` → `src/shared/`
- `@app/` → `src/app/`
- `@config/` → `src/config/`
- `@components`, `@hooks`, `@services` → shared components, hooks, API layer under `src/shared/`

## Domain registry (feature ownership)

All product domains are registered in **`src/app/registry/domainRegistry.ts`**. Order and exports:

- `overview`, `metrics`, `log`, `traces`, `services`, `infrastructure`, `ai`, `settings`

Each feature’s `index.ts` exports a **domain config**: navigation, explorer `routes`, optional `dashboardPages` and `dashboardPanels`.

## Feature folders (`src/features/<domain>/`)

| Subfolder | Typical contents |
|-----------|-------------------|
| `pages/` | Explorer or detail pages |
| `dashboard/` | Panel renderers for that domain (backend-driven UI) |
| `components/`, `hooks/`, `store/` | Domain UI and state |
| `api/` or `services/` | Domain API wrappers (often calling `@shared/api`) |

### Explorer Core (`src/features/explorer-core/`)

Shared infrastructure for all data explorers (Logs, Traces, Metrics):
- **Components**: `AnalyticsToolbar.tsx`, `FacetRail.tsx`, ` ExplorerResultsTable.tsx`.
- **Hooks**: `useExplorerAnalytics.ts`, `useLiveTailStream.ts` (native WebSocket `/api/v1/ws/live`).
- **Visualizations**: Domain-specific chart renderers under `visualizations/`.

## Shared Layer (`src/shared/`)

| Area | Path | Notes |
|------|------|--------|
| HTTP client | `shared/api/api/client.ts` | Axios client |
| Response decode | `shared/api/utils/decode.ts` | Zod validation boundary |
| Default config | `shared/api/defaultConfigService.ts` | Fetches backend dashboard definitions |
| Dashboard UI | `shared/components/ui/dashboard/` | `ConfigurableDashboard.tsx`, `dashboardPanelRegistry.tsx` |
| Auth | `shared/api/auth/` | |

### Charting Engine (`src/shared/components/ui/charts/`)

- **`UPlotChart.tsx`**: Primary time-series renderer. **Mandatory Pattern**: use `setData()` for flicker-free auto-refresh updates. Pass **`options` from `useMemo`** (or use **`ObservabilityChart`**, which memoizes options) so parent re-renders do not rebuild uPlot on every tick.
- **`ObservabilityChart.tsx`**: High-level wrapper with legend and tooltip logic (memoized `options`).
- **Types**: `src/shared/types/chart.ts`.

## Global State & Auto-Refresh

- **`src/app/store/appStore.ts`**: Unified store for `timeRange`, `refreshKey`, and `globalFilter`.
- **`src/shared/hooks/useAutoRefresh.ts`**: Ticks the `refreshKey` at configured intervals.
- **`src/shared/hooks/useInvalidateQueriesOnAppRefresh.ts`**: Triggers TanStack Query invalidation when the global refresh is clicked.

## Feature Module Anatomy (LLD)

Each feature in `src/features/<domain>/` exports a `DomainConfig` from `index.ts`:

```tsx
import { lazy } from 'react';
import type { DomainConfig } from '@/app/registry/domainRegistry';

const MyPage = lazy(() => import('./pages/MyPage').then(m => ({ default: m.default })));
const MyRenderer = lazy(() => import('./dashboard/renderers/MyRenderer').then(m => ({ default: m.MyRenderer })));

export const myConfig: DomainConfig = {
  key: 'my-domain',
  label: 'My Domain',
  permissions: ['my-domain:read'],
  navigation: [{ path: ROUTES.myDomain, label: 'My Domain', icon: SomeIcon, group: 'observe' }],
  routes: [{ path: ROUTES.myDomain, page: MyPage }],
  dashboardPanels: [{ panelType: 'my-panel', kind: 'specialized', component: MyRenderer }],
};
```

All pages/renderers use `React.lazy()` for code splitting. Vite auto-chunks each feature into `feature-${name}` bundles.

## Dashboard Panel Lifecycle (LLD)

```
BackendDrivenPage (route match)
  → usePagesConfig / useDashboardTabDocument (fetch page JSON from backend)
  → ConfigurableDashboard (renders sections)
    → react-grid-layout (uses layout.w / layout.h from panel spec, 12-column model)
    → Each cell: useDashboardPanelRegistration(panelType) → resolve renderer
    → useComponentDataFetcher (batch-fetches panel data)
      → queryKey: ['component-query', teamId, method, endpoint, params, startMs, endMs]
      → placeholderData: keepPreviousData
    → useInvalidateQueriesOnAppRefresh(refreshKey, 'component-query', teamId)
      → invalidates matching queries on manual/auto refresh
```

**Panel renderer kinds:**
- `base-chart` — receives `BaseChartComponentProps` (generic data, height, valueKey)
- `specialized` — receives `DashboardPanelRendererProps` (full chartConfig + dataSources)
- `self-contained` — receives `DashboardPanelRendererProps`, fetches its own data

## Query Patterns (LLD)

| Scope | Key pattern | `refreshKey` in key? | Invalidation strategy |
|-------|-------------|---------------------|----------------------|
| Explorer queries | `[feature, endpoint, ...params, refreshKey]` | Yes | Key change triggers refetch |
| Dashboard component | `['component-query', teamId, endpoint, timeRange]` | **No** | `useInvalidateQueriesOnAppRefresh` |
| Dashboard datasource | `['datasource', teamId, endpoint, timeRange]` | **No** | `useInvalidateQueriesOnAppRefresh` |

**Conventions:**
- `placeholderData: keepPreviousData` on all queries — prevents loading flash
- Loading = `isPending && data === undefined` (not `isLoading`) — distinguishes initial load from background refresh
- `enabled: !!selectedTeamId`, `staleTime: 0`, `gcTime: 30_000`, `retry: false`

## Shared Hooks Reference (`src/shared/hooks/`)

| Hook | Purpose |
|------|---------|
| `useAutoRefresh` | Ticks `refreshKey` at configured interval; "Xs ago" label (throttled 5s) |
| `useInvalidateQueriesOnAppRefresh` | Invalidates `[scope, teamId]` queries when `refreshKey` bumps |
| `useComponentDataFetcher` | Batches dashboard panel data fetches; deduplicates identical requests |
| `useDataSourceFetcher` | Fetches shared data sources for dashboard panels |
| `useChartTimeBuckets` | Computes adaptive time buckets for chart x-axis |
| `useChartZoom` | Handles zoom-to-select on time-series charts |
| `useComparisonQuery` | Dual-period data fetch for comparison views |
| `useInfiniteLogs` | Infinite scroll for log explorer |
| `useSocketStream` | Live tail WebSocket client ([agent-docs](.agent/workflows/live_tail.md)) |
| `useTimeRangeQuery` | Time-range-aware query wrapper |
| `useTimeRangeURL` | Bidirectional URL ↔ time range sync |
| `useURLFilters` | Syncs filter state with URL params |
| `useUrlSyncedTab` | Persists active tab in URL |
| `usePersistedColumns` | Persists table column visibility |
| `useResizableColumns` | Column resize state |
| `usePagesConfig` | Fetches dashboard page configs |
| `useDashboardTabDocument` | Resolves tab document for a page |
| `usePageTabs` | Multi-tab page management |
| `useQueryState` | Generic query state sync |
| `useBreadcrumbs` | Track navigation breadcrumbs |
| `useKeyboardShortcuts` | Global keyboard shortcuts |
| `useAuthValidation` | Validates user session on mount |
| `useFeatureFlag` | Checks feature flag status |

## Type System Reference

| Type | Location | Purpose |
|------|----------|---------|
| `TimeRange` | `shared/types/index.ts` | Discriminated union: `RelativeTimeRange` (`kind: 'relative'`, `preset`, `minutes`) or `AbsoluteTimeRange` (`kind: 'absolute'`, `startMs`, `endMs`) |
| `DashboardPanelType` | `shared/types/dashboardConfig.ts` | Union of 25+ panel types: `'bar'`, `'line'`, `'stat-card'`, `'table'`, `'service-map'`, `'heatmap'`, `'gauge'`, `'pie'`, etc. |
| `DashboardLayoutVariant` | `shared/types/dashboardConfig.ts` | 10 layout presets: `'kpi'`, `'summary'`, `'standard-chart'`, `'wide-chart'`, `'ranking'`, `'hero'`, etc. |
| `DashboardSectionTemplate` | `shared/types/dashboardConfig.ts` | 8 section layouts: `'kpi-band'`, `'two-up'`, `'three-up'`, `'stacked'`, `'hero-plus-table'`, etc. |
| `DashboardPanelSpec` | `shared/types/dashboardConfig.ts` | Full panel config: type, layout (w/h/x/y), query, data keys, columns, formatter |
| `DomainConfig` | `app/registry/domainRegistry.ts` | Feature module registration: key, label, permissions, navigation, routes, dashboardPanels |
| `DashboardPanelRegistration` | `shared/components/ui/dashboard/dashboardPanelRegistry.tsx` | Panel renderer binding: panelType, kind, component, lifecycle hooks |

## ESLint Constraints

- **Feature isolation**: `no-restricted-imports` prevents `src/features/**` from importing other features' internals
- **No TS enums**: `no-restricted-syntax` on `TSEnumDeclaration` — use `as const` objects + union types
- **Strict async**: `@typescript-eslint/no-floating-promises` (error)
- **Import hygiene**: `import/no-cycle` (warn), `import/no-duplicates`, `import/order` (alphabetical grouping)
- **Type preference**: `consistent-type-definitions` enforces `interface` over `type` for object shapes

## Bundle Splitting

- All page components and dashboard renderers use `React.lazy()` in feature `index.ts`
- Vite config: `manualChunks` splits each feature into `feature-${name}` chunks
- Shared layer is a common chunk; Radix UI and other large deps are separate vendor chunks
- Bundle budget checks: `npm run ci:budgets` (via `scripts/check-budgets.js`)

---

## Frontend ↔ backend map (cross-repo)

Use when a change spans frontend and API. Backend paths refer to **`optikk-backend`**.

| Product area | This repo | Backend (`optikk-backend`) |
|--------------|-----------|----------------------------|
| Registry / route wiring | `domainRegistry.ts`, feature `index.ts` | `internal/app/server/modules_manifest.go` |
| Explorer APIs | Feature `api/` or `shared/api` | Matching `internal/modules/.../handler.go` |
| Metrics Explorer | `src/features/metrics` | `internal/modules/metricsexplorer` |
| Dashboard panels | `dashboard/renderers/`, `dashboardPanelRegistry` | `internal/infra/dashboardcfg/pages/`, panel types |
| Auth | `shared/api/auth/` | `internal/modules/user/auth/` |
| Default config fetch | `defaultConfigService.ts` | `internal/modules/dashboard/`, `internal/infra/dashboardcfg/` |

---

## Maintenance

When you add a **new feature domain**: new folder under `src/features/<name>/`, export config from `index.ts`, register in `domainRegistry.ts`, add routes to `routes.ts` and `appRoutes.tsx` as needed. Update this index when ownership or routes change.
