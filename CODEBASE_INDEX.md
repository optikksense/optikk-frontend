# Optik frontend — codebase index

Orientation for **optic-frontend** (React/Vite/TypeScript). Read this file and `.cursor/rules/optik-frontend.mdc` before substantive work in this repository.

## How assistants should use this document

- **Before** any substantive task: read **`CODEBASE_INDEX.md`** (this file), **`.cursor/rules/optik-frontend.mdc`**, and **`.agent/philosophy/`** for strategic alignment. Follow **`.cursor/rules/engineering-workflow.mdc`** for planning and quality bar.
- **Plan before code:** Produce a plan (with options where appropriate) and **do not change code until the user approves** the plan, except for trivial one-line/typo fixes.
- **Agent Philosophy**: Mandatory reading for staff-level alignment:
  - **ADR-001**: [adr-001-modernization.md](file:///Users/ramantayal/pro/optic-frontend/.agent/philosophy/adr-001-modernization.md)
  - **Highest Standards**: [highest-standards.md](file:///Users/ramantayal/pro/optic-frontend/.agent/philosophy/highest-standards.md)
  - **Vision**: [vision-and-roadmap.md](file:///Users/ramantayal/pro/optic-frontend/.agent/philosophy/vision-and-roadmap.md)
  - **SLOs**: [performance-and-slos.md](file:///Users/ramantayal/pro/optic-frontend/.agent/philosophy/performance-and-slos.md)
  - **Design**: [design-principles.md](file:///Users/ramantayal/pro/optic-frontend/.agent/philosophy/design-principles.md)
- **Tooling**: This repository uses **Biome** (`biome.json`) for linting, formatting, and import organization. ESLint and Prettier have been removed.
- **Agent Rules**: No Python scripts; conventional commits; direct imports only (no barrels); import type for TS types.

## Related repository

The HTTP API and dashboard JSON live in the sibling repo **`optikk-backend`** (see that repo's `CODEBASE_INDEX.md`). This frontend implements explorers, dashboard runtime, and the panel registry against those APIs.

**Hybrid model:** backend-authored dashboards (JSON + default config), frontend-owned explorer routes and feature modules, shared dashboard panel registry and API decode boundary.

---

## Stack and commands

- **Stack:** React 19, Vite 8, TypeScript, TanStack Query v5, TanStack Router, Zod, Tailwind 3.4, Zustand 5, uPlot 1.6, React Grid Layout 2.2.
- **Dev:** `npm run dev` (Vite dev server with API proxy + WebSocket support for live tail).
- **Quality:** `npm run ci` (type-check, lint, build, bundle budgets).

## Entry and app shell

| File | Purpose |
|------|---------|
| `src/main.tsx` | App bootstrap |
| `src/app/App.tsx` | Root router and providers |
| `src/app/routes/router.tsx` | Route table (domain routes + legacy redirects + drawer routes) |
| `src/app/routes/BackendDrivenPage.tsx` | Backend-driven dashboard pages: matches URL → page config → domain adapter or generic `DashboardPage` |
| `src/app/layout/MainLayout.tsx` | Shell layout |

**Service page:** `ROUTES.service` → `src/features/overview/pages/ServiceHubPage` — fully frontend-owned, no backend default config. Two tabs via `?view=discovery|topology` (default `discovery`): the **Discovery** tab (`discovery/` — service catalog with search, health filter, sort; fetches `/overview/services` + `/services/topology`, merges client-side for upstream/downstream dep counts and health badges) and the **Topology** tab (`TopologyView.tsx` + `topology/`). Row click on Discovery opens `drawerEntity=service` with the frontend-owned `ServiceDetailDrawer`, which shows compact service diagnostics and links into Logs and Traces.

## Path aliases (Vite)

Defined in `vite.config.ts`. Common imports:

- `@/` → `src/`
- `@features/` → `src/features/`
- `@shared/` → `src/shared/`
- `@app/` → `src/app/`
- `@config/` → `src/config/`
- `@components`, `@hooks`, `@services` → shared components, hooks, API layer under `src/shared/`
- `@entities` → `src/shared/entities/`
- `@store` → `src/app/store/`
- `@optikk/design-system` → `src/design-system/`

## Domain registry (feature ownership)

All product domains are registered in **`src/app/registry/domainRegistry.ts`**. 7 domains in order:

1. **overview** — Overview, Saturation, Service detail adapter (3 dashboard page adapters, 6 panel renderers)
2. **metrics** — Metrics Explorer, Saturation hub page, Kafka detail pages (3 panel renderers)
3. **logs** — Log search + live tail (1 route, 1 panel renderer: `log-histogram`)
4. **traces** — Traces explorer, detail, comparison (3 routes, 1 panel renderer: `trace-waterfall`)
5. **infrastructure** — Infrastructure hub page (1 dashboard page adapter)
6. **ai** — LLM Monitoring: Overview, Explorer, Span Detail, Model Catalog, Model Detail, Conversations (7 routes). Integrated with gen_ai.* OTel attributes.
7. **alerts** — Alerts & Monitors hub, rule builder, rule detail (3 routes). Header bell polls `/api/v1/alerts/incidents`; `CreateAlertButton` is the "Create alert from this view" entry point used on MetricsExplorer and ServiceHub. Command palette contributes `Create alert`, `Go to alerts`, `Mute rule`, `Ack instance`.
8. **settings** — User/team settings (1 route)

Each feature's `index.ts` exports a **domain config**: navigation, explorer `routes`, optional `dashboardPages` and `dashboardPanels`.

**Utility functions** from `domainRegistry.ts`:
- `getDomainNavigationItems()` — flattens all navigation items
- `getExplorerRoutes()` — gets all routes with domain metadata
- `resolveRegisteredExplorerRoute(pathname)` — route matcher
- `getDashboardPageAdapters()` — dashboard page registry
- `getDashboardPanelRegistrations()` — dashboard panel renderers from all domains

## Route constants (`src/shared/constants/routes.ts`)

| Area | Routes |
|------|--------|
| Marketing | `/login`, `/product`, `/`, `/pricing`, `/opentelemetry`, `/self-host` |
| Alerts | `/alerts`, `/alerts/rules/new`, `/alerts/rules/:ruleId`, `/alerts/rules/:ruleId/edit` |
| Overview | `/overview`, `/service`, `/saturation` |
| Logs | `/logs` |
| Traces | `/traces`, `/traces/:traceId`, `/traces/compare` |
| Metrics | `/metrics` |
| Infrastructure | `/infrastructure` |
| Errors | `/errors` |
| Saturation detail | `/saturation/kafka/topics/:topic`, `/saturation/kafka/groups/:groupId` |
| AI | `/ai-observability`, `/ai-explorer`, `/ai-explorer/:spanId`, `/ai-models`, `/ai-models/:modelName`, `/ai-conversations`, `/ai-conversations/:conversationId` |
| Settings | `/settings` |

**Legacy drawer redirects** (in `router.tsx`): `/errors/:errorGroupId`, `/infrastructure/nodes/:host`, `/saturation/database/:dbSystem`, `/saturation/redis/:instance`, `/saturation/kafka/topics/:topic`, `/saturation/kafka/groups/:groupId`, `/ai-observability/models/:modelName`

## Feature folders (`src/features/<domain>/`)

| Subfolder | Typical contents |
|-----------|-------------------|
| `pages/` | Explorer or detail pages |
| `dashboard/` | Panel renderers for that domain (backend-driven UI) |
| `components/`, `hooks/`, `store/` | Domain UI and state |
| `api/` or `services/` | Domain API wrappers (often calling `@shared/api`) |
| `utils/`, `types.ts`, `constants.ts` | Domain utilities |

### Feature domain details

| Domain | Key | Pages | Routes | Dashboard pages | Panel renderers |
|--------|-----|-------|--------|----------------|----------------|
| Overview | `overview` | OverviewHubPage, ServiceHubPage | 0 | overview, saturation, service | service-health-grid, slo-indicators, error-hotspot-ranking, latency-histogram, latency-heatmap, db-systems-overview |
| Metrics | `metrics` | MetricsExplorerPage, SaturationHubPage, KafkaTopicDetailPage, KafkaGroupDetailPage | 0 | — | latency-histogram, latency-heatmap, db-systems-overview |
| Logs | `logs` | LogsHubPage | `/logs` | — | log-histogram |
| Traces | `traces` | TracesPage, TraceDetailPage, TraceComparisonPage | `/traces`, `/traces/:traceId`, `/traces/compare` | — | trace-waterfall |
| Infrastructure | `infrastructure` | InfrastructureHubPage | 0 | infrastructure | — |
| AI | `ai` | AiOverviewPage, AiExplorerPage, AiSpanDetailPage, AiModelCatalogPage, AiModelDetailPage, AiConversationsPage, AiConversationDetailPage | `/ai-observability`, `/ai-explorer`, `/ai-explorer/:spanId`, `/ai-models`, `/ai-models/:modelName`, `/ai-conversations`, `/ai-conversations/:conversationId` | — | — |
| Alerts | `alerts` | AlertsHubPage, AlertRuleBuilderPage, AlertRuleDetailPage | `/alerts`, `/alerts/rules/new`, `/alerts/rules/$ruleId`, `/alerts/rules/$ruleId/edit` | — | — |
| Settings | `settings` | SettingsPage (Profile, Team, Preferences tabs) | `/settings` | — | — |

### Explorer Core (`src/features/explorer-core/`)

Shared infrastructure for all data explorers (Logs, Traces, Metrics) — **not a registered domain**:
- **Components**: `AnalyticsToolbar.tsx`, `FacetRail.tsx`, `ExplorerResultsTable.tsx`, `SummaryMetricStrip.tsx`
- **Visualizations**: `AnalyticsTimeseries.tsx`, `AnalyticsTopList.tsx`, `AnalyticsTable.tsx`, `AnalyticsPieChart.tsx`
- **Hooks**: `useExplorerAnalytics.ts`, `useLiveTailStream.ts` (native WebSocket `/api/v1/ws/live`)
- **API**: `explorerAnalyticsApi.ts` — `POST /api/v1/explorer/:scope/analytics`
- **Utils**: `urlState.ts`, `analyticsResult.ts`, `timeRange.ts`, `explorerQuery.ts`

| Page | Path | Purpose |
|------|------|---------|
| AiOverviewPage | `/ai-observability` | LLM Monitoring Overview (Health, Throughput, Model Performance) |
| AiExplorerPage | `/ai-explorer` | High-density LLM Run Explorer with facet filtering |
| AiSpanDetailPage | `/ai-explorer/:spanId` | LLM Span deep dive (Parameters, Token breakdown, PII, Messages) |
| AiModelCatalogPage | `/ai-models` | Model listing, cost tracking, and economics |
| AiModelDetailPage | `/ai-models/:modelName` | Model-specific latencies, errors, and parameter impact |
| AiConversationsPage | `/ai-conversations` | Conversation tracking and thread list |
| AiConversationDetailPage | `/ai-conversations/:conversationId` | Conversation session view (turns, participants, thread summary) |

**API files**: `aiService.ts` (centralized for all 37 AI endpoints)

**Technical Logic**: Built on TanStack Query with `useTimeRangeQuery` integration. Displays high-density telemetry from `observability.spans` filtered by OTel `gen_ai.*` semantic attributes. Cost calculation is performant, using static multipliers from the backend price map.

## Shared Layer (`src/shared/`)

| Area | Path | Notes |
|------|------|--------|
| HTTP client | `shared/api/api/client.ts` | Axios with auth interceptors; auto-unwraps `APIResponse` envelope |
| Response decode | `shared/api/utils/decode.ts` | Zod validation boundary |
| Default config | `shared/api/defaultConfigService.ts` | `GET /v1/default-config/pages`, `.../tabs`, `.../tabs/:tabId` |
| Dashboard UI | `shared/components/ui/dashboard/` | `ConfigurableDashboard.tsx`, `dashboardPanelRegistry.tsx`, `DashboardPage.tsx`, `DashboardEntityDrawer.tsx` |
| Auth | `shared/api/auth/` | Session cookies with `withCredentials: true` |
| Entities | `shared/entities/` | Domain entity types: `log/`, `metric/`, `trace/`, `user/` |
| Design system | `design-system/` (aliased `@optikk/design-system`) | Shared components and providers |
| Radix primitives | `shared/components/primitives/ui/` | **Import Tabs/Tooltip/Dialog/etc. from `@shared/components/primitives/ui`, NOT `@shared/components/ui`** — the latter does not re-export Radix primitives |

### Adding npm packages (React 19 peer-dep gotcha)

The project is on React 19 but several deps (e.g. `lucide-react@0.316`) still pin `react@^18` in `peerDependencies`. `npm install <pkg>` fails with `EResolve`. Use:

```bash
npm install --legacy-peer-deps <pkg>
```

Applies to any new package; verified for `@xyflow/react`, `dagre`, `@types/dagre`.

### Charting Engine (`src/shared/components/ui/charts/`)

- **`UPlotChart.tsx`**: Primary time-series renderer. **Mandatory Pattern**: use `setData()` for flicker-free auto-refresh updates. Pass **`options` from `useMemo`** so parent re-renders do not rebuild uPlot on every tick.
- **`ObservabilityChart.tsx`**: High-level wrapper with legend and tooltip logic (memoized `options`).
- **`GrafanaChart.tsx`**: Grafana integration chart.

**Chart categories:**

| Category | Components |
|----------|-----------|
| Time-series | `RequestChart`, `ErrorRateChart`, `ExceptionTypeLineChart`, `LatencyChart` (under `charts/time-series/`) |
| Distributions | `LatencyHistogram`, `LogHistogram` (under `charts/distributions/`) |
| Micro/embedded | `DonutChart`, `EndpointList`, `GaugeChart`, `SparklineChart` (under `charts/micro/`) |
| Specialized | `BurnRateChart`, `Flamegraph`, `GoldenSignalsHeatmap`, `LatencyHeatmapChart`, `N1QueryDetector`, `PodLifecycleGantt`, `WaterfallChart` (under `charts/specialized/`) |

## Dashboard Panel Registry

### Built-in panels (`shared/components/ui/dashboard/builtInDashboardPanels.tsx`)

| Panel type | Kind | Component |
|-----------|------|-----------|
| `request` | base-chart | RequestChart (lazy) |
| `error-rate` | base-chart | ErrorRateChart (lazy) |
| `exception-type-line` | base-chart | ExceptionTypeLineChart (lazy) |
| `latency` | base-chart | LatencyChart (lazy) |
| `table` | specialized | TableRenderer |
| `bar` | specialized | BarRenderer |
| `gauge` | specialized | GaugeRenderer |
| `heatmap` | specialized | HeatmapRenderer |
| `pie` | specialized | PieRenderer |
| `stat-cards-grid` | specialized | StatCardsGridRenderer |
| `stat-card` | self-contained | StatCardRenderer |
| `stat-summary` | self-contained | StatSummaryRenderer |

### Domain-contributed panels

| Panel type | Domain | Component |
|-----------|--------|-----------|
| `service-health-grid` | overview | ServiceHealthGridRenderer |
| `slo-indicators` | overview | SloIndicatorsRenderer |
| `error-hotspot-ranking` | overview | ErrorHotspotRankingRenderer |
| `latency-histogram` | metrics (registered via overview) | LatencyHistogramRenderer |
| `latency-heatmap` | metrics (registered via overview) | LatencyHeatmapRenderer |
| `db-systems-overview` | metrics (registered via overview) | DbSystemsRenderer |
| `log-histogram` | logs | LogHistogramRenderer |
| `trace-waterfall` | traces | TraceWaterfallRenderer |
| `ai-line` | ai | AiLineRenderer |
| `ai-bar` | ai | AiBarRenderer |

### Dashboard runtime components (`shared/components/ui/dashboard/`)

| Component | Purpose |
|-----------|---------|
| `DashboardPage.tsx` | Root page: loads tabs, handles tab switching via URL |
| `DashboardTabContent.tsx` | Renders sections and panels for active tab |
| `DashboardSection.tsx` | Section with collapsible header |
| `DashboardPanelGrid.tsx` | CSS Grid container (12-column model) |
| `ConfigurableChartCard.tsx` | Panel card wrapper with error/no-data overlays |
| `ConfigurableDashboard.tsx` | Top-level dashboard orchestrator |
| `DashboardEntityDrawer.tsx` | Detail drawer for entities |
| `DashboardStatCards.tsx` | Stat cards row |
| `panelSizePolicy.ts` | Grid sizing logic |
| `dashboardAggregators.tsx` | Data transformation: grouping, normalization |

**Drawer entities:** `aiModel`, `databaseSystem`, `errorGroup`, `kafkaGroup`, `kafkaTopic`, `node`, `redisInstance`

## Global State & Auto-Refresh

- **`src/app/store/appStore.ts`**: Unified Zustand store.

**Persisted state:** `selectedTeamId`, `selectedTeamIds`, `timeRange`, `sidebarCollapsed`, `autoRefreshInterval` (default 10000ms), `theme` (default 'dark'), `notificationsEnabled`, `viewPreferences`, `recentPages`, `recentTimeRanges`, `timezone` (default 'local'), `comparisonMode` (default 'off')

**Runtime state:** `refreshKey` (incremented to trigger data refetch)

**Selectors:** `useTimeRange()`, `useTeamId()`, `useTeamIds()`, `useRefreshKey()`, `useSidebarCollapsed()`, `useTheme()`, `useTimezone()`, `useComparisonMode()`

- **`src/shared/hooks/useAutoRefresh.ts`**: Ticks the `refreshKey` at configured intervals.
- **`src/shared/hooks/useInvalidateQueriesOnAppRefresh.ts`**: Triggers TanStack Query invalidation when the global refresh is clicked.

## Live Tail Streaming

WebSocket-based real-time streaming over native WebSocket to `/api/v1/ws/live`.

| Hook | File | Purpose |
|------|------|---------|
| `useSocketStream` | `src/shared/hooks/useSocketStream.ts` | Core WebSocket hook: manages connection, subscription, item streaming, deduplication via `getItemKey`, timestamp-ordered insertion, lag/dropped metrics. Status: `idle` → `connecting` → `live` → `closed`/`error` |
| `useLiveTailStream` | `src/features/explorer-core/hooks/useLiveTailStream.ts` | Wrapper that injects `teamId` context. Accepts `subscribeEvent` (e.g. `subscribe:logs`), `itemEvent`, `params`, `maxItems`, `normalizeItem`, `getItemKey`, `getItemTimestamp` |

**Protocol:** Client sends JSON `{op: "subscribe:logs", ...params}`, server streams `{event: "log", data: ...}` + heartbeat every 15s.

**Vite proxy:** `/api` proxied to backend with `ws: true` for dev environment.

**Used by:** Logs domain (`useLogsHubData` hook), Traces planned.

See `.agent/workflows/live_tail.md` for full architecture docs.

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
  → matchPath against page.path patterns (supports params like /trace/:traceId)
  → resolveDashboardPageAdapter(pageId) — domain-specific or generic DashboardPage
  → usePagesConfig / useDashboardTabDocument (fetch page JSON from backend)
  → ConfigurableDashboard (renders sections)
    → react-grid-layout (uses layout.w / layout.h from panel spec, 12-column model)
    → Each cell: useDashboardPanelRegistration(panelType) → resolve renderer
    → useComponentDataFetcher (batch-fetches panel data, deduplicates by endpoint)
      → queryKey: ['component-query', teamId, method, endpoint, params, startMs, endMs]
      → placeholderData: keepPreviousData
    → useInvalidateQueriesOnAppRefresh(refreshKey, 'component-query', teamId)
      → invalidates matching queries on manual/auto refresh
```

**Panel renderer kinds:**
- `base-chart` — receives `BaseChartComponentProps` (generic data, height, valueKey)
- `specialized` — receives `DashboardPanelRendererProps` (full chartConfig + dataSources)
- `self-contained` — receives `DashboardPanelRendererProps`, fetches its own data

**Lifecycle hooks:** `onMount`, `onUnmount`, `onGlobalTimeChange`, `onDataUpdate`

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
| `useDataSourceFetcher` | Fetches shared data sources for dashboard panels with path param interpolation |
| `useSocketStream` | Core WebSocket client for `/api/v1/ws/live`: connection, dedup, lag tracking |
| `useChartTimeBuckets` | Computes adaptive time buckets for chart x-axis |
| `useChartZoom` | Handles zoom-to-select on time-series charts |
| `useComparisonQuery` | Dual-period data fetch for comparison views |
| `useInfiniteLogs` | Infinite scroll for log explorer |
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
| `DashboardPanelType` | `shared/types/dashboardConfig.ts` | Union of 24 panel types (matches backend `enums.go`) |
| `DashboardLayoutVariant` | `shared/types/dashboardConfig.ts` | 10 layout presets: `kpi`, `summary`, `standard-chart`, `wide-chart`, `ranking`, `hero`, etc. |
| `DashboardSectionTemplate` | `shared/types/dashboardConfig.ts` | 8 section layouts: `kpi-band`, `two-up`, `three-up`, `stacked`, `hero-plus-table`, etc. |
| `DashboardPanelSpec` | `shared/types/dashboardConfig.ts` | Full panel config: type, layout (w/h/x/y), query, data keys, columns, formatter |
| `DashboardTabDocument` | `shared/types/dashboardConfig.ts` | Tab with sections and panels |
| `DomainConfig` | `app/registry/domainRegistry.ts` | Feature module registration: key, label, permissions, navigation, routes, dashboardPanels |
| `DashboardPanelRegistration` | `shared/components/ui/dashboard/dashboardPanelRegistry.tsx` | Panel renderer binding: panelType, kind, component, lifecycle hooks |
| `DrawerEntity` | `shared/types/dashboardConfig.ts` | Drawer entity types: aiModel, databaseSystem, errorGroup, kafkaGroup, kafkaTopic, node, redisInstance |

## ESLint Constraints

- **Feature isolation**: `no-restricted-imports` prevents `src/features/**` from importing other features' internals
- **No TS enums**: `no-restricted-syntax` on `TSEnumDeclaration` — use `as const` objects + union types
- **Strict async**: `@typescript-eslint/no-floating-promises` (error)
- **Import hygiene**: `import/no-cycle` (warn), `import/no-duplicates`, `import/order` (alphabetical grouping)
- **Type preference**: `consistent-type-definitions` enforces `interface` over `type` for object shapes

## Bundle Splitting

- All page components and dashboard renderers use `React.lazy()` in feature `index.ts`
- Vite `manualChunks`: `feature-${name}` per feature, `marketing-runtime`, `ui-runtime` (radix, lucide), `chart-runtime` (uplot), `data-runtime` (axios, tanstack, zod)
- Bundle budget checks: `npm run ci:budgets` (via `scripts/check-budgets.js`)

---

## Frontend ↔ backend map (cross-repo)

Use when a change spans frontend and API. Backend paths refer to **`optikk-backend`**.

| Product area | This repo | Backend (`optikk-backend`) |
|--------------|-----------|----------------------------|
| Registry / route wiring | `domainRegistry.ts`, feature `index.ts` | `internal/app/server/modules_manifest.go` |
| Explorer APIs | Feature `api/` or `shared/api` | Matching `internal/modules/.../handler.go` |
| Explorer analytics | `explorer-core/api/explorerAnalyticsApi.ts` | `internal/modules/explorer/analytics/` |
| Metrics Explorer | `src/features/metrics` (`metricsExplorerApi.ts`) | `internal/modules/metricsexplorer` (`/metrics/names`, `/:metricName/tags`, `/explorer/query`) |
| Dashboard panels | `dashboard/renderers/`, `dashboardPanelRegistry` | `internal/infra/dashboardcfg/`, panel types in `enums.go` |
| Dashboard config API | `defaultConfigService.ts` | `internal/modules/dashboard/` |
| Default pages | Dashboard page adapters | `internal/infra/dashboardcfg/defaults/{overview,service,ai_observability,infrastructure,saturation}/` |
| Auth | `shared/api/auth/` | `internal/modules/user/auth/` |
| AI Observability | `src/features/ai/api/aiService.ts` | `internal/modules/ai/{overview,explorer,spandetail,analytics}/` |
| Logs live tail | `useSocketStream` → `useLiveTailStream` | `internal/modules/logs/search/livetail_run.go`, `internal/infra/livetailws/` |
| Overview | `src/features/overview/` | `internal/modules/overview/{overview,errors,slo}/` |
| Infrastructure | `src/features/infrastructure/` | `internal/modules/infrastructure/*/`, `internal/infra/dashboardcfg/defaults/infrastructure/` |
| Saturation | `src/features/metrics/pages/SaturationHubPage` | `internal/modules/saturation/database/*/`, `saturation/kafka/` |
| Traces | `src/features/traces/api/` | `internal/modules/traces/{query,explorer,tracedetail,redmetrics,errorfingerprint,errortracking,tracecompare}/` |

---

## Maintenance

When you add a **new feature domain**: new folder under `src/features/<name>/`, export config from `index.ts`, register in `domainRegistry.ts`, add routes to `routes.ts` and `router.tsx` as needed. Update this index when ownership or routes change.
